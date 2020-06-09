import {TestBed} from '@angular/core/testing';

import {CollectionService} from './collection.service';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('CollectionService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientTestingModule],
            providers: [CollectionService]
        });
    });

    it('should be created', () => {
        const service: CollectionService = TestBed.inject(CollectionService);
        expect(service).toBeTruthy();
    });
});
