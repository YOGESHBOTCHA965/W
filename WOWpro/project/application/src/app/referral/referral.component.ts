import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  selector: 'app-referral',
  templateUrl: './referral.component.html',
  styleUrls: ['./referral.component.css']
})
export class ReferralComponent implements OnInit {
  referralData: any = null;
  leaderboard: any[] = [];
  loading = true;
  applyCode = '';
  applyMessage = '';
  applySuccess = false;
  copied = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadReferral();
    this.loadLeaderboard();
  }

  loadReferral(): void {
    this.userService.getMyReferral().subscribe({
      next: (res: any) => {
        this.referralData = res.referral;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadLeaderboard(): void {
    this.userService.getReferralLeaderboard().subscribe({
      next: (res: any) => { this.leaderboard = res.leaderboard || []; }
    });
  }

  copyCode(): void {
    if (this.referralData?.referralCode) {
      navigator.clipboard.writeText(this.referralData.referralCode).then(() => {
        this.copied = true;
        setTimeout(() => this.copied = false, 2000);
      });
    }
  }

  applyReferral(): void {
    if (!this.applyCode.trim()) return;
    this.userService.applyReferralCode(this.applyCode.trim()).subscribe({
      next: (res: any) => {
        this.applyMessage = res.message;
        this.applySuccess = true;
        this.loadReferral();
      },
      error: (err: any) => {
        this.applyMessage = err.error?.message || 'Failed to apply code.';
        this.applySuccess = false;
      }
    });
  }

  shareOnWhatsApp(): void {
    const code = this.referralData?.referralCode || '';
    const text = `Join WOW - Columbus, GA's best doorstep motorbike & bike service! Use my referral code ${code} and get 50 bonus points! 🏍️🔧`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }
}
