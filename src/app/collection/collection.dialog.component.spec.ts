import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CollectionDialogComponent} from './collection.dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {MaterialModule} from '../material.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {FileUploadModule} from 'ng2-file-upload';
import {AuthenticationService} from '../_services/authentication.service';

export class AuthenticationServiceStub {
    getToken() {
        return 'token';
    }

    hasRole(role) {
        return false;
    }
}

describe('CollectionDialogComponent', () => {
    let component: CollectionDialogComponent;
    let fixture: ComponentFixture<CollectionDialogComponent>;

    const collection = {};

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CollectionDialogComponent],
            imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, MaterialModule, BrowserAnimationsModule,
                HttpClientTestingModule, FileUploadModule],
            schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: AuthenticationService, useClass: AuthenticationServiceStub},
                {provide: MatDialogRef, useValue: {}},
                {provide: MAT_DIALOG_DATA, useValue: {collection}}
            ]

        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CollectionDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
