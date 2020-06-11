import {Component, EventEmitter, Input, NgZone, OnInit, Output} from '@angular/core';
import { fabSpeedDialAnimations } from './fab-speed-dial.animations';
import {CdkScrollable, ScrollDispatcher} from '@angular/cdk/scrolling';
import {CopyService} from '../../_services/copy.service';
import {map} from 'rxjs/operators';

@Component({
    selector: 'app-fab-speed-dial',
    templateUrl: './fab-speed-dial.component.html',
    styleUrls: ['./fab-speed-dial.component.scss'],
    animations: fabSpeedDialAnimations
})
export class FabSpeedDialComponent implements OnInit {

    @Input()
    fabButtons: {icon: string, link: string, label: string}[];
    // display text instead of buttons
    @Input() text: string;
    @Output() buttonClick = new EventEmitter<string>();

    hidden = false;
    state = 'inactive';
    buttons = [];
    scrollTop = 0;

    constructor(protected copyService: CopyService,
                private ngZone: NgZone,
                private scrollDispatcher: ScrollDispatcher) { }

    ngOnInit() {
        this.scrollDispatcher.scrolled()
            .pipe(map((event: CdkScrollable) => window.scrollY))
            .subscribe(newScrollTop => this.ngZone.run(() => {
                if (newScrollTop !== this.scrollTop) {
                    this.hidden = newScrollTop - this.scrollTop > 0;
                    this.scrollTop = newScrollTop;
                }
            }));
    }

    showItems() {
        this.state = 'active';
        this.buttons = this.fabButtons;
    }

    hideItems() {
        this.state = 'inactive';
        this.buttons = [];
    }

    onToggleFab() {
        this.buttons.length ? this.hideItems() : this.showItems();
    }

    onButtonClick(buttonId) {
        this.buttonClick.next(buttonId);
        this.hideItems();
    }

    showButton(button) {
        if (button.label === 'Paste Dashboard') {
            return this.copyService.canPaste('dashboard');
        }
        if (button.label === 'Paste Collection') {
            return this.copyService.canPaste('collection');
        }
        if (button.label === 'Paste Chart') {
            return this.copyService.canPaste('chart');
        }
        if (button.label === 'Paste Single Stat') {
            return this.copyService.canPaste('single_stat');
        }
        return true;
    }
}
