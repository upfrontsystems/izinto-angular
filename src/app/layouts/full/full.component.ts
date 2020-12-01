import {MediaMatcher} from '@angular/cdk/layout';
import {CdkScrollable, ScrollDispatcher} from '@angular/cdk/scrolling';
import {ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {map} from 'rxjs/operators';

import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {AuthenticationService} from '../../_services/authentication.service';
import {CollectionService} from '../../_services/collection.service';
import {DashboardService} from '../../_services/dashboard.service';
import {Router} from '@angular/router';
import {DashboardLinks} from '../../_models/dashboard';
import {MobileBreakpoint} from '../../_models/chart';

/** @title Responsive sidenav */
@Component({
    selector: 'app-full-layout',
    templateUrl: 'full.component.html',
    styleUrls: ['./full.component.scss']
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
    toolbarMargin = 0;
    topMargin = 64;
    parentURL = '/';
    dashboardLinks = DashboardLinks;

    public config: PerfectScrollbarConfigInterface = {};
    private readonly _mobileQueryListener: () => void;

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
        this.mobileQuery = media.matchMedia('(min-width: ' + MobileBreakpoint + 'px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addEventListener('change', this._mobileQueryListener);
    }

    ngOnInit() {
        this.dashboardService.toggleDateSelect.subscribe(status => this.dateSelectOpened = status);
        this.dashboardService.currentDashboard.subscribe(dashboard => {
            this.currentDashboard = dashboard;
            if (dashboard && dashboard.collection_id) {
                this.parentURL = '/collections/' + dashboard.collection_id;
            } else {
                this.parentURL = '/';
            }
        });
        this.scrollDispatcher.scrolled()
            .pipe(map((event: CdkScrollable) => event.getElementRef().nativeElement.scrollTop))
            .subscribe(newScrollTop => this.ngZone.run(() => {
                if (newScrollTop !== this.scrollTop) {
                    if (newScrollTop - this.scrollTop > 0) {
                        this.topMargin = ((64 - newScrollTop) > 0) ? 64 - newScrollTop : 0;
                        this.toolbarMargin = (this.topMargin - 64) * 2;
                    } else {
                        this.topMargin = 64;
                        this.toolbarMargin = 0;
                    }
                    this.scrollTop = newScrollTop;
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
