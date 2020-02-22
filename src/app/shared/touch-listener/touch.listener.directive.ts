import {Directive, HostListener} from '@angular/core';
import {Subject} from 'rxjs';

@Directive({
    selector: '[appTouchListener]'
})
export class TouchListenerDirective {

    private touchSub = new Subject<TouchEvent>();
    public touch = this.touchSub.asObservable();

    @HostListener('touchmove', ['$event'])
    onTouchMove(event: TouchEvent) {
        this.touchSub.next(event);
    }
}
