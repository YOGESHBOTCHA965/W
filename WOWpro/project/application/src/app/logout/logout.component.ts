import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(private service: UserService, private router: Router) {}

  ngOnInit() {
    this.service.setUserLogout();
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 1500);
  }
}
