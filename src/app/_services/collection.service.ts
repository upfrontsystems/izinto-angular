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
        return this.http.get<Collection>(`/api/collections/` + id);
    }

    add(collection) {
        return this.http.post<Collection>('/api/collections', collection);
    }

    edit(collection) {
        return this.http.put<Collection>(`/api/collections/` + collection.id, collection);
    }

    delete(collection) {
        return this.http.delete(`/api/collections/` + collection.id);
    }

    // list the users and their access roles for this collection
    getUserAccess(collectionId) {
        return this.http.get<any>(`/api/collections/${collectionId}/access`);
    }

    addUserAccess(collectionId, data) {
        return this.http.post(`/api/collections/${collectionId}/access`, data);
    }

    updateUserAccess(collectionId, userId, role) {
        return this.http.put(`/api/collections/${collectionId}/access`, {user_id: userId, role});
    }

    deleteUserAccess(collectionId, userId) {
        return this.http.delete(`/api/collections/${collectionId}/access`, {params: {user_id: userId}});
    }
}
