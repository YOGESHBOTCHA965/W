import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginError = '';

  constructor(
    private router: Router,
    private service: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    // If already logged in, redirect to home
    if (this.service.getUserLoginStatus()) {
      this.router.navigate(['home']);
    }
  }

  login(loginForm: any) {
    this.loginError = '';

    const result = this.service.loginUser(loginForm.emailId, loginForm.password);

    if (result.success) {
      this.toastr.success('Welcome, ' + result.user!.firstName + '!', 'Login Successful');
      this.router.navigate(['home']);
    } else {
      this.loginError = result.message;
      this.toastr.error(result.message, 'Login Failed');
    }
  }
}
