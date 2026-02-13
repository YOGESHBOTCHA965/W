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

  constructor(private service: UserService) {}

  ngOnInit(): void {
    this.brand = this.service.brand();
    this.userName = this.service.getCurrentUserName();
  }

  onSelect(event: any): void {
    this.Modal = this.service.Modal().filter((e: any) => e.id == event.target.value);
  }
}
