import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionUserAccessComponent } from './collection.user.access.component';

describe('CollectionUserAccessComponent', () => {
  let component: CollectionUserAccessComponent;
  let fixture: ComponentFixture<CollectionUserAccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionUserAccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionUserAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
