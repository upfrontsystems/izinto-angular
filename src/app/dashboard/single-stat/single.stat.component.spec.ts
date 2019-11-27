import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleStatComponent } from './single.stat.component';

describe('SingleStatComponent', () => {
  let component: SingleStatComponent;
  let fixture: ComponentFixture<SingleStatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleStatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleStatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
