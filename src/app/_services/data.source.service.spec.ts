import {TestBed} from '@angular/core/testing';
import {DataSourceService} from './data.source.service';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';


describe('DataSourceService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientTestingModule],
            providers: [DataSourceService]
        });
    });

    it('should be created', () => {
        const service: DataSourceService = TestBed.get(DataSourceService);
        expect(service).toBeTruthy();
    });
});
