import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Variable} from '../_models/variable';

@Injectable({
  providedIn: 'root'
})
export class VariableService {

    constructor(private http: HttpClient) {
    }

    getVariables(filters) {
        return this.http.get<Variable[]>(`/api/variables`, {params: filters});
    }

    getById(id) {
        return this.http.get<Variable>(`/api/variable/` + id);
    }

    add(variable) {
        return this.http.post<Variable>('/api/variables', variable);
    }

    edit(variable) {
        return this.http.put<Variable>(`/api/variable/` + variable.id, variable);
    }

    delete(variable) {
        return this.http.delete(`/api/variable/` + variable.id);
    }
}
