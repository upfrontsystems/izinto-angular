import {Injectable} from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

import {AuthenticationService} from '../_services/authentication.service';
import {AlertService} from '../_services/alert.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(
        private authenticationService: AuthenticationService,
        private alertService: AlertService) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if ([401, 403].indexOf(err.status) !== -1) {
                // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
                this.authenticationService.logout();
                location.reload(true);
            }

            // parse blob response
            if (err instanceof HttpErrorResponse && err.error instanceof Blob && err.error.type === 'application/json') {
                return new Promise<any>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e: Event) => {
                        try {
                            const errmsg = JSON.parse((e.target as any).result);
                            const error = errmsg.message || err.statusText;
                            this.alertService.error(error);
                        } catch (e) {
                            reject(err);
                        }
                    };
                    reader.onerror = (e) => {
                        reject(err);
                    };
                    reader.readAsText(err.error);
                });
            } else {
                const error = err.error.message || err.statusText;
                this.alertService.error(error);
                return throwError(error);
            }
        }));
    }
}
