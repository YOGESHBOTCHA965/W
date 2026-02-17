import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  // Step 1: Email input → sends OTP + gets security question
  // Step 2: OTP verification OR Security question + DOB
  // Step 3: Set new password
  step = 1;

  email = '';
  otp = '';
  dob = '';
  securityQuestion = '';
  securityAnswer = '';
  newPassword = '';
  confirmPassword = '';
  errorMsg = '';
  resetToken = '';      // received after successful verification
  isLoading = false;
  otpSent = false;

  // Verification method: 'otp' or 'security'
  verifyMethod: 'otp' | 'security' = 'otp';

  // Password policy (reused from signup)
  passwordPolicy = {
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  };
  passwordStrength = 0;
  showPasswordPolicy = false;

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  // Step 1: Send OTP email + fetch security question
  verifyEmail(): void {
    this.errorMsg = '';
    if (!this.email.trim()) {
      this.errorMsg = 'Please enter your email address.';
      return;
    }
    this.isLoading = true;

    this.userService.forgotPassword(this.email.trim()).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.otpSent = true;
        if (res.hasSecurityQuestion && res.securityQuestion) {
          this.securityQuestion = res.securityQuestion;
        }
        this.toastr.success('If an account exists, an OTP has been sent to your email.', 'OTP Sent');
        this.step = 2;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.message || 'Server error. Please try again.';
      }
    });
  }

  // Switch between OTP and security question verification
  switchToOtp(): void { this.verifyMethod = 'otp'; this.errorMsg = ''; }
  switchToSecurity(): void { this.verifyMethod = 'security'; this.errorMsg = ''; }

  // Step 2a: Verify OTP (from email)
  verifyOtp(): void {
    this.errorMsg = '';
    if (!this.otp.trim() || this.otp.length !== 6) {
      this.errorMsg = 'Please enter the 6-digit OTP.';
      return;
    }
    this.isLoading = true;

    this.userService.verifyOtp(this.email.trim(), this.otp.trim()).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.resetToken) {
          this.resetToken = res.resetToken;
          this.step = 3;
        } else {
          this.errorMsg = res.message || 'OTP verification failed.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.message || 'Invalid OTP.';
      }
    });
  }

  // Step 2b: Verify security answer + DOB
  verifyIdentity(): void {
    this.errorMsg = '';

    if (!this.securityAnswer.trim()) {
      this.errorMsg = 'Please answer the security question.';
      return;
    }
    if (!this.dob) {
      this.errorMsg = 'Please enter your date of birth.';
      return;
    }
    this.isLoading = true;

    this.userService.verifyIdentity(this.email.trim(), this.securityAnswer, this.dob).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.resetToken) {
          this.resetToken = res.resetToken;
          this.step = 3;
        } else {
          this.errorMsg = res.message || 'Verification failed.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.message || 'Verification failed.';
      }
    });
  }

  // Password policy checker
  checkPasswordPolicy(password: string): void {
    this.showPasswordPolicy = password.length > 0;
    this.passwordPolicy.minLength = password.length >= 8;
    this.passwordPolicy.hasUppercase = /[A-Z]/.test(password);
    this.passwordPolicy.hasLowercase = /[a-z]/.test(password);
    this.passwordPolicy.hasNumber = /[0-9]/.test(password);
    this.passwordPolicy.hasSpecial = /[^A-Za-z0-9]/.test(password);
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

  // Step 3: Reset password (server-side with resetToken)
  resetPassword(): void {
    this.errorMsg = '';

    if (!this.isPasswordValid()) {
      this.errorMsg = 'Please meet all password requirements.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMsg = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;

    this.userService.resetPassword(this.email.trim(), this.newPassword, this.resetToken).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.toastr.success('Password reset successfully! Please login with your new password.', 'Success');
          this.router.navigate(['/login']);
        } else {
          this.errorMsg = res.message;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.message || 'Failed to reset password. Please try again.';
      }
    });
  }

  goBack(): void {
    if (this.step > 1) {
      this.step--;
      this.errorMsg = '';
    } else {
      this.router.navigate(['/login']);
    }
  }
}
