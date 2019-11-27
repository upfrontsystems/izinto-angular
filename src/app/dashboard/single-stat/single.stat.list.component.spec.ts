import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleStatListComponent } from './single.stat.list.component';

describe('SingleStatListComponent', () => {
  let component: SingleStatListComponent;
  let fixture: ComponentFixture<SingleStatListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleStatListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleStatListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
