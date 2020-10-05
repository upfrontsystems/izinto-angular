import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {CollectionService} from '../../_services/collection.service';
import {DashboardService} from '../../_services/dashboard.service';
import {Dashboard, DashboardLinks} from '../../_models/dashboard';
import {AuthenticationService} from '../../_services/authentication.service';
import {MediaMatcher} from '@angular/cdk/layout';

export class Slider {
    sensitivity: number;
    activeSlide: number;
    slideCount: number;
    transform: number;
    classList: string;
    timer: any;
}

@Component({
    selector: 'app-dashboard-container',
    templateUrl: './dashboard-container.component.html',
    styleUrls: ['./dashboard-container.component.css']
})
export class DashboardContainerComponent implements OnInit, OnDestroy {
    dashboard: Dashboard;
    siblings: Dashboard[] = [];
    parent: any;
    slider: Slider = new Slider();
    canSlide = false;
    isAdmin = false;
    dashboardLinks = DashboardLinks;
    mobileQuery: MediaQueryList;
    private readonly _mobileQueryListener: () => void;

    constructor(changeDetectorRef: ChangeDetectorRef,
                media: MediaMatcher,
                protected route: ActivatedRoute,
                private router: Router,
                protected http: HttpClient,
                private location: Location,
                protected authService: AuthenticationService,
                protected collectionService: CollectionService,
                protected dashboardService: DashboardService) {
        this.mobileQuery = media.matchMedia('(min-width: 768px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addEventListener('change', this._mobileQueryListener);
    }

    ngOnInit(): void {
        // only admin can add and edit
        this.isAdmin = this.authService.hasRole('Administrator');

        this.slider.sensitivity = 40;
        this.slider.activeSlide = 0;
        this.slider.slideCount = 1;

        this.route.paramMap.subscribe(params => {
            this.getDashboard(+params.get('dashboard_id'));
        });
        // check if back in view tab
        this.canSlide = this.router.url.includes('view');
        this.router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                this.canSlide = val.url.includes('view');
            }
        });

        this.dashboardService.currentDashboard.subscribe(dashboard => {
            if (dashboard) {
                this.dashboardEdited(dashboard);
            }
        });
    }

    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this._mobileQueryListener);
    }

    getDashboard(dashboardId) {
        // check if dashboard is in service
        const existing = this.dashboardService.currentDashboardValue;
        if (existing && existing.id === dashboardId) {
            this.dashboard = existing;
            this.getSiblings();
            this.getCollection();
        } else {
            this.dashboardService.getById(dashboardId).subscribe(resp => {
                this.dashboard = resp;
                this.dashboardService.setCurrentDashboard(this.dashboard);
                this.getSiblings();
                this.getCollection();
            });
        }
    }

    getCollection() {
        if (this.dashboard.collection_id) {
            this.collectionService.getById(this.dashboard.collection_id).subscribe(collection => {
                this.parent = {
                    title: collection.title,
                    url: '/collections/' + collection.id
                };
            });
        } else {
            this.parent = {
                title: 'Home',
                url: '/'
            };
        }
    }

    getSiblings() {
        const parentId = this.dashboard.collection_id ? this.dashboard.collection_id : '';
        this.dashboardService.getDashboards({user_id: true, collection_id: parentId}).subscribe(resp => {
            this.siblings = resp;

            this.slider.activeSlide = this.siblings.findIndex(dash => dash.id === this.dashboard.id);
            this.slider.slideCount = this.siblings.length;
        });
    }

    setDashboard() {
        if (this.dashboard.id === this.siblings[this.slider.activeSlide].id) {
            return;
        }
        this.dashboard = this.siblings[this.slider.activeSlide];
        this.location.replaceState(this.router.url.replace('dashboards/' + this.dashboard.id,
            'dashboards/' + this.dashboard.id));
        this.dashboardService.setCurrentDashboard(this.dashboard);
    }

    dashboardEdited(dashboard) {
        this.siblings[this.slider.activeSlide] = dashboard;
        this.dashboard = dashboard;
    }

    sliderManager(e) {
        // dont animate when moving up/down
        if (this.canSlide && Math.abs(e.deltaX / 5) < Math.abs(e.deltaY)) {
            return;
        }
        // move element
        const percentage = 100 / this.slider.slideCount * e.deltaX / window.innerWidth;
        this.slider.transform = percentage;

        // move to next/previous dashboard when done
        if (e.isFinal) {
            if (e.velocityX > 1) {
                this.goToDashboard(this.slider.activeSlide - 1);
            } else if (e.velocityX < -1) {
                this.goToDashboard(this.slider.activeSlide + 1);
            } else {
                // test if movement was over sensitivity
                if (percentage <= -(this.slider.sensitivity / this.slider.slideCount)) {
                    this.goToDashboard(this.slider.activeSlide + 1);
                } else if (percentage >= (this.slider.sensitivity / this.slider.slideCount)) {
                    this.goToDashboard(this.slider.activeSlide - 1);
                } else {
                    // move back into position
                    this.transformBack();
                }
            }
        }
    }

    // do not go to next slide
    // move back to original position
    transformBack() {
        this.slider.classList = 'is-animating';
        this.slider.transform = 0;
        const context = this;
        clearTimeout(this.slider.timer);
        this.slider.timer = setTimeout(function () {
            context.slider.classList = '';
        }, 300);
    }

    goToDashboard(number) {
        const direction = this.slider.activeSlide - number;
        if (number < 0) {
            this.slider.activeSlide = this.siblings.length - 1;
        } else if (number > this.siblings.length - 1) {
            this.slider.activeSlide = 0;
        } else {
            this.slider.activeSlide = number;
        }
        // load next dashboard
        this.setDashboard();

        // apply and finish transformation
        // move current slide out of view
        this.slider.classList = 'is-animating';
        if (direction < 0) {
            this.slider.transform = -100;
        } else {
            this.slider.transform = 100;
        }

        const context = this;
        // move slide out of view
        clearTimeout(this.slider.timer);
        this.slider.timer = setTimeout(function () {
            context.slider.classList = '';
            if (direction < 0) {
                context.slider.transform = 100;
            } else {
                context.slider.transform = -100;
            }

            // move in next slide
            context.slider.timer = setTimeout(function () {
                context.slider.classList = 'is-animating';
                context.slider.transform = 0;
            }, 300);
        }, 300);
    }
}
