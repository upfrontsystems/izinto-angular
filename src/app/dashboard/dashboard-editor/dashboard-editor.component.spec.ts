import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DashboardEditorComponent} from './dashboard-editor.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '../../material.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';
import {Dashboard} from '../../_models/dashboard';
import {AuthenticationService} from '../../_services/authentication.service';
import {UserService} from '../../_services/user.service';
import {of, ReplaySubject} from 'rxjs';
import {DashboardService} from '../../_services/dashboard.service';
import {ActivatedRoute, convertToParamMap, ParamMap} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';


export class AuthenticationServiceStub {
    hasRole(role) {
        return true;
    }
}

export class UserServiceStub {
    getAll(filter) {
        return of([]);
    }
}

export class DashboardServiceStub {
    public currentDashboard = of(null);

    constructor() {
        const dashboard = new Dashboard();
        dashboard.users = [];
        dashboard.title = 'Title';
        dashboard.collection_id = 1;
        this.currentDashboard = of(dashboard);
    }

    edit(form) {
        return of(form);
    }
}

export class ActivatedRouteStub {
    private subject = new ReplaySubject<ParamMap>();
    readonly paramMap = this.subject.asObservable();
    parent = {params: this.paramMap};

    constructor() {
        const initialParams = {id: 1};
        this.setParamMap(initialParams);
    }

    setParamMap(params) {
        this.subject.next(convertToParamMap(params));
    }
}

describe('DashboardEditorComponent', () => {
    let component: DashboardEditorComponent;
    let fixture: ComponentFixture<DashboardEditorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DashboardEditorComponent],
            imports: [FormsModule, ReactiveFormsModule, MaterialModule, BrowserAnimationsModule, RouterTestingModule],
            providers: [{provide: AuthenticationService, useClass: AuthenticationServiceStub},
                {provide: UserService, useClass: UserServiceStub},
                {provide: DashboardService, useClass: DashboardServiceStub},
                {provide: ActivatedRoute, useClass: ActivatedRouteStub}],
            schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DashboardEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
