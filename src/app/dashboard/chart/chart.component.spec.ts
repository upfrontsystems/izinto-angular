import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ChartComponent} from './chart.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {MaterialModule} from '../../material.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';
import {AlertService} from '../../_services/alert.service';
import {MouseListenerDirective} from '../../shared/mouse-listener/mouse.listener.directive';
import {Chart} from '../../_models/chart';

describe('ChartComponent', () => {
    let component: ChartComponent;
    let fixture: ComponentFixture<ChartComponent>;

    const chart = new Chart();
    chart.id = 1;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ChartComponent],
            imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, MaterialModule, BrowserAnimationsModule,
                HttpClientTestingModule],
            schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
            providers: [AlertService, MouseListenerDirective]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ChartComponent);
        component = fixture.componentInstance;
        component.chart = chart;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
