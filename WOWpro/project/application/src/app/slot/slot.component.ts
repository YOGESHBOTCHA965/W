import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-slot',
  templateUrl: './slot.component.html',
  styleUrls: ['./slot.component.css']
})
export class SlotComponent implements OnInit {
  minDate: string;
  userName = '';

  constructor(
    private router: Router,
    private userService: UserService,
    private toastr: ToastrService
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    if (!this.userService.getUserLoginStatus()) {
      this.router.navigate(['/login']);
      return;
    }
    this.userName = this.userService.getCurrentUserName();
  }

  proceedToPayment(): void {
    this.toastr.success('Slot details saved! Proceeding to payment.', 'Booking Saved');
    this.router.navigate(['/payment']);
  }
}
