import {Directive, HostListener} from '@angular/core';
import {Subject} from 'rxjs';

// Alias event to work around Edge, FF and Safari reference error
export type AppTouchEvent = TouchEvent;

@Directive({
    selector: '[appTouchListener]'
})
export class TouchListenerDirective {

    private touchSub = new Subject<AppTouchEvent>();
    public touch = this.touchSub.asObservable();

    @HostListener('touchmove', ['$event'])
    onTouchMove(event: AppTouchEvent) {
        this.touchSub.next(event);
    }
}
