import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {Dashboard} from '../../_models/dashboard';
import {Collection} from '../../_models/collection';
import {MediaMatcher} from '@angular/cdk/layout';

@Component({
    selector: 'app-dashboard-preview',
    templateUrl: './dashboard-preview.component.html',
    styleUrls: ['./dashboard-container.component.css']
})
export class DashboardPreviewComponent implements OnInit {
    @Input() dashboard: Dashboard;
    @Input() parent: Collection;
    @Input() canEdit: boolean;
    mobileQuery: MediaQueryList;
    private readonly _mobileQueryListener: () => void;

    constructor(changeDetectorRef: ChangeDetectorRef,
                media: MediaMatcher) {
        this.mobileQuery = media.matchMedia('(min-width: 820px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addEventListener('change', this._mobileQueryListener);
    }

    ngOnInit(): void {
    }

}
