import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DashboardEditorComponent} from './dashboard-editor.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '../../material.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';
import {Dashboard} from '../../_models/dashboard';
import {AuthenticationService} from '../../_services/authentication.service';
import {UserService} from '../../_services/user.service';
import {of} from 'rxjs';
import {DashboardService} from '../../_services/dashboard.service';


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
    edit(form) {
        return of(form);
    }
}


describe('DashboardEditorComponent', () => {
    let component: DashboardEditorComponent;
    let fixture: ComponentFixture<DashboardEditorComponent>;
    const dashboard = new Dashboard();
    dashboard.users = [];
    dashboard.title = 'Title';

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DashboardEditorComponent],
            imports: [FormsModule, ReactiveFormsModule, MaterialModule, BrowserAnimationsModule],
            providers: [{provide: AuthenticationService, useClass: AuthenticationServiceStub},
                {provide: UserService, useClass: UserServiceStub},
                {provide: DashboardService, useClass: DashboardServiceStub}],
            schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DashboardEditorComponent);
        component = fixture.componentInstance;
        component.dashboard = dashboard;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
