import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSourceDialogComponent } from './data-source-dialog.component';

describe('DataSourceDialogComponent', () => {
  let component: DataSourceDialogComponent;
  let fixture: ComponentFixture<DataSourceDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataSourceDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSourceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
