import * as $ from 'jquery';
import {MediaMatcher} from '@angular/cdk/layout';
import {Router} from '@angular/router';
import {
    ChangeDetectorRef,
    Component,
    NgZone,
    OnDestroy,
    ViewChild,
    HostListener,
    Directive,
    AfterViewInit, OnInit
} from '@angular/core';
import {AppHeaderComponent} from './header/header.component';
import {AppSidebarComponent} from './sidebar/sidebar.component';

import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {AuthenticationService} from '../../_services/authentication.service';
import {DashboardService} from '../../_services/dashboard.service';

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
    showHide: boolean;
    sidebarOpened = false;
    dateSelectOpened = false;

    public config: PerfectScrollbarConfigInterface = {};
    private _mobileQueryListener: () => void;

    constructor(
        changeDetectorRef: ChangeDetectorRef,
        media: MediaMatcher,
        public authService: AuthenticationService,
        private dashboardService: DashboardService
    ) {
        this.mobileQuery = media.matchMedia('(min-width: 768px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);
    }

    ngOnInit() {
        this.dashboardService.toggleDateSelect.subscribe(status => this.dateSelectOpened = status);
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
