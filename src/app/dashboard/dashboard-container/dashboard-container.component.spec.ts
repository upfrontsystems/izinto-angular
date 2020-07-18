import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DashboardContainerComponent} from './dashboard-container.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {MaterialModule} from '../../material.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';
import {CollectionService} from '../../_services/collection.service';
import {DataSourceService} from '../../_services/data.source.service';
import {DashboardService} from '../../_services/dashboard.service';

describe('DashboardContainerComponent', () => {
    let component: DashboardContainerComponent;
    let fixture: ComponentFixture<DashboardContainerComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DashboardContainerComponent],
            imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, MaterialModule, BrowserAnimationsModule,
                HttpClientTestingModule],
            schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
            providers: [CollectionService, DataSourceService, DashboardService]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DashboardContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
