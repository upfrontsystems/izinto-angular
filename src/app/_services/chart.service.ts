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

    getCharts(filters): Observable<Chart[]> {
        return of(CHARTS);
        return this.http.get<Chart[]>(`/api/charts`, {params: filters});
    }

    getById(id) {
        return this.http.get<Chart>(`/api/chart/` + id);
    }

    add(chart) {
        return this.http.post<Chart>('/api/charts', chart);
    }

    edit(chart) {
        return this.http.put<Chart>(`api/chart/` + chart.id, chart);
    }

    delete(chart) {
        return this.http.delete(`api/chart/` + chart.id);
    }

}
