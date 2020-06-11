import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SingleStatListComponent} from './single.stat.list.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {MaterialModule} from '../../material.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';
import {AlertService} from '../../_services/alert.service';
import {AuthenticationService} from '../../_services/authentication.service';
import {CopyService} from '../../_services/copy.service';
import {DataSourceService} from '../../_services/data.source.service';
import {SingleStatService} from '../../_services/single.stat.service';

describe('SingleStatListComponent', () => {
    let component: SingleStatListComponent;
    let fixture: ComponentFixture<SingleStatListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SingleStatListComponent],
            imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, MaterialModule, BrowserAnimationsModule,
                HttpClientTestingModule],
            schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
            providers: [AlertService, AuthenticationService, CopyService, DataSourceService, SingleStatService]
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
