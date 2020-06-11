import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ScriptListComponent} from './script.list.component';
import {SingleStatListComponent} from '../single-stat/single.stat.list.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {MaterialModule} from '../../material.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';
import {AuthenticationService} from '../../_services/authentication.service';
import {ScriptService} from '../../_services/script.service';

describe('SingleStatListComponent', () => {
    let component: ScriptListComponent;
    let fixture: ComponentFixture<ScriptListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ScriptListComponent],
            imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, MaterialModule, BrowserAnimationsModule,
                HttpClientTestingModule],
            schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
            providers: [AuthenticationService, ScriptService]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ScriptListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
