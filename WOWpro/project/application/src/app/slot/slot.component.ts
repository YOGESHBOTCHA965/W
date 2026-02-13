import { Component } from '@angular/core';

@Component({
  selector: 'app-slot',
  templateUrl: './slot.component.html',
  styleUrls: ['./slot.component.css']
})
export class SlotComponent {
  minDate: string;

  constructor() {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }
}
