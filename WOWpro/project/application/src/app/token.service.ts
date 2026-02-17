/**
 * ═══════════════════════════════════════════════════════
 *  Token Service  ·  Secure JWT token management
 * ═══════════════════════════════════════════════════════
 *  • Stores access & refresh tokens in localStorage
 *  • Handles token refresh via /api/auth/refresh
 *  • NOTE: For maximum security, use HttpOnly cookies
 *    (requires server-side cookie setup). localStorage
 *    is acceptable for SPAs without XSS vulnerabilities.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private readonly ACCESS_TOKEN_KEY  = 'wow_access_token';
  private readonly REFRESH_TOKEN_KEY = 'wow_refresh_token';

  constructor(private http: HttpClient) {}

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  hasTokens(): boolean {
    return !!this.getAccessToken() && !!this.getRefreshToken();
  }

  /**
   * Call the server to get a new access token using the refresh token.
   * Called by JwtInterceptor when a 401 TOKEN_EXPIRED is received.
   */
  refreshAccessToken(refreshToken: string): Observable<any> {
    return this.http.post('/api/auth/refresh', { refreshToken });
  }
}
