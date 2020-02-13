import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Chart} from '../_models/chart';
import {Dashboard, GroupBy} from '../_models/dashboard';
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
import {NgxDrpOptions, PresetItem, Range} from 'ngx-mat-daterange-picker';
import {DashboardView} from '../_models/dashboard_view';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

    @ViewChild('dateRangePicker') dateRangePicker;

    mobileQuery: MediaQueryList;
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
        'hour': 'd MMMM h:mm a', 'day': 'd MMMM y', 'week': 'd MMMM y', 'month': 'd MMM y',
        'mobile': {'hour': 'd MMMM h:mm a', 'day': 'dd/MM/yy', 'week': 'dd/MM/yy', 'month': 'dd/MM/yy'}
    };
    groupBy = 'auto';
    // query date range from start to end
    dateRange = 'time > now() - 30d';
    dateRangeCounter = 1;
    dateSelect: Date;
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

    pickerRange: Range = {fromDate: new Date(), toDate: new Date()};
    options: NgxDrpOptions;
    presets: Array<PresetItem> = [];

    private readonly _mobileQueryListener: () => void;

    constructor(changeDetectorRef: ChangeDetectorRef,
                media: MediaMatcher,
                protected route: ActivatedRoute,
                protected http: HttpClient,
                protected dataSourceService: DataSourceService,
                protected dialog: MatDialog,
                protected chartService: ChartService,
                protected dashboardService: DashboardService,
                protected singleStatService: SingleStatService) {
        this.mobileQuery = media.matchMedia('(min-width: 768px)');
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

        // setup date range picker options
        this.setupPresets();
        this.options = {
            presets: this.presets,
            format: this.getDateFormat(),
            range: this.pickerRange,
            applyLabel: 'Submit',
            calendarOverlayConfig: {
                shouldCloseOnBackdropClick: false,
                hasBackdrop: false
            },
            toMinMax: {fromDate: null, toDate: new Date()},
            placeholder: '\t'
        };
    }

    getDashboardViews() {
        this.dashboardService.listDashboardViews().subscribe(resp => {
            this.dateViews = resp;
        });
    }

    // handler function that receives the updated date range object
    updateRange(range: Range) {
        this.pickerRange = range;
        this.dateSelect = range.fromDate;
        this.endDate = range.toDate;

        // calculate hour or day difference from picked range
        const unit = this.range[this.dateView].unit;
        const today = new Date();
        let startRange = Math.round((today.getTime() - this.dateSelect.getTime()) / 360000) + unit;
        let endRange = Math.round((today.getTime() - this.endDate.getTime()) / 360000) + unit;
        if (unit === 'd') {
            startRange = Math.round((today.getTime() - this.dateSelect.getTime()) / (1000 * 3600 * 24)) + unit;
            endRange = Math.round((today.getTime() - this.endDate.getTime()) / (1000 * 3600 * 24)) + unit;
        }
        this.dateRange = `time > now() - ${startRange} AND time < now() - ${endRange}`;
    }

    // helper function to create initial presets
    setupPresets() {

        const backDate = (numOfDays) => {
            const tday = new Date();
            return new Date(tday.setDate(tday.getDate() - numOfDays));
        };

        const today = new Date();
        const yesterday = backDate(1);
        const minus7 = backDate(7);
        const minus30 = backDate(30);
        const currMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const currMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

        this.presets = [
            {presetLabel: 'Yesterday', range: {fromDate: yesterday, toDate: today}},
            {presetLabel: 'Last 7 Days', range: {fromDate: minus7, toDate: today}},
            {presetLabel: 'Last 30 Days', range: {fromDate: minus30, toDate: today}},
            {presetLabel: 'This Month', range: {fromDate: currMonthStart, toDate: currMonthEnd}},
            {presetLabel: 'Last Month', range: {fromDate: lastMonthStart, toDate: lastMonthEnd}}
        ];
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

    setDateRange() {
        const startCount = this.dateRangeCounter * this.range[this.dateView].count;
        const endCount = (this.dateRangeCounter - 1) * this.range[this.dateView].count;

        // date range query gets updated when picker is updated
        // format date range from start to end
        // const startRange = startCount + this.range[this.dateView].unit;
        // const endRange = endCount + this.range[this.dateView].unit;
        // this.dateRange = `time > now() - ${startRange} AND time < now() - ${endRange}`;

        const date = new Date();
        const end = new Date();
        if (this.dateView === 'hour') {
            this.dateSelect = new Date(date.setHours(date.getHours() - startCount));
            this.endDate = new Date(end.setHours(end.getHours() - endCount));
        } else {
            this.dateSelect = new Date(date.setDate(date.getDate() - startCount));
            this.endDate = new Date(end.setDate(end.getDate() - endCount));
        }

        this.pickerRange = {fromDate: this.dateSelect, toDate: this.endDate};
        if (this.dateRangePicker) {
            this.dateRangePicker.resetDates(this.pickerRange);
        }
    }
}
