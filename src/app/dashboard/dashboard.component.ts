import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HttpClient} from '@angular/common/http';
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
import {DashboardView} from '../_models/dashboard_view';
import * as moment from 'moment';
import {AuthenticationService} from '../_services/authentication.service';
import {Script} from '../_models/script';
import {ScriptDialogComponent} from './script/script.dialog.component';
import {CopyService} from '../_services/copy.service';
import {DashboardDialogComponent} from './dashboard.dialog.component';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

    @Input() dashboardId: number;
    @Input() dashboard: Dashboard;
    @Input() parent: any;
    @Input() dataSources: DataSource[];
    @Input() dateViews: DashboardView[] = [];
    @Output() edited: EventEmitter<Dashboard> = new EventEmitter();
    mobileQuery: MediaQueryList;
    canEdit = false;
    addedChart: Chart;
    addedSingleStat: SingleStat;
    addedScript: Script;
    dateView = 'Week';
    dateFormat = {
        'Hour': 'D MMM h:mm a', 'Day': 'D MMMM', 'Week': 'D MMM YYYY', 'Month': 'D MMM YYYY', 'Year': 'MMM YYYY',
        'mobile': {
            'Hour': 'D MMM H:mm', 'Day': 'D MMMM', 'Week': 'D MMM YYYY', 'Month': 'D MMM YYYY', 'Year': 'MMM YYYY',
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
        },
        {
            icon: 'add',
            label: 'Add Script',
        }
    ];
    today = moment();
    dateSelectOpened = false;
    pickerRange = {startDate: moment(), endDate: moment()};
    private range = {
        'Hour': {'count': 1, 'unit': 'h'},
        'Day': {'count': 1, 'unit': 'd'},
        'Week': {'count': 7, 'unit': 'd'},
        'Month': {'count': 30, 'unit': 'd'},
        'Year': {'count': 365, 'unit': 'd'}
    };
    private readonly _mobileQueryListener: () => void;

    constructor(changeDetectorRef: ChangeDetectorRef,
                media: MediaMatcher,
                protected route: ActivatedRoute,
                protected http: HttpClient,
                protected dialog: MatDialog,
                protected authService: AuthenticationService,
                protected copyService: CopyService,
                protected dashboardService: DashboardService) {
        this.mobileQuery = media.matchMedia('(min-width: 820px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addEventListener('change', this._mobileQueryListener);
    }

    ngOnInit() {
        this.setDateRange();
        this.dashboardService.toggleDateSelect.subscribe(status => this.dateSelectOpened = status);

        // only admin can add and edit charts
        this.canEdit = this.authService.hasRole('Administrator');
    }

    dateSelectVisible() {
        // Always show the date selector on bigger screens
        if (this.mobileQuery.matches) {
            return true;
        } else {
            return this.dateSelectOpened;
        }
    }

    editDashboard() {
        const dialogRef = this.dialog.open(DashboardDialogComponent, {
            width: '600px',
            data: {dashboard: this.dashboard}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.edited.emit(result);
            }
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
        } else if (label === 'Add Script') {
            this.addScript();
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

    pasteChart() {
        this.copyService.pasteChart(this.dashboard.id).subscribe(resp => {
            this.addedChart = resp;
            this.copyService.clearCopied('chart');
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

    pasteSingleStat() {
        this.copyService.pasteSingleStat(this.dashboard.id).subscribe(resp => {
            this.addedSingleStat = resp;
            this.copyService.clearCopied('single_stat');
        });
    }

    addScript() {
        const dialogRef = this.dialog.open(ScriptDialogComponent, {
            width: '600px',
            data: {script: {dashboard_id: this.dashboardId}},
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.addedScript = result;
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
                endDay.setHours(23, 59, 0, 0);
            } else if (this.dateView === 'Day') {
                endDay.setMinutes(0, 0, 0);
            }
            this.endDate = endDay;

            // set the ms to zero to prevent a slight offset problem when comparing dates returned by InfluxDb
            this.startDate.setSeconds(this.startDate.getSeconds(), 0);
            this.endDate.setSeconds(this.endDate.getSeconds(), 0);
        }

        this.pickerRange = {startDate: moment(this.startDate), endDate: moment(this.endDate)};
        this.dateRange = `time > '${this.startDate.toISOString()}' AND time < '${this.endDate.toISOString()}'`;
    }
}
