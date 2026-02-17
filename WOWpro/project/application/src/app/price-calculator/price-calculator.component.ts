import { Component } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  selector: 'app-price-calculator',
  templateUrl: './price-calculator.component.html',
  styleUrls: ['./price-calculator.component.css']
})
export class PriceCalculatorComponent {
  vehicleType = 'bike';
  servicePlan = 'standard';
  selectedIssues: string[] = [];
  result: { base: number; extras: number; total: number; discount: number } | null = null;

  bikeIssues = [
    { id: 'oil-change', label: 'Oil Change', icon: 'fas fa-oil-can' },
    { id: 'brake-repair', label: 'Brake Repair', icon: 'fas fa-compact-disc' },
    { id: 'chain-replace', label: 'Chain Replace', icon: 'fas fa-link' },
    { id: 'tire-puncture', label: 'Tire/Puncture', icon: 'fas fa-circle' },
    { id: 'battery', label: 'Battery Service', icon: 'fas fa-car-battery' },
    { id: 'engine-tune', label: 'Engine Tune-up', icon: 'fas fa-cog' },
    { id: 'clutch-repair', label: 'Clutch Repair', icon: 'fas fa-tools' },
    { id: 'electrical', label: 'Electrical Work', icon: 'fas fa-bolt' },
    { id: 'body-work', label: 'Body Work', icon: 'fas fa-paint-roller' }
  ];

  bicycleIssues = [
    { id: 'tire-puncture', label: 'Puncture Repair', icon: 'fas fa-circle' },
    { id: 'brake-repair', label: 'Brake Fix', icon: 'fas fa-compact-disc' },
    { id: 'chain-replace', label: 'Chain Replace', icon: 'fas fa-link' },
    { id: 'gear-tuning', label: 'Gear Tuning', icon: 'fas fa-cogs' },
    { id: 'wheel-truing', label: 'Wheel Truing', icon: 'fas fa-circle-notch' },
    { id: 'suspension', label: 'Suspension Fix', icon: 'fas fa-arrows-alt-v' }
  ];

  constructor(private userService: UserService) {}

  get issues() {
    return this.vehicleType === 'bike' ? this.bikeIssues : this.bicycleIssues;
  }

  toggleIssue(issueId: string): void {
    const idx = this.selectedIssues.indexOf(issueId);
    if (idx > -1) {
      this.selectedIssues.splice(idx, 1);
    } else {
      this.selectedIssues.push(issueId);
    }
    this.calculate();
  }

  isSelected(issueId: string): boolean {
    return this.selectedIssues.includes(issueId);
  }

  calculate(): void {
    this.result = this.userService.calculatePrice(this.vehicleType, this.servicePlan, this.selectedIssues);
  }

  onVehicleChange(): void {
    this.selectedIssues = [];
    this.calculate();
  }

  onPlanChange(): void {
    this.calculate();
  }
}
