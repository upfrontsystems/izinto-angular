import {Component, OnInit} from '@angular/core';
import { Location } from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {CollectionService} from '../../_services/collection.service';
import {DataSourceService} from '../../_services/data.source.service';
import {DashboardService} from '../../_services/dashboard.service';
import {Dashboard} from '../../_models/dashboard';
import {DataSource} from '../../_models/data.source';
import {DashboardView} from '../../_models/dashboard_view';

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
export class DashboardContainerComponent implements OnInit {
    canEdit = false;
    dashboardId: number;
    dashboard: Dashboard;
    siblings: Dashboard[] = [];
    parent: any;
    dataSources: DataSource[];
    dateViews: DashboardView[] = [];
    slider: Slider = new Slider();

    constructor(protected route: ActivatedRoute,
                private router: Router,
                protected http: HttpClient,
                private location: Location,
                protected collectionService: CollectionService,
                protected dataSourceService: DataSourceService,
                protected dashboardService: DashboardService) {
    }

    ngOnInit(): void {
        this.slider.sensitivity = 25;
        this.slider.activeSlide = 0;
        this.slider.slideCount = 1;

        this.route.paramMap.subscribe(params => {
            this.dashboardId = +params.get('dashboard_id');
            this.getDashboardViews();
            this.getDataSources();
            this.getDashboard();
        });
    }

    getDashboardViews() {
        this.dashboardService.listDashboardViews().subscribe(resp => {
            this.dateViews = resp;
        });
    }

    getDataSources() {
        this.dataSourceService.getAll({}).subscribe(resp => {
            this.dataSources = resp;
        });
    }

    getDashboard() {
        this.dashboardService.getById(this.dashboardId).subscribe(resp => {
            this.dashboard = resp;
            this.dashboardService.currentDashboard.emit(this.dashboard);
            this.getSiblings();
            if (resp.collection_id) {
                this.collectionService.getById(resp.collection_id).subscribe(collection => {
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
        });
    }

    getSiblings() {
        const parentId = this.dashboard.collection_id ? this.dashboard.collection_id : '';
        this.dashboardService.getDashboards({user_id: true, collection_id: parentId}).subscribe(resp => {
            this.siblings = resp;

            this.slider.activeSlide = this.siblings.findIndex(dash => dash.id === this.dashboardId);
            this.slider.slideCount = this.siblings.length;
        });
    }

    setDashboard() {
        if (this.dashboardId === this.siblings[this.slider.activeSlide].id) {
            return;
        }
        this.dashboard = this.siblings[this.slider.activeSlide];
        this.location.replaceState(this.router.url.replace('dashboards/' + this.dashboardId,
            'dashboards/' + this.dashboard.id));
        this.dashboardId = this.dashboard.id;
        this.dashboardService.currentDashboard.emit(this.dashboard);
    }

    dashboardEdited(dashboard) {
        this.siblings[this.slider.activeSlide] = dashboard;
        this.dashboard = dashboard;
        this.dashboardService.currentDashboard.emit(this.dashboard);
    }

    sliderManager(e) {
        // dont animate when moving up/down
        if (Math.abs(e.deltaX / 2) < Math.abs(e.deltaY)) {
            e.preventDefault();
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
                if (percentage <= -(this.slider.sensitivity / this.slider.slideCount)) {
                    this.goToDashboard(this.slider.activeSlide + 1);
                } else if (percentage >= (this.slider.sensitivity / this.slider.slideCount)) {
                    this.goToDashboard(this.slider.activeSlide - 1);
                } else {
                    this.goToDashboard(this.slider.activeSlide);
                }
            }
        }
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
        // show next slide
        clearTimeout(this.slider.timer);
        this.slider.timer = setTimeout(function () {
            context.slider.transform = 0;
            context.slider.classList = '';
        }, 400);
    }
}
