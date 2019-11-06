import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable()
export class SpinnerService {
    private subject = new Subject<boolean>();
    // keep track of active requests
    count = 0;

    constructor() {}

    show() {
        this.count += 1;
        this.subject.next(this.count > 0);
    }

    hide() {
        this.count -= 1;
        if (this.count < 0) {
            this.count = 0;
        }
        this.subject.next(this.count > 0);
    }

    stop() {
        this.count = 0;
        this.subject.next(this.count > 0);
    }

    isSpinning(): Observable<any> {
        return this.subject.asObservable();
    }
}
