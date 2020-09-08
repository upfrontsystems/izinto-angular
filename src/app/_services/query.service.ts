import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Query} from '../_models/query';

@Injectable({
  providedIn: 'root'
})
export class QueryService {

    constructor(private http: HttpClient) {
    }

    getAll(dashboardId, filters) {
        return this.http.get<Query[]>(`/api/dashboard/${dashboardId}/queries`, {params: filters});
    }

    getById(dashboardId, id) {
        return this.http.get<Query>(`/api/dashboard/${dashboardId}/query/` + id);
    }

    add(dashboardId, query) {
        return this.http.post<Query>('/api/dashboard/${dashboardId}/queries', query);
    }

    edit(dashboardId, query) {
        return this.http.put<Query>(`/api/dashboard/${dashboardId}/query/` + query.id, query);
    }

    delete(dashboardId, query) {
        return this.http.delete(`/api/dashboard/${dashboardId}/query/` + query.id);
    }

    runQuery(dashboardId, queryName, params) {
        return this.http.post(`/api/dashboard/${dashboardId}/query/${queryName}/run`, params);
    }
}
