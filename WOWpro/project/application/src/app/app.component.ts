import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'WOW - Work On Wheels';
  private currentRoute = '';
  private hideHeaderRoutes = ['', 'login', 'signup'];

  constructor(private router: Router) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.urlAfterRedirects.split('/')[1] || '';
    });
  }

  showHeaderFooter(): boolean {
    return !this.hideHeaderRoutes.includes(this.currentRoute);
  }
}
