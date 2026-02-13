import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BicycleServicesComponent } from './bicycle-services.component';

describe('BicycleServicesComponent', () => {
  let component: BicycleServicesComponent;
  let fixture: ComponentFixture<BicycleServicesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BicycleServicesComponent]
    });
    fixture = TestBed.createComponent(BicycleServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
