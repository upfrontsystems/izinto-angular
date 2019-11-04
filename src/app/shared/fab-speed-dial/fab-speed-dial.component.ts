import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { fabSpeedDialAnimations } from './fab-speed-dial.animations';

@Component({
    selector: 'app-fab-speed-dial',
    templateUrl: './fab-speed-dial.component.html',
    styleUrls: ['./fab-speed-dial.component.scss'],
    animations: fabSpeedDialAnimations
})
export class FabSpeedDialComponent {

    @Input()
    fabButtons: {icon: string, link: string, label: string}[];
    // display text instead of buttons
    @Input() text: string;
    @Output() buttonClick = new EventEmitter<string>();

    visible = false;
    state = 'inactive';
    buttons = [];

    constructor() { }

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
    }
}
