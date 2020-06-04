import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DataSourceComponent} from './data.source.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {MaterialModule} from '../material.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';

describe('DataSourceComponent', () => {
    let component: DataSourceComponent;
    let fixture: ComponentFixture<DataSourceComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DataSourceComponent],
            imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, MaterialModule, BrowserAnimationsModule,
                HttpClientTestingModule],
            schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],

        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DataSourceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
