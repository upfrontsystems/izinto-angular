import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Chart} from '../_models/chart';
import {HttpClient} from '@angular/common/http';


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
        return this.http.get<Chart>(`/api/charts/` + id);
    }

    add(chart) {
        return this.http.post<Chart>('/api/charts', chart);
    }

    edit(chart) {
        return this.http.put<Chart>(`/api/charts/` + chart.id, chart);
    }

    delete(chart) {
        return this.http.delete(`/api/charts/` + chart.id);
    }

    reorder(chart) {
        return this.http.put('/api/charts/' + chart.id + '/reorder', chart);
    }
}
