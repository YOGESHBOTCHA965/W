import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-emergency-sos',
  templateUrl: './emergency-sos.component.html',
  styleUrls: ['./emergency-sos.component.css']
})
export class EmergencySosComponent {
  vehicleType = 'bike';
  address = '';
  brand = '';
  model = '';
  notes = '';
  contactNo = '';
  submitting = false;
  submitted = false;
  message = '';
  bookingId = '';

  constructor(private userService: UserService, private router: Router) {}

  submitSOS(): void {
    if (!this.address.trim()) {
      this.message = 'Please enter your current location/address.';
      return;
    }
    if (!this.contactNo.trim()) {
      this.message = 'Please enter a contact number.';
      return;
    }

    this.submitting = true;
    this.message = '';

    this.userService.createSOSBooking({
      vehicleType: this.vehicleType,
      address: this.address.trim(),
      brand: this.brand.trim() || undefined,
      model: this.model.trim() || undefined,
      notes: this.notes.trim() || undefined,
      contactNo: this.contactNo.trim()
    }).subscribe({
      next: (res: any) => {
        this.submitted = true;
        this.submitting = false;
        this.message = res.message;
        this.bookingId = res.booking?._id || '';
      },
      error: (err: any) => {
        this.submitting = false;
        this.message = err.error?.message || 'Failed to submit SOS. Please call us directly.';
      }
    });
  }

  goToHistory(): void {
    this.router.navigate(['/service-history']);
  }
}
