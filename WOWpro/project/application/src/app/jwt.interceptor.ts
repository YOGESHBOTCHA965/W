/**
 * ═══════════════════════════════════════════════════════
 *  JWT Interceptor  ·  Angular HttpInterceptor
 * ═══════════════════════════════════════════════════════
 *  • Attaches Bearer token to every outgoing HTTP request
 *  • Auto-refreshes expired tokens using refresh token
 *  • Queues concurrent requests during token refresh
 *  • Redirects to /login on auth failure
 */

import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenService } from './token.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip auth header for login/register/refresh/forgot-password endpoints
    if (this.isPublicEndpoint(req.url)) {
      return next.handle(req);
    }

    // Attach access token
    const token = this.tokenService.getAccessToken();
    if (token) {
      req = this.addToken(req, token);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // If 401 with TOKEN_EXPIRED, try refreshing
        if (error.status === 401 && error.error?.code === 'TOKEN_EXPIRED') {
          return this.handle401(req, next);
        }

        // If 401 for other reasons, force logout
        if (error.status === 401) {
          this.tokenService.clearTokens();
          this.router.navigate(['/login']);
        }

        return throwError(() => error);
      })
    );
  }

  private addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  private handle401(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.tokenService.getRefreshToken();
      if (!refreshToken) {
        this.isRefreshing = false;
        this.tokenService.clearTokens();
        this.router.navigate(['/login']);
        return throwError(() => new Error('No refresh token'));
      }

      return this.tokenService.refreshAccessToken(refreshToken).pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          this.tokenService.saveTokens(response.accessToken, response.refreshToken);
          this.refreshTokenSubject.next(response.accessToken);
          return next.handle(this.addToken(req, response.accessToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.tokenService.clearTokens();
          this.router.navigate(['/login']);
          return throwError(() => err);
        })
      );
    } else {
      // Queue other requests while refreshing
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next.handle(this.addToken(req, token!)))
      );
    }
  }

  private isPublicEndpoint(url: string): boolean {
    const publicPaths = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/refresh',
      '/api/auth/forgot-password',
      '/api/auth/verify-otp',
      '/api/auth/verify-identity',
      '/api/auth/reset-password',
      '/api/auth/security-question'
    ];
    return publicPaths.some(path => url.includes(path));
  }
}
