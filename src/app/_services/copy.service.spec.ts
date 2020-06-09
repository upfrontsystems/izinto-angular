import {TestBed} from '@angular/core/testing';

import {CopyService} from './copy.service';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('CopyService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientTestingModule],
            providers: [CopyService]
        });
    });

    it('should be created', () => {
        const service: CopyService = TestBed.inject(CopyService);
        expect(service).toBeTruthy();
    });
});
