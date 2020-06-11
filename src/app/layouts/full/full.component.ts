import * as $ from 'jquery';
import {MediaMatcher} from '@angular/cdk/layout';
import {CdkScrollable, ScrollDispatcher} from '@angular/cdk/scrolling';
import {
    ChangeDetectorRef,
    Component,
    OnDestroy,
    AfterViewInit, OnInit, NgZone
} from '@angular/core';
import { map } from 'rxjs/operators';

import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {AuthenticationService} from '../../_services/authentication.service';
import {DashboardService} from '../../_services/dashboard.service';
import {Router} from '@angular/router';

/** @title Responsive sidenav */
@Component({
    selector: 'app-full-layout',
    templateUrl: 'full.component.html',
    styles: ['.site-title {font-family: Dosis, sans-serif; font-size: 36px; color: black}']
})
export class FullComponent implements OnInit, OnDestroy, AfterViewInit {
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
    scrollTop = 0;

    public config: PerfectScrollbarConfigInterface = {};
    private readonly _mobileQueryListener: () => void;
    public toolbarHidden = false;

    constructor(
        changeDetectorRef: ChangeDetectorRef,
        media: MediaMatcher,
        public authService: AuthenticationService,
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
        this.scrollDispatcher.scrolled()
            .pipe(map((event: CdkScrollable) => this.getScrollPosition(event)))
            .subscribe(newScrollTop => this.ngZone.run(() => {
                if (newScrollTop !== this.scrollTop) {
                    this.toolbarHidden = newScrollTop - this.scrollTop > 0;
                    this.scrollTop = newScrollTop;
                }
            }));
    }

    getScrollPosition(event) {
        if (event) {
            return event.getElementRef().nativeElement.scrollTop;
        } else {
            return window.scrollY;
        }
    }

    toggleDateSelect() {
        this.dashboardService.toggleDateSelect.emit(!this.dateSelectOpened);
    }

    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this._mobileQueryListener);
    }

    ngAfterViewInit() {
        // This is for the topbar search
        (<any>$('.srh-btn, .cl-srh-btn')).on('click', function () {
            (<any>$('.app-search')).toggle(200);
        });
    }
}
