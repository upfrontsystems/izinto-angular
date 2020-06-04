import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FabSpeedDialComponent } from './fab-speed-dial.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {MaterialModule} from '../../material.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('FabSpeedDialComponent', () => {
    let component: FabSpeedDialComponent;
    let fixture: ComponentFixture<FabSpeedDialComponent>;

    const buttons = [{icon: 'icon', link: 'link', label: 'Button label'}];

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ FabSpeedDialComponent ],
            imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, MaterialModule, BrowserAnimationsModule,
                HttpClientTestingModule],
            schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],

        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FabSpeedDialComponent);
        component = fixture.componentInstance;
        component.fabButtons = buttons;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
