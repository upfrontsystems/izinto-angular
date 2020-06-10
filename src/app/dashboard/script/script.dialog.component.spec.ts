import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptDialogComponent } from './single.stat.dialog.component';

describe('SingleStatDialogComponent', () => {
  let component: ScriptDialogComponent;
  let fixture: ComponentFixture<ScriptDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScriptDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScriptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
