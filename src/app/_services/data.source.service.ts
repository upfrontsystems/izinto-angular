import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {DataSource} from '../_models/data.source';

@Injectable({
  providedIn: 'root'
})
export class DataSourceService {
    private queryURL = '/query?q=';

    constructor(private http: HttpClient) {
    }

    getAll(filters) {
        return this.http.get<DataSource[]>(`/api/data_sources`, {params: filters});
    }

    getById(id) {
        return this.http.get<DataSource>(`/api/data_source/` + id);
    }

    add(dataSource) {
        return this.http.post<DataSource>('/api/data_sources', dataSource);
    }

    edit(dataSource) {
        return this.http.put<DataSource>(`/api/data_source/` + dataSource.id, dataSource);
    }

    delete(dataSource) {
        return this.http.delete(`/api/data_source/` + dataSource.id);
    }

    loadDataQuery(dataSoureId, query) {
        const query_params = this.queryURL + encodeURIComponent(query);
        return this.http.get(`/api/data_source/${dataSoureId}/query`, {params: {'query': query_params, 'epoch': 'ms'}});
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
}
