import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ScriptContainerComponent} from './script.container.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {MaterialModule} from '../../material.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {of, ReplaySubject} from 'rxjs';
import {Dashboard} from '../../_models/dashboard';
import {AuthenticationService} from '../../_services/authentication.service';
import {DashboardService} from '../../_services/dashboard.service';
import {ActivatedRoute, convertToParamMap, ParamMap} from '@angular/router';

export class AuthenticationServiceStub {
    hasRole(role) {
        return true;
    }
}

export class DashboardServiceStub {
    public currentDashboard = of(null);
    public datesUpdated = of({})

    constructor() {
        const dashboard = new Dashboard();
        dashboard.users = [];
        dashboard.title = 'Title';
        dashboard.collection_id = 1;
        this.currentDashboard = of(dashboard);
    }

    getDateSelection() {
        return {};
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

describe('ScriptContainerComponent', () => {
    let component: ScriptContainerComponent;
    let fixture: ComponentFixture<ScriptContainerComponent>;
    const dashboard = new Dashboard();
    dashboard.id = 1;
    dashboard.users = [];
    dashboard.title = 'Title';
    dashboard.collection_id = 1;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ScriptContainerComponent],
            imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, MaterialModule, BrowserAnimationsModule,
                HttpClientTestingModule],
            providers: [{provide: AuthenticationService, useClass: AuthenticationServiceStub},
                {provide: DashboardService, useClass: DashboardServiceStub},
                {provide: ActivatedRoute, useClass: ActivatedRouteStub}],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ScriptContainerComponent);
        component = fixture.componentInstance;
        component.dashboard = dashboard;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
