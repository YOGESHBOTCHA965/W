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

  // Password policy tracking
  passwordPolicy = {
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  };
  passwordStrength = 0; // 0-5
  showPasswordPolicy = false;

  // Security question options
  securityQuestions: string[] = [
    'What was the name of your first pet?',
    'What city were you born in?',
    'What is your mother\'s maiden name?',
    'What was the name of your first school?',
    'What is your favourite movie?',
    'What is your childhood nickname?'
  ];

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
      password: '',
      securityQuestion: '',
      securityAnswer: ''
    };
  }

  ngOnInit() {
    // If already logged in, redirect to home
    if (this.service.getUserLoginStatus()) {
      this.router.navigate(['home']);
    }
  }

  checkPasswordPolicy(password: string): void {
    this.showPasswordPolicy = password.length > 0;
    this.passwordPolicy.minLength = password.length >= 8;
    this.passwordPolicy.hasUppercase = /[A-Z]/.test(password);
    this.passwordPolicy.hasLowercase = /[a-z]/.test(password);
    this.passwordPolicy.hasNumber = /[0-9]/.test(password);
    this.passwordPolicy.hasSpecial = /[^A-Za-z0-9]/.test(password);

    // Calculate strength (0-5)
    this.passwordStrength = Object.values(this.passwordPolicy).filter(v => v).length;
  }

  getStrengthLabel(): string {
    if (this.passwordStrength <= 1) return 'Very Weak';
    if (this.passwordStrength === 2) return 'Weak';
    if (this.passwordStrength === 3) return 'Fair';
    if (this.passwordStrength === 4) return 'Strong';
    return 'Very Strong';
  }

  getStrengthColor(): string {
    if (this.passwordStrength <= 1) return '#E74C3C';
    if (this.passwordStrength === 2) return '#E67E22';
    if (this.passwordStrength === 3) return '#F39C12';
    if (this.passwordStrength === 4) return '#27AE60';
    return '#2ECC71';
  }

  isPasswordValid(): boolean {
    return this.passwordStrength === 5;
  }

  signUp(regForm: any) {
    if (!this.isPasswordValid()) {
      this.toastr.error('Please meet all password requirements before signing up.', 'Weak Password');
      return;
    }

    if (regForm.password !== regForm.confirmPassword) {
      this.toastr.error('Passwords do not match.', 'Error');
      return;
    }

    if (!regForm.securityQuestion || !regForm.securityAnswer?.trim()) {
      this.toastr.error('Please select a security question and provide an answer.', 'Error');
      return;
    }

    const userData = {
      firstName: regForm.firstName,
      lastName: regForm.lastName,
      dob: regForm.dob,
      gender: regForm.gender,
      contactNo: regForm.contactNo,
      emailId: regForm.emailId,
      password: regForm.password,
      securityQuestion: regForm.securityQuestion,
      securityAnswer: regForm.securityAnswer.trim().toLowerCase()
    };

    this.service.registerUser(userData).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(res.message, 'Success');
          this.router.navigate(['login']);
        } else {
          this.toastr.error(res.message, 'Registration Failed');
        }
      },
      error: (err) => {
        const msg = err.error?.message || 'Server error. Please try again.';
        this.toastr.error(msg, 'Registration Failed');
      }
    });
  }
}
