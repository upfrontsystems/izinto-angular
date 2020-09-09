import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Variable} from '../_models/variable';

@Injectable({
  providedIn: 'root'
})
export class VariableService {

    constructor(private http: HttpClient) {
    }

    getVariables(dashboardId, filters) {
        return this.http.get<Variable[]>(`/api/dashboards/${dashboardId}/variables`, {params: filters});
    }

    getById(dashboardId, id) {
        return this.http.get<Variable>(`/api/dashboards/${dashboardId}/variables/` + id);
    }

    add(dashboardId, variable) {
        return this.http.post<Variable>(`/api/dashboards/${dashboardId}/variables`, variable);
    }

    edit(dashboardId, variable) {
        return this.http.put<Variable>(`/api/dashboards/${dashboardId}/variables/` + variable.id, variable);
    }

    delete(dashboardId, variable) {
        return this.http.delete(`/api/dashboards/${dashboardId}/variables/` + variable.id);
    }
}
