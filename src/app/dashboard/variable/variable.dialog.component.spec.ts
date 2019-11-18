import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VariableDialogComponent } from './variable.dialog.component';

describe('VariableDialogComponent', () => {
  let component: VariableDialogComponent;
  let fixture: ComponentFixture<VariableDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VariableDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VariableDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
