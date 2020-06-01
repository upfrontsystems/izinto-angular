import {TestBed} from '@angular/core/testing';
import {ChartService} from './chart.service';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('ChartService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientTestingModule],
            providers: [ChartService]
        });
    });

    it('should be created', () => {
        const service: ChartService = TestBed.get(ChartService);
        expect(service).toBeTruthy();
    });
});
