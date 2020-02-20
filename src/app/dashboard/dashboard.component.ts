import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Chart} from '../_models/chart';
import {Dashboard} from '../_models/dashboard';
import {DashboardService} from '../_services/dashboard.service';
import {ChartDialogComponent} from './chart/chart.dialog.component';
import {MatDialog} from '@angular/material';
import {ActivatedRoute} from '@angular/router';
import {SingleStatDialogComponent} from './single-stat/single.stat.dialog.component';
import {SingleStat} from '../_models/single.stat';
import {DataSource} from '../_models/data.source';
import {DataSourceService} from '../_services/data.source.service';
import {ChartService} from '../_services/chart.service';
import {SingleStatService} from '../_services/single.stat.service';
import {MediaMatcher} from '@angular/cdk/layout';
import {DashboardView} from '../_models/dashboard_view';
import * as moment from 'moment';
import {AuthenticationService} from '../_services/authentication.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

    mobileQuery: MediaQueryList;
    canEdit = false;
    dashboardId: number;
    dashboard: Dashboard;
    dataSources: DataSource[];
    addedChart: Chart;
    addedSingleStat: SingleStat;
    dateViews: DashboardView[] = [];
    dateView = 'Month';
    private range = {
        'Hour': {'count': 1, 'unit': 'h'},
        'Day': {'count': 1, 'unit': 'd'},
        'Week': {'count': 7, 'unit': 'd'},
        'Month': {'count': 30, 'unit': 'd'}
    };
    dateFormat = {
        'Hour': 'D MMM h:mm a', 'Day': 'D MMMM Y', 'Week': 'D MMMM Y', 'Month': 'D MMMM Y',
        'mobile': {'Hour': 'D/MM H:mm', 'Day': 'D/MM/Y', 'Week': 'D/MM/Y', 'Month': 'D/MM/Y'
        }
    };
    groupBy = 'auto';
    // query date range from start to end
    dateRange = '';
    dateRangeCounter = 1;
    startDate: Date;
    endDate: Date;
    fabButtons = [
        {
            icon: 'add',
            label: 'Add Chart',
        },
        {
            icon: 'add',
            label: 'Add Single Stat',
        }
    ];
    today = moment();

    pickerRange = {startDate: moment(), endDate: moment()};

    private readonly _mobileQueryListener: () => void;

    constructor(changeDetectorRef: ChangeDetectorRef,
                media: MediaMatcher,
                protected authService: AuthenticationService,
                protected route: ActivatedRoute,
                protected http: HttpClient,
                protected dataSourceService: DataSourceService,
                protected dialog: MatDialog,
                protected dashboardService: DashboardService) {
        this.mobileQuery = media.matchMedia('(min-width: 820px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);
    }

    ngOnInit() {

        this.getDashboardViews();
        this.getDataSources();

        this.route.paramMap.subscribe(params => {
            this.dashboardId = +params.get('dashboard_id');
            this.getDashboard();
        });

        this.setDateRange();

        // only admin can add and edit charts
        this.canEdit = this.authService.hasRole('Administrator');
    }

    getDashboardViews() {
        this.dashboardService.listDashboardViews().subscribe(resp => {
            this.dateViews = resp;
        });
    }

    getDashboard() {
        this.dashboardService.getById(this.dashboardId).subscribe(resp => {
            this.dashboard = resp;
        });
    }

    getDataSources() {
        this.dataSourceService.getAll({}).subscribe(resp => {
            this.dataSources = resp;
        });
    }

    fabClick(label) {
        if (label === 'Add Chart') {
            this.addChart();
        } else if (label === 'Add Single Stat') {
            this.addSingleStat();
        }
    }

    addChart() {
        const dialogRef = this.dialog.open(ChartDialogComponent, {
            width: '600px',
            data: {chart: {dashboard_id: this.dashboardId, group_by: []}, dataSources: this.dataSources, dateViews: this.dateViews},
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.addedChart = result;
            }
        });
    }

    addSingleStat() {
        const dialogRef = this.dialog.open(SingleStatDialogComponent, {
            width: '600px',
            data: {singleStat: {dashboard_id: this.dashboardId}, dataSources: this.dataSources},
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.addedSingleStat = result;
            }
        });
    }

    getDateFormat() {
        if (this.mobileQuery.matches) {
            return this.dateFormat[this.dateView];
        } else {
            return this.dateFormat.mobile[this.dateView];
        }
    }

    updateView(view) {
        this.dateView = view;
        this.dateRangeCounter = 1;
        this.setDateRange();
    }

    updateDateCounter(count) {
        if (this.dateRangeCounter + count < 1) {
            return;
        }

        this.dateRangeCounter += count;
        this.setDateRange();
    }

    // handler function that receives the updated date range object
    updateRange(event) {

        if (!this.pickerRange.startDate && !this.pickerRange.endDate) {
            return;
        }

        this.startDate = this.pickerRange.startDate.toDate();
        this.endDate = this.pickerRange.endDate.toDate();
        this.dateRange = `time > '${this.startDate.toISOString()}' AND time < '${this.endDate.toISOString()}'`;
    }

    setDateRange() {
        const startCount = this.dateRangeCounter * this.range[this.dateView].count;
        const endCount = (this.dateRangeCounter - 1) * this.range[this.dateView].count;

        const date = new Date();
        const end = new Date();
        if (this.dateView === 'Hour') {
            // round minutes down
            const startTime = new Date(date.setHours(date.getHours() - startCount));
            let minutes = (Math.floor(startTime.getMinutes() / 10) * 10);
            startTime.setMinutes(minutes, 0, 0);
            this.startDate = startTime;

            // round end down
            const endTime = new Date(end.setHours(end.getHours() - endCount));
            minutes = (Math.floor(endTime.getMinutes() / 10) * 10);
            endTime.setMinutes(minutes, 0, 0);
            this.endDate = endTime;
        } else {
            // round start day to start of day
            const startDay = new Date(date.setDate(date.getDate() - startCount));
            if (this.dateView === 'Month' || this.dateView === 'Week') {
                startDay.setHours(0, 0, 0);
            }
            this.startDate = startDay;

            // round end day to end of previous day
            const endDay = new Date(end.setDate(end.getDate() - endCount));
            if (this.dateView === 'Month' || this.dateView === 'Week') {
                endDay.setDate(endDay.getDate() - 1);
                endDay.setHours(23, 59, 0, 0);
            } else if (this.dateView === 'Day') {
                endDay.setMinutes(0, 0, 0);
            }
            this.endDate = endDay;
        }

        this.pickerRange = {startDate: moment(this.startDate), endDate: moment(this.endDate)};
        this.dateRange = `time > '${this.startDate.toISOString()}' AND time < '${this.endDate.toISOString()}'`;
    }
}
