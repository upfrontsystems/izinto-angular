import {Injectable} from '@angular/core';
import {Router, NavigationStart} from '@angular/router';
import {Observable, Subject} from 'rxjs';

@Injectable()
export class AlertService {
    private subject = new Subject<any>();
    private keepAfterNavigationChange = false;

    constructor(private router: Router) {
        // clear alert message on route change
        router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                if (!this.keepAfterNavigationChange) {
                    // clear alert
                    this.subject.next();
                }
            }
        });
    }

    success(message: string, keepAfterNavigationChange = false, timeout = 8000) {
        this.subject.next();
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next({ type: 'success', text: this.formatMessage(message), timeout });
    }

    error(message: string, keepAfterNavigationChange = false, timeout = 8000) {
        this.subject.next();
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next({ type: 'danger', text: this.formatMessage(message), timeout });
    }

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }

    formatMessage(message) {
        try {
            return message.error.message;
        } catch (err) {
            return message;
        }
    }

    clear() {
        this.subject.next();
    }
}
