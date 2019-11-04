import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Chart} from '../_models/chart';
import {CHARTS} from './mock-charts';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ChartService {

    constructor(private http: HttpClient) {
    }

    getCharts(): Observable<Chart[]> {
        return of(CHARTS);
    }

    getById(filters) {
        return this.http.get<Chart>(`/api/entry`, {params: filters});
    }

    add(chart) {
        return this.http.post<Chart>('/api/entries', chart);
    }

    edit(chart) {
        return this.http.put<Chart>(`api/entries`, chart);
    }

    delete(params) {
        return this.http.delete(`api/entry`, {params});
    }

}
