import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  userName = '';
  selectedPlan = 'Premium Service';
  planPrice = '$99';

  // Card form fields (test mode - not validated)
  cardNumber = '';
  cardName = '';
  cardExpiry = '';
  cardCvv = '';

  processing = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    if (!this.userService.getUserLoginStatus()) {
      this.router.navigate(['/login']);
      return;
    }
    this.userName = this.userService.getCurrentUserName();
  }

  processPayment(): void {
    this.processing = true;

    // Simulate payment processing (test mode - no real validation)
    setTimeout(() => {
      this.processing = false;
      this.toastr.success('Payment processed successfully! (Test Mode)', 'Payment Complete');
      this.router.navigate(['/thankyou']);
    }, 2000);
  }

  skipPayment(): void {
    this.toastr.info('Payment skipped. Test Mode is active.', 'Test Mode');
    this.router.navigate(['/thankyou']);
  }
}
