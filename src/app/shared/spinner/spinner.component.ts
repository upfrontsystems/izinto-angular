import {
    Component,
    Input,
    OnDestroy,
    Inject,
    ViewEncapsulation, OnInit
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {SpinnerService} from '../../_services/spinner.service';

@Component({
    selector: 'app-spinner',
    template: `
        <div class="preloader" [style.backgroundColor]="backgroundColor" *ngIf="isSpinnerVisible">
            <div class="spinner">
                <div class="double-bounce1"></div>
                <div class="double-bounce2"></div>
            </div>
        </div>`,
    encapsulation: ViewEncapsulation.None
})
export class SpinnerComponent implements OnDestroy, OnInit {
    public isSpinnerVisible = false;

    @Input() public backgroundColor = 'rgba(255, 255, 255, 0.69)';

    constructor(
        private spinnerService: SpinnerService,
        @Inject(DOCUMENT) private document: Document) {
    }

    ngOnInit() {
        this.spinnerService.isSpinning().subscribe(spinning => {
            this.isSpinnerVisible = spinning;
        });
    }

    ngOnDestroy(): void {
        this.isSpinnerVisible = false;
    }
}
