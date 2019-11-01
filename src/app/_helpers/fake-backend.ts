import {Injectable} from '@angular/core';
import {
    HTTP_INTERCEPTORS,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse
} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {delay, dematerialize, materialize, mergeMap} from 'rxjs/operators';

import {Role} from '../_models/role';
import {User} from '../_models/user';

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const users: User[] = [
            {
                id: '42c9d2c5116c4e23aeca50bfdafb7308', email: 'admin', password: 'admin', firstname: 'Admin', surname: 'User',
                fullname: 'Admin User', role: Role.Administrator, roles: [Role.Administrator], inactive: false
            },
            {
                id: 'e846e4f4f27b4917a92de462ddbb102a', email: 'user', password: 'user', firstname: 'Normal', surname: 'User',
                fullname: 'Normal User', role: Role.User, roles: [Role.User], inactive: false
            }
        ];

        const authHeader = request.headers.get('Authorization');
        const isLoggedIn = authHeader && authHeader.startsWith('Bearer fake-jwt-token');
        const roleString = isLoggedIn && authHeader.split('.')[1];
        const role = roleString ? Role[roleString] : null;

        // wrap in delayed observable to simulate server api call
        return of(null).pipe(mergeMap(() => {

            // authenticate - public
            if (request.url.endsWith('/users/authenticate') && request.method === 'POST') {
                const user = users.find(x => x.email === request.body.email && x.password === request.body.password);
                if (!user) {
                    return error('Username or password is incorrect');
                }
                return ok({
                    id: user.id,
                    email: user.email,
                    firstname: user.firstname,
                    surname: user.surname,
                    role: user.role,
                    token: `fake-jwt-token.${user.role}`
                });
            }

            // get user by id - admin or user (user can only access their own record)
            if (request.url.match(/\/users\/\d+$/) && request.method === 'GET') {
                if (!isLoggedIn) {
                    return unauthorised();
                }

                // get id from request url
                const urlParts = request.url.split('/');
                const id = urlParts[urlParts.length - 1];

                // only allow normal users access to their own record
                const currentUser = users.find(x => x.role === role);
                if (id !== currentUser.id && role !== Role.Administrator) {
                    return unauthorised();
                }

                const user = users.find(x => x.id === id);
                return ok(user);
            }

            // get all users (admin only)
            if (request.url.endsWith('/users') && request.method === 'GET') {
                if (role !== Role.Administrator) {
                    return unauthorised();
                }
                return ok(users);
            }

            // pass through any requests not handled above
            return next.handle(request);
        }))
        // call materialize and dematerialize to ensure delay even if an error is thrown
        // (https://github.com/Reactive-Extensions/RxJS/issues/648)
            .pipe(materialize())
            .pipe(delay(500))
            .pipe(dematerialize());

        // private helper functions

        function ok(body) {
            return of(new HttpResponse({status: 200, body}));
        }

        function unauthorised() {
            return throwError({status: 401, error: {message: 'Unauthorised'}});
        }

        function error(message) {
            return throwError({status: 400, error: {message}});
        }
    }
}

export let fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};
