import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DataSource} from '../_models/data.source';

@Injectable({
  providedIn: 'root'
})
export class DataSourceService {

    constructor(private http: HttpClient) {
    }

    getAll(filters) {
        return this.http.get<DataSource[]>(`/api/data_sources`, {params: filters});
    }

    getById(id) {
        return this.http.get<DataSource>(`/api/data_sources/` + id);
    }

    add(dataSource) {
        return this.http.post<DataSource>('/api/data_sources', dataSource);
    }

    edit(dataSource) {
        return this.http.put<DataSource>(`/api/data_sources/` + dataSource.id, dataSource);
    }

    delete(dataSource) {
        return this.http.delete(`/api/data_sources/` + dataSource.id);
    }

    loadDataQuery(dataSourceId, query) {
        return this.http.post(`/api/data_sources/${dataSourceId}/query`, {query: query, epoch: 'ms'});
    }
}
