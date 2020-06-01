import {TestBed} from '@angular/core/testing';
import {VariableService} from './variable.service';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('VariableService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientTestingModule],
            providers: [VariableService]
        });
    });

    it('should be created', () => {
        const service: VariableService = TestBed.get(VariableService);
        expect(service).toBeTruthy();
    });
});
