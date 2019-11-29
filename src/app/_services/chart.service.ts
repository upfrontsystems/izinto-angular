import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Chart} from '../_models/chart';
import {HttpClient, HttpHeaders} from '@angular/common/http';
        import {CHARTS} from './mock-charts';

const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('upfrontsoftware:keHZZEd3L8nkXJvK')
    })
};

@Injectable({
    providedIn: 'root'
})
export class ChartService {

    private queryURL = '/query?q=';

    constructor(private http: HttpClient) {
    }

    getDevices() {
        const url = this.queryURL + encodeURIComponent('SHOW TAG VALUES ON \"izintorain\" ' +
            'FROM \"measurement\" WITH KEY = \"dev_id\"');

        return this.http.get(url, httpOptions);
    }

    selectDevice(url) {
        return this.http.get(url, httpOptions);
    }

    getCharts(filters): Observable<Chart[]> {
        return this.http.get<Chart[]>(`/api/charts`, {params: filters});
    }

    getChartData(query) {
        const url = this.queryURL + encodeURIComponent(query);
        return this.http.get(url, httpOptions);
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

    reorder(chart) {
        return this.http.put('api/chart/' + chart.id + '/reorder', chart);
    }

}
