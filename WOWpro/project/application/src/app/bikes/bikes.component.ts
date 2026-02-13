import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  selector: 'app-bikes',
  templateUrl: './bikes.component.html',
  styleUrls: ['./bikes.component.css']
})
export class BikesComponent implements OnInit {
  brand: any = [];
  Modal: any = [];

  constructor(private service: UserService) {}

  ngOnInit(): void {
    this.brand = this.service.brand();
  }

  onSelect(brand: any): void {
    this.Modal = this.service.Modal().filter((e: any) => e.id === brand.target.value);
  }
}
