import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Chart, MobileBreakpoint} from '../_models/chart';
import {Dashboard} from '../_models/dashboard';
import {DashboardService} from '../_services/dashboard.service';
import {ChartDialogComponent} from './chart/chart.dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute} from '@angular/router';
import {SingleStatDialogComponent} from './single-stat/single.stat.dialog.component';
import {SingleStat} from '../_models/single.stat';
import {DataSource} from '../_models/data.source';
import {MediaMatcher} from '@angular/cdk/layout';
import {AuthenticationService} from '../_services/authentication.service';
import {CopyService} from '../_services/copy.service';
import {QueryBaseComponent} from './query.base.component';
import {AlertService} from '../_services/alert.service';
import {DataSourceService} from '../_services/data.source.service';
import {DashboardView} from '../_models/dashboard_view';
import { Collection } from '../_models/collection';
import { CollectionService } from '../_services/collection.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends QueryBaseComponent implements OnInit {

    dashboard: Dashboard;
    collection: Collection;
    dataSources: DataSource[];
    dateViews: DashboardView[] = [];
    isAdmin = false;
    canEdit = false;
    mobileQuery: MediaQueryList;
    addedChart: Chart;
    addedSingleStat: SingleStat;
    fabButtons = [
        {
            icon: 'collections_bookmark',
            label: 'Paste Chart',
        },
        {
            icon: 'add',
            label: 'Add Chart',
        },
        {
            icon: 'collections',
            label: 'Paste Single Stat',
        },
        {
            icon: 'add',
            label: 'Add Single Stat',
        }
    ];
    private readonly _mobileQueryListener: () => void;

    constructor(changeDetectorRef: ChangeDetectorRef,
                media: MediaMatcher,
                protected alertService: AlertService,
                protected route: ActivatedRoute,
                protected http: HttpClient,
                protected dialog: MatDialog,
                protected authService: AuthenticationService,
                protected copyService: CopyService,
                protected collectionService: CollectionService,
                protected dashboardService: DashboardService,
                protected dataSourceService: DataSourceService) {
        super(authService, dashboardService);
        this.mobileQuery = media.matchMedia('(min-width: ' + MobileBreakpoint + 'px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addEventListener('change', this._mobileQueryListener);
    }

    ngOnInit() {
        // only admin can add and edit
        this.isAdmin = this.authService.hasRole('Administrator');
        this.canEdit = this.isAdmin === true;

        this.route.parent.params.subscribe(params => {
            this.getDashboard(+params['dashboard_id']);
        });
        this.getDataSources();
        this.getDashboardViews();
        this.dateSelection = this.dashboardService.getDateSelection();

        this.dashboardService.currentDashboard.subscribe(dashboard => {
            if (dashboard) {
                this.setDashboard(dashboard);
            }
        });
        this.dashboardService.datesUpdated.subscribe((selection) => {
            this.dateSelection = selection;
        });
    }

    getDashboard(dashboardId) {
        // check if dashboard is in service
        const existing = this.dashboardService.currentDashboardValue;
        if (existing && existing.id === dashboardId) {
            this.setDashboard(existing);
        }
    }

    setDashboard(dashboard) {
        this.dashboard = dashboard;
        // load collection and collection variables
        if (this.dashboard.collection_id && this.dashboard.type === 'new') {
            this.collectionService.getById(this.dashboard.collection_id).subscribe(resp => {
                this.collection = resp;
            });
        }
        this.variables = this.dashboard.variables;
        // check user permission
        this.isAdmin = this.isAdmin || this.dashboard.user_access.role === 'Administrator';
        this.canEdit = this.isAdmin || this.dashboard.user_access.role === 'Edit';
    }

    getDataSources() {
        this.dataSourceService.getAll({}).subscribe(resp => {
            this.dataSources = resp;
        });
    }

    getDashboardViews() {
        this.dashboardService.listDashboardViews().subscribe(resp => {
            this.dateViews = resp;
        });
    }

    fabClick(label) {
        if (label === 'Add Chart') {
            this.addChart();
        } else if (label === 'Paste Chart') {
            this.pasteChart();
        } else if (label === 'Add Single Stat') {
            this.addSingleStat();
        } else if (label === 'Paste Single Stat') {
            this.pasteSingleStat();
        }
    }

    addChart() {
        const dialogRef = this.dialog.open(ChartDialogComponent, {
            width: '600px',
            data: {chart: {dashboard_id: this.dashboard.id, group_by: []}, dataSources: this.dataSources, dateViews: this.dateViews},
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.addedChart = result;
            }
        });
    }

    pasteChart() {
        this.copyService.pasteChart(this.dashboard.id).subscribe(resp => {
            this.addedChart = resp;
            this.copyService.clearCopied('chart');
        });
    }

    addSingleStat() {
        const dialogRef = this.dialog.open(SingleStatDialogComponent, {
            width: '600px',
            data: {singleStat: {dashboard_id: this.dashboard.id}, dataSources: this.dataSources},
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.addedSingleStat = result;
            }
        });
    }

    pasteSingleStat() {
        this.copyService.pasteSingleStat(this.dashboard.id).subscribe(resp => {
            this.addedSingleStat = resp;
            this.copyService.clearCopied('single_stat');
        });
    }
}
