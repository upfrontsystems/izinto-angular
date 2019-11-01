import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {Role} from '../_models/role';
import {User} from '../_models/user';

@Injectable({providedIn: 'root'})
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(email: string, password: string, url: string) {
        return this.http.post<any>(`/api/auth/login`, {email, password, application_url: url})
            .pipe(map(user => {
                // login successful if there's a jwt token in the response
                if (user && user.access_token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.setCurrentUser(user);
                }

                return user;
            }));
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.setCurrentUser(null);
    }

    setCurrentUser(user) {
        this.currentUserSubject.next(user);
    }

    register(form, url) {
        form.application_url = url;
        return this.http.post<any>(`/api/auth/register`, form);
    }

    confirmOTP(otp, secret) {
        return this.http.post<any>(`/api/auth/confirm-otp`, {otp, secret})
            .pipe(map(user => {
                // login successful if there's a jwt token in the response
                if (user && user.access_token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                }

                return user;
            }));
    }

    requestResetPassword(form) {
        return this.http.post<any>(`/api/auth/reset`, form);
    }

    resetPassword(form) {
        return this.http.post<any>(`/api/auth/set-password`, form)
            .pipe(map(user => {
                // login successful if there's a jwt token in the response
                if (user && user.access_token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                }

                return user;
            }));
    }

    getAllRoles() {
        return this.http.get<Role[]>(`api/auth/roles`);
    }

    getToken() {
        const user = this.currentUserSubject.value;
        return user.access_token;
    }

    // return if user has the role
    hasRole(role) {
        const user = this.currentUserSubject.value;
        if (user) {
            return user.roles.includes(role);
        }
        return false;
    }

    hasRoles(roles) {
        for (const role of roles) {
            if (this.hasRole(role)) {
                return true;
            }
        }
        return false;
    }
}
