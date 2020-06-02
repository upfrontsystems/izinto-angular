import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Collection} from '../_models/collection';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {

    constructor(private http: HttpClient) {
    }

    getCollections(filters) {
        return this.http.get<Collection[]>(`/api/collections`, {params: filters});
    }

    getById(id) {
        return this.http.get<Collection>(`/api/collection/` + id);
    }

    add(collection) {
        return this.http.post<Collection>('/api/collections', collection);
    }

    edit(collection) {
        return this.http.put<Collection>(`/api/collection/` + collection.id, collection);
    }

    delete(collection) {
        return this.http.delete(`/api/collection/` + collection.id);
    }
}
