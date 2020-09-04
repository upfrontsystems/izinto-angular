import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Query} from '../_models/query';

@Injectable({
  providedIn: 'root'
})
export class QueryService {

    constructor(private http: HttpClient) {
    }

    getAll(filters) {
        return this.http.get<Query[]>(`/api/queries`, {params: filters});
    }

    getById(id) {
        return this.http.get<Query>(`/api/query/` + id);
    }

    add(query) {
        return this.http.post<Query>('/api/queries', query);
    }

    edit(query) {
        return this.http.put<Query>(`/api/query/` + query.id, query);
    }

    delete(query) {
        return this.http.delete(`/api/query/` + query.id);
    }

    runQuery(queryName, params) {
        return this.http.post(`/api/query/${queryName}/run`, params);
    }
}
