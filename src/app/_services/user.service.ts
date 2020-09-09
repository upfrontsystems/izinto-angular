import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../_models/user';

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient) { }

    getAll(filters) {
        return this.http.get<User[]>(`/api/users`, {params: filters});
    }

    getById(id: string) {
        return this.http.get<User>(`/api/users/${id}`);
    }

    add(user) {
        return this.http.post<User>('/api/users', user);
    }

    edit(user) {
        return this.http.put<User>(`/api/users/${user.id}`, user);
    }

    delete(user) {
        return this.http.delete(`/api/users/${user.id}`);
    }
}
