import {TestBed} from '@angular/core/testing';

import {QueryService} from './query.service';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('QueryService', () => {
    let service: QueryService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientTestingModule],
            providers: [QueryService]
        });
        service = TestBed.inject(QueryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
