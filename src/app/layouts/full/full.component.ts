import {MediaMatcher} from '@angular/cdk/layout';
import {CdkScrollable, ScrollDispatcher} from '@angular/cdk/scrolling';
import {
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    NgZone
} from '@angular/core';
import { map } from 'rxjs/operators';

import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {AuthenticationService} from '../../_services/authentication.service';
import {CollectionService} from '../../_services/collection.service';
import {DashboardService} from '../../_services/dashboard.service';
import {Router} from '@angular/router';

/** @title Responsive sidenav */
@Component({
    selector: 'app-full-layout',
    templateUrl: 'full.component.html',
    styles: ['.site-title {font-family: Dosis, sans-serif; font-size: 36px; color: black}']
})
export class FullComponent implements OnInit, OnDestroy {
    mobileQuery: MediaQueryList;
    dir = 'ltr';
    green: boolean;
    blue: boolean;
    dark: boolean;
    minisidebar: boolean;
    boxed: boolean;
    danger: boolean;
    sidebarOpened = false;
    dateSelectOpened = false;
    currentDashboard = undefined;
    scrollTop = 0;
    topMargin = 64;
    parentURL = '/';

    public config: PerfectScrollbarConfigInterface = {};
    private readonly _mobileQueryListener: () => void;
    public toolbarHidden = false;

    constructor(
        changeDetectorRef: ChangeDetectorRef,
        media: MediaMatcher,
        public authService: AuthenticationService,
        private collectionService: CollectionService,
        private dashboardService: DashboardService,
        private scrollDispatcher: ScrollDispatcher,
        private ngZone: NgZone,
        public router: Router,
    ) {
        this.mobileQuery = media.matchMedia('(min-width: 768px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addEventListener('change', this._mobileQueryListener);
    }

    ngOnInit() {
        this.dashboardService.toggleDateSelect.subscribe(status => this.dateSelectOpened = status);
        this.dashboardService.currentDashboard.subscribe(dashboard => {
            this.currentDashboard = dashboard;
            if (dashboard.collection_id) {
                this.parentURL = '/collections/' + dashboard.collection_id;
            } else {
                this.parentURL = '/';
            }
        });
        this.scrollDispatcher.scrolled()
            .pipe(map((event: CdkScrollable) => event.getElementRef().nativeElement.scrollTop))
            .subscribe(newScrollTop => this.ngZone.run(() => {
                if (newScrollTop !== this.scrollTop) {
                    this.toolbarHidden = newScrollTop - this.scrollTop > 0;
                    this.scrollTop = newScrollTop;
                    this.topMargin = ((64 - this.scrollTop) > 0) ? 64 - this.scrollTop : 0;
                }
            }));
    }

    toggleDateSelect() {
        this.dashboardService.toggleDateSelect.emit(!this.dateSelectOpened);
    }

    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this._mobileQueryListener);
    }
}
