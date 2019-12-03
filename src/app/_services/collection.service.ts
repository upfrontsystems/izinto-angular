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

    // store copy of dashboard in local storage
    copy(collection) {
        localStorage.setItem('collection', JSON.stringify(collection));
    }

    paste() {
        return this.http.post<Collection>('/api/collections/paste', localStorage.getItem('collection'));
    }

    clearCopied() {
        localStorage.removeItem('collection');
    }

    canPaste(): boolean {
        return localStorage.getItem('collection') !== null;
    }
}
