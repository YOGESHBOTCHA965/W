import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignUpComponent implements OnInit {

  user: any;

  constructor(
    private service: UserService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.user = {
      firstName: '',
      lastName: '',
      dob: '',
      gender: '',
      contactNo: '',
      emailId: '',
      password: ''
    };
  }

  ngOnInit() {
    // If already logged in, redirect to home
    if (this.service.getUserLoginStatus()) {
      this.router.navigate(['home']);
    }
  }

  signUp(regForm: any) {
    this.user.firstName = regForm.firstName;
    this.user.lastName = regForm.lastName;
    this.user.dob = regForm.dob;
    this.user.gender = regForm.gender;
    this.user.contactNo = regForm.contactNo;
    this.user.emailId = regForm.emailId;
    this.user.password = regForm.password;

    const result = this.service.registerUser(this.user);

    if (result.success) {
      this.toastr.success(result.message, 'Success');
      this.router.navigate(['login']);
    } else {
      this.toastr.error(result.message, 'Registration Failed');
    }
  }
}
