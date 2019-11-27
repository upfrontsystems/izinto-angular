import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleStatDialogComponent } from './single.stat.dialog.component';

describe('SingleStatDialogComponent', () => {
  let component: SingleStatDialogComponent;
  let fixture: ComponentFixture<SingleStatDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleStatDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleStatDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
