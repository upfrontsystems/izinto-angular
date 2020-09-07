import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {QueryDialogComponent} from './query.dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {MaterialModule} from '../material.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';
import {AlertService} from '../_services/alert.service';
import {SpinnerService} from '../_services/spinner.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {QueryService} from '../_services/query.service';

describe('QueryDialogComponent', () => {
    let component: QueryDialogComponent;
    let fixture: ComponentFixture<QueryDialogComponent>;
    const query = {};

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [QueryDialogComponent],
            imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, MaterialModule, BrowserAnimationsModule,
                HttpClientTestingModule],
            schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                AlertService,
                SpinnerService,
                QueryService,
                {provide: MatDialogRef, useValue: {}},
                {provide: MAT_DIALOG_DATA, useValue: {query}},
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(QueryDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
