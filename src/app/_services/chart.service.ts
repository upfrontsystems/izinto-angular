import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Chart} from '../_models/chart';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {DataSource} from '../_models/data.source';
import {Dashboard} from '../_models/dashboard';


@Injectable({
    providedIn: 'root'
})
export class ChartService {

    constructor(private http: HttpClient) {
    }

    getCharts(filters): Observable<Chart[]> {
        return this.http.get<Chart[]>(`/api/charts`, {params: filters});
    }

    getById(id) {
        return this.http.get<Chart>(`/api/chart/` + id);
    }

    add(chart) {
        return this.http.post<Chart>('/api/charts', chart);
    }

    edit(chart) {
        return this.http.put<Chart>(`/api/chart/` + chart.id, chart);
    }

    delete(chart) {
        return this.http.delete(`/api/chart/` + chart.id);
    }

    reorder(chart) {
        return this.http.put('/api/chart/' + chart.id + '/reorder', chart);
    }
}
