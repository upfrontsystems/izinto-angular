import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DashboardDateSelectorComponent} from './dashboard-date-selector.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {MaterialModule} from '../../material.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';
import {DashboardService} from '../../_services/dashboard.service';

describe('DashboardDateSelectorComponent', () => {
    let component: DashboardDateSelectorComponent;
    let fixture: ComponentFixture<DashboardDateSelectorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DashboardDateSelectorComponent],
            imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, MaterialModule, BrowserAnimationsModule,
                HttpClientTestingModule],
            schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
            providers: [DashboardService]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DashboardDateSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
