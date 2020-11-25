import {ChangeDetectorRef, Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {Chart} from '../_models/chart';
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
import {environment} from '../../environments/environment';
import {QueryBaseComponent} from './query.base.component';
import {AlertService} from '../_services/alert.service';
import {QueryService} from '../_services/query.service';
import {DataSourceService} from '../_services/data.source.service';
import {DashboardView} from '../_models/dashboard_view';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends QueryBaseComponent implements OnInit {

    dashboard: Dashboard;
    dataSources: DataSource[];
    dateViews: DashboardView[] = [];
    isAdmin = false;
    @ViewChild('iframe') iframe;
    mobileQuery: MediaQueryList;
    addedChart: Chart;
    addedSingleStat: SingleStat;
    contentURL: SafeResourceUrl;
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
                private sanitizer: DomSanitizer,
                protected route: ActivatedRoute,
                protected http: HttpClient,
                protected dialog: MatDialog,
                protected authService: AuthenticationService,
                protected copyService: CopyService,
                protected dashboardService: DashboardService,
                protected dataSourceService: DataSourceService,
                private queryService: QueryService) {
        super(authService, dashboardService);
        this.mobileQuery = media.matchMedia('(min-width: 820px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addEventListener('change', this._mobileQueryListener);
    }

    ngOnInit() {
        // only admin can add and edit
        this.isAdmin = this.authService.hasRole('Administrator');
        this.route.parent.params.subscribe(params => {
            this.getDashboard(+params['dashboard_id']);
            this.trustURL(+params['dashboard_id']);
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
            this.postDateSelection();
        });
    }

    @HostListener('window:message', ['$event']) onPostMessage(event) {
        if (event.origin === environment.scriptBaseURL) {
            const data = event.data;
            if (data.query) {
                this.runQuery(data.query.name, data.query.values);
            } else if (data.status && data.status === 'ready') {
                this.postDateSelection();
            }
        }
    }

    postDateSelection() {
        if (this.iframe && this.iframe.nativeElement.contentWindow) {
            const data = {type: 'date_range_updated', message: this.dateSelection};
            this.iframe.nativeElement.contentWindow.postMessage(data, environment.scriptBaseURL);
        }
    }

    // load query and return result to iframe
    runQuery(queryName, params) {
        this.queryService.runQuery(this.dashboard.id, queryName, params).subscribe(resp => {
            const result = {result: {query_name: queryName, results: resp}};
            const data = {type: 'result', message: result};
            this.iframe.nativeElement.contentWindow.postMessage(data, environment.scriptBaseURL);
        });
    }

    trustURL(dashboardId) {
        const url = environment.scriptBaseURL + '/api/dashboards/' + dashboardId + '/content';
        this.contentURL = this.sanitizer.bypassSecurityTrustResourceUrl(url);
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
        this.variables = this.dashboard.variables;
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
