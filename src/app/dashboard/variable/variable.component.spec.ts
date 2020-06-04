import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {VariableComponent} from './variable.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {MaterialModule} from '../../material.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';

describe('VariableComponent', () => {
    let component: VariableComponent;
    let fixture: ComponentFixture<VariableComponent>;

    const variable = {id: 1, name: 'Variable', 'value': '5', dashboard_id: 1};

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [VariableComponent],
            imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, MaterialModule, BrowserAnimationsModule,
                HttpClientTestingModule],
            schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(VariableComponent);
        component = fixture.componentInstance;
        component.variable = variable;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
