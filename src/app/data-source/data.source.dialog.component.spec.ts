import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {DataSourceDialogComponent} from './data.source.dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {MaterialModule} from '../material.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

describe('DataSourceDialogComponent', () => {
    let component: DataSourceDialogComponent;
    let fixture: ComponentFixture<DataSourceDialogComponent>;

    const dataSource = {};

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DataSourceDialogComponent],
            imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, MaterialModule, BrowserAnimationsModule,
                HttpClientTestingModule],
            schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: MatDialogRef, useValue: {}},
                {provide: MAT_DIALOG_DATA, useValue: {dataSource}}
            ]
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
