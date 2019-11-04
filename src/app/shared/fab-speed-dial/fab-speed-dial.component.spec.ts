import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FabSpeedDialComponent } from './fab-speed-dial.component';

describe('FabSpeedDialComponent', () => {
    let component: FabSpeedDialComponent;
    let fixture: ComponentFixture<FabSpeedDialComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ FabSpeedDialComponent ],
            imports: [BrowserAnimationsModule],
            schemas: [ NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA ],

        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FabSpeedDialComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
