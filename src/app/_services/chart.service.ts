import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Chart} from '../_models/chart';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {DataSource} from '../_models/data.source';


@Injectable({
    providedIn: 'root'
})
export class ChartService {

    private queryURL = '/query?q=';

    constructor(private http: HttpClient) {
    }

    getDevices(dataSource: DataSource) {
        const url = dataSource.url + this.queryURL + encodeURIComponent('SHOW TAG VALUES ON \"izintorain\" ' +
            'FROM \"measurement\" WITH KEY = \"dev_id\"');

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(dataSource.username + ':' + dataSource.password)
            })
        };

        return this.http.get(url, httpOptions);
    }

    selectDevice(url, dataSource: DataSource) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(dataSource.username + ':' + dataSource.password)
            })
        };
        return this.http.get(url, httpOptions);
    }

    getCharts(filters): Observable<Chart[]> {
        return this.http.get<Chart[]>(`/api/charts`, {params: filters});
    }

    getChartData(query, dataSource: DataSource) {
        const url = dataSource.url + this.queryURL + encodeURIComponent(query);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(dataSource.username + ':' + dataSource.password)
            })
        };

        return this.http.get(url, httpOptions);
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
