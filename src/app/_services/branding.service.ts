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
        return this.http.get<Branding>(`/api/collections/` + id);
    }

    edit(collection) {
        return this.http.put<Branding>(`/api/collections/` + collection.id, collection);
    }

}
