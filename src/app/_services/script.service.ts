import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Script} from '../_models/script';

@Injectable({
  providedIn: 'root'
})
export class ScriptService {

    constructor(private http: HttpClient) {
    }

    getScripts(filters) {
        return this.http.get<Script[]>(`/api/scripts`, {params: filters});
    }

    getById(id) {
        return this.http.get<Script>(`/api/script/` + id);
    }

    add(script) {
        return this.http.post<Script>('/api/scripts', script);
    }

    edit(script) {
        return this.http.put<Script>(`/api/script/` + script.id, script);
    }

    delete(script) {
        return this.http.delete(`/api/script/` + script.id);
    }
}
