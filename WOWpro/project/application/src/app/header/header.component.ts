import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  loginStatus: any;
  mobileMenuOpen = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getLoginStatus().subscribe((loginStatusData: any) => {
      this.loginStatus = loginStatusData;
    });
  }

  isLoggedIn(): boolean {
    return this.userService.getUserLoginStatus();
  }

  getUserName(): string {
    return this.userService.getCurrentUserName();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}
