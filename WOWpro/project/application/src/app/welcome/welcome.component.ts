import { Component } from '@angular/core';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent {
  particles = Array.from({ length: 20 }, (_, i) => ({
    left: Math.random() * 100 + '%',
    top: Math.random() * 100 + '%',
    delay: Math.random() * 5 + 's',
    size: Math.random() * 4 + 2 + 'px'
  }));

  features = [
    { icon: 'fas fa-map-marker-alt', title: 'Doorstep Service', desc: 'We come to your location' },
    { icon: 'fas fa-clock', title: 'Quick Turnaround', desc: 'Same-day service available' },
    { icon: 'fas fa-certificate', title: 'Certified Mechanics', desc: 'Trained professionals only' },
    { icon: 'fas fa-shield-alt', title: '6-Month Warranty', desc: 'On all repairs & parts' }
  ];

  steps = [
    { icon: 'fas fa-calendar-check', title: 'Book Online', desc: 'Choose your vehicle type, select a service plan, and pick a convenient time slot.' },
    { icon: 'fas fa-truck', title: 'We Arrive', desc: 'Our certified mechanic arrives at your doorstep with all the tools and parts needed.' },
    { icon: 'fas fa-smile-beam', title: 'Happy Ride!', desc: 'Your vehicle is serviced, tested, and ready to roll. Pay securely and ride with confidence.' }
  ];

  services = [
    {
      icon: 'fas fa-motorcycle',
      title: 'Bike Service',
      desc: 'Complete motorcycle maintenance and repair services at your doorstep.',
      points: ['Engine Oil Change', 'Brake Inspection', 'Chain & Sprocket', 'Full Body Wash']
    },
    {
      icon: 'fas fa-bicycle',
      title: 'Bicycle Service',
      desc: 'Professional bicycle tune-up and repair for all types of cycles.',
      points: ['Gear Tune-up', 'Wheel Truing', 'Brake Adjustment', 'Full Degrease']
    },
    {
      icon: 'fas fa-star',
      title: 'Premium Care',
      desc: 'Advanced service packages with pickup, drop and comprehensive overhaul.',
      points: ['Pickup & Drop', 'Full Overhaul', 'Genuine Parts', 'Priority Support']
    }
  ];
}
