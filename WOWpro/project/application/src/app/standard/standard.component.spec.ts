import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StandardComponent } from './standard.component';

describe('StandardComponent', () => {
  let component: StandardComponent;
  let fixture: ComponentFixture<StandardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StandardComponent]
    });
    fixture = TestBed.createComponent(StandardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
