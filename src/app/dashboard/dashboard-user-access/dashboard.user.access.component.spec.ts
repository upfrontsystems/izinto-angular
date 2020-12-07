import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardUserAccessComponent } from './dashboard.user.access.component';

describe('DashboardUserAccessComponent', () => {
  let component: DashboardUserAccessComponent;
  let fixture: ComponentFixture<DashboardUserAccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardUserAccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardUserAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
