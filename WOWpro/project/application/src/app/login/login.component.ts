import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginError = '';
  private returnUrl = '/home';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    // Capture the return URL from query params (set by AuthGuard)
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';

    // If already logged in, redirect to home
    if (this.service.getUserLoginStatus()) {
      this.router.navigateByUrl(this.returnUrl);
    }
  }

  isLoading = false;

  login(loginForm: any) {
    this.loginError = '';
    this.isLoading = true;

    this.service.loginUser(loginForm.emailId, loginForm.password).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.toastr.success('Welcome, ' + res.user!.firstName + '!', 'Login Successful');
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.loginError = res.message;
          this.toastr.error(res.message, 'Login Failed');
        }
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Server error. Please try again.';
        this.loginError = msg;
        this.toastr.error(msg, 'Login Failed');
      }
    });
  }
}
