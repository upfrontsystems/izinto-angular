import {TestBed} from '@angular/core/testing';

import {DashboardService} from './dashboard.service';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('DashboardServiceService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientTestingModule],
            providers: [DashboardService]
        });
    });

    it('should be created', () => {
        const service: DashboardService = TestBed.inject(DashboardService);
        expect(service).toBeTruthy();
    });
});
