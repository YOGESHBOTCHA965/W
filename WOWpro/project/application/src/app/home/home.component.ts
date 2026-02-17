import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  brand: any[] = [];
  Modal: any[] = [];
  userName = '';

  // Testimonials
  publicReviews: any[] = [];

  // Quick Price Calculator
  calcVehicle = 'bike';
  calcPlan = 'standard';
  calcResult: any = null;

  // Multi-city waitlist
  waitlistEmail = '';
  waitlistCity = '';
  waitlistMsg = '';

  constructor(private service: UserService) {}

  ngOnInit(): void {
    this.brand = this.service.brand();
    this.userName = this.service.getCurrentUserName();
    this.updateCalc();
    this.loadReviews();
  }

  onSelect(event: any): void {
    this.Modal = this.service.Modal().filter((e: any) => e.id == event.target.value);
  }

  updateCalc(): void {
    this.calcResult = this.service.calculatePrice(this.calcVehicle, this.calcPlan, []);
  }

  loadReviews(): void {
    this.service.getPublicReviews().subscribe({
      next: (res: any) => {
        this.publicReviews = (res.reviews || []).slice(0, 3);
      },
      error: () => {}
    });
  }

  joinWaitlist(): void {
    if (!this.waitlistEmail || !this.waitlistCity) {
      this.waitlistMsg = 'Please enter your email and select a city.';
      return;
    }
    this.service.joinWaitlist({ email: this.waitlistEmail, city: this.waitlistCity }).subscribe({
      next: (res: any) => {
        this.waitlistMsg = res.message || 'You\'re on the list!';
        this.waitlistEmail = '';
      },
      error: (err: any) => {
        this.waitlistMsg = err.error?.message || 'Something went wrong. Try again.';
      }
    });
  }
}
