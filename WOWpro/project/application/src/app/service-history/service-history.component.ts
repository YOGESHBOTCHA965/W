import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-service-history',
  templateUrl: './service-history.component.html',
  styleUrls: ['./service-history.component.css']
})
export class ServiceHistoryComponent implements OnInit {
  bookings: any[] = [];
  loading = true;
  selectedBooking: any = null;
  trackingData: any = null;
  trackingLoading = false;

  // Review modal state
  showReviewModal = false;
  reviewBookingId = '';
  reviewRating = 5;
  reviewComment = '';
  reviewSubmitting = false;
  reviewMessage = '';

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;
    this.userService.getMyBookings().subscribe({
      next: (res: any) => {
        this.bookings = res.bookings || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    const map: any = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'in-progress': 'status-progress',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    };
    return map[status] || '';
  }

  getStatusIcon(status: string): string {
    const map: any = {
      'pending': 'fas fa-clock',
      'confirmed': 'fas fa-check-circle',
      'in-progress': 'fas fa-cog fa-spin',
      'completed': 'fas fa-check-double',
      'cancelled': 'fas fa-times-circle'
    };
    return map[status] || 'fas fa-circle';
  }

  trackBooking(booking: any): void {
    this.selectedBooking = booking;
    this.trackingLoading = true;
    this.userService.trackBooking(booking._id).subscribe({
      next: (res: any) => {
        this.trackingData = res.tracking;
        this.trackingLoading = false;
      },
      error: () => {
        this.trackingLoading = false;
      }
    });
  }

  closeTracking(): void {
    this.selectedBooking = null;
    this.trackingData = null;
  }

  cancelBooking(bookingId: string): void {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.userService.cancelBooking(bookingId).subscribe({
        next: () => {
          this.loadBookings();
        }
      });
    }
  }

  openReview(bookingId: string): void {
    this.reviewBookingId = bookingId;
    this.reviewRating = 5;
    this.reviewComment = '';
    this.reviewMessage = '';
    this.showReviewModal = true;
  }

  closeReview(): void {
    this.showReviewModal = false;
  }

  setRating(star: number): void {
    this.reviewRating = star;
  }

  submitReview(): void {
    if (!this.reviewComment.trim()) {
      this.reviewMessage = 'Please write a comment.';
      return;
    }
    this.reviewSubmitting = true;
    this.userService.submitReview({
      bookingId: this.reviewBookingId,
      rating: this.reviewRating,
      comment: this.reviewComment.trim()
    }).subscribe({
      next: (res: any) => {
        this.reviewMessage = res.message || 'Review submitted!';
        this.reviewSubmitting = false;
        setTimeout(() => this.closeReview(), 1500);
      },
      error: (err: any) => {
        this.reviewMessage = err.error?.message || 'Failed to submit review.';
        this.reviewSubmitting = false;
      }
    });
  }
}
