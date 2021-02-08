import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Variable} from '../_models/variable';

@Injectable({
  providedIn: 'root'
})
export class VariableService {

    constructor(private http: HttpClient) {
    }

    getVariables(containerId, filters) {
        return this.http.get<Variable[]>(`/api/containers/${containerId}/variables`, {params: filters});
    }

    getById(containerId, id) {
        return this.http.get<Variable>(`/api/containers/${containerId}/variables/` + id);
    }

    add(containerId, variable) {
        return this.http.post<Variable>(`/api/containers/${containerId}/variables`, variable);
    }

    edit(containerId, variable) {
        return this.http.put<Variable>(`/api/containers/${containerId}/variables/` + variable.id, variable);
    }

    delete(containerId, variable) {
        return this.http.delete(`/api/containers/${containerId}/variables/` + variable.id);
    }
}
