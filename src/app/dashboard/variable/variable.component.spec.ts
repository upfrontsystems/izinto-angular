import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DashboardVariableComponent} from './variable.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {MaterialModule} from '../../material.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';
import {ActivatedRoute, convertToParamMap, ParamMap} from '@angular/router';
import {ReplaySubject} from 'rxjs';

export class ActivatedRouteStub {
    private subject = new ReplaySubject<ParamMap>();
    readonly paramMap = this.subject.asObservable();
    parent = {params: this.paramMap};
    constructor() {
        const initialParams = {id : 1};
        this.setParamMap(initialParams);
    }

    setParamMap(params) {
        this.subject.next(convertToParamMap(params));
    }
}

describe('DashboardVariableComponent', () => {
    let component: DashboardVariableComponent;
    let fixture: ComponentFixture<DashboardVariableComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DashboardVariableComponent],
            imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, MaterialModule, BrowserAnimationsModule,
                HttpClientTestingModule],
            schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
            providers: [{provide: ActivatedRoute, useClass: ActivatedRouteStub}]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DashboardVariableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
