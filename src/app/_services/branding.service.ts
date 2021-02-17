import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Branding } from '../_models/branding';

@Injectable({
    providedIn: 'root'
})
export class BrandingService {

    constructor(private http: HttpClient) {
    }

    getById(id) {
        return this.http.get<Branding>(`/api/branding/` + id);
    }

    search(filters) {
        return this.http.get<Branding>(`/api/branding/search`, {params: filters});
    }

    add(branding) {
        return this.http.post<Branding>('/api/branding', branding);
    }

    edit(branding) {
        return this.http.put<Branding>(`/api/branding/` + branding.id, branding);
    }

}
