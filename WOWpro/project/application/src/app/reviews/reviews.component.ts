import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit {
  publicReviews: any[] = [];
  stats: any = null;
  loading = true;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.userService.getPublicReviews().subscribe({
      next: (res: any) => {
        this.publicReviews = res.reviews || [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
    this.userService.getReviewStats().subscribe({
      next: (res: any) => {
        if (res.stats) {
          res.stats.roundedRating = Math.round(res.stats.averageRating || 0);
        }
        this.stats = res.stats;
      }
    });
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }
}
