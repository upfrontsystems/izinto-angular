import {Directive, HostListener} from '@angular/core';
import {Subject} from 'rxjs';

@Directive({
    selector: '[appMouseListener]'
})
export class MouseListenerDirective {

    constructor() {
    }

    private overSub = new Subject<MouseEvent>();
    public over = this.overSub.asObservable();
    private outSub = new Subject<MouseEvent>();
    public out = this.outSub.asObservable();
    private moveSub = new Subject<MouseEvent>();
    public move = this.moveSub.asObservable();
    private clickSub = new Subject<MouseEvent>();
    public click = this.clickSub.asObservable();

    @HostListener('mouseover', ['$event']) onMouseOver(event: MouseEvent) {
        this.overSub.next(event);
    }

    @HostListener('mouseout', ['$event']) onMouseOut(event: MouseEvent) {
        this.outSub.next(event);
    }

    @HostListener('mousemove', ['$event']) onMouseMove(event: MouseEvent) {
        this.moveSub.next(event);
    }

    @HostListener('click', ['$event']) onMouseClick(event: MouseEvent) {
        event.preventDefault();
        this.clickSub.next(event);
        event.preventDefault();
    }
}
