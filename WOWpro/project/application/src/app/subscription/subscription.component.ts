import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css']
})
export class SubscriptionComponent implements OnInit {
  plans: any[] = [];
  currentSub: any = null;
  loading = true;
  subscribing = false;
  message = '';
  messageType = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.userService.getMySubscription().subscribe({
      next: (res: any) => {
        this.currentSub = res.subscription;
        this.plans = res.plans || [];
        this.loading = false;
      },
      error: () => {
        // Fallback: Load plans directly
        this.userService.getSubscriptionPlans().subscribe({
          next: (res: any) => {
            this.plans = res.plans || [];
            this.loading = false;
          },
          error: () => { this.loading = false; }
        });
      }
    });
  }

  subscribe(planId: string): void {
    this.subscribing = true;
    this.message = '';
    this.userService.subscribeToPlan(planId).subscribe({
      next: (res: any) => {
        this.message = res.message;
        this.messageType = 'success';
        this.subscribing = false;
        this.loadData();
      },
      error: (err: any) => {
        this.message = err.error?.message || 'Subscription failed. Try again.';
        this.messageType = 'error';
        this.subscribing = false;
      }
    });
  }

  cancelSub(): void {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    this.userService.cancelSubscription().subscribe({
      next: (res: any) => {
        this.message = res.message;
        this.messageType = 'success';
        this.currentSub = null;
        this.loadData();
      },
      error: (err: any) => {
        this.message = err.error?.message || 'Failed to cancel.';
        this.messageType = 'error';
      }
    });
  }

  getPlanIcon(planId: string): string {
    if (planId.includes('pro')) return 'fas fa-crown';
    return 'fas fa-star';
  }

  isPopular(planId: string): boolean {
    return planId === 'monthly_pro' || planId === 'annual_basic';
  }

  getDaysRemaining(): number {
    if (!this.currentSub?.endDate) return 0;
    const end = new Date(this.currentSub.endDate).getTime();
    const now = Date.now();
    return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  }
}
