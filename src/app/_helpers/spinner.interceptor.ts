import {Injectable} from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import {Observable} from 'rxjs';
import {finalize} from 'rxjs/operators';
import {SpinnerService} from '../_services/spinner.service';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router} from '@angular/router';

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {

    constructor(private router: Router,
                public spinnerService: SpinnerService) {
        this.router.events.subscribe(
            event => {
                if (event instanceof NavigationStart) {
                    this.spinnerService.show();
                } else if (event instanceof NavigationEnd) {
                    this.spinnerService.hide();
                } else if (event instanceof NavigationCancel ||
                    event instanceof NavigationError) {
                    this.spinnerService.stop();
                }
            },
            () => {
                this.spinnerService.stop();
            }
        );
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        console.log(req.headers.get('x-show-spinner'));
        if (req.headers.get('x-show-spinner') === 'no') {
            return next.handle(req);
        } else {
            this.spinnerService.show();
            return next.handle(req).pipe(
                finalize(() => {
                    this.spinnerService.hide();
                })
            );
        }
    }
}
