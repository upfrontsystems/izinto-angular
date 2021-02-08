import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionVariableComponent } from './collection-variable.component';

describe('CollectionVariableComponent', () => {
  let component: CollectionVariableComponent;
  let fixture: ComponentFixture<CollectionVariableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionVariableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionVariableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
