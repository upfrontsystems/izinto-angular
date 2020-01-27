import {Component, OnInit} from '@angular/core';
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


@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

    dashboardId: number;
    dashboard: Dashboard;
    dataSources: DataSource[];
    addedChart: Chart;
    addedSingleStat: SingleStat;
    dateView = 'month';
    private range = {'hour': {'count': 1, 'unit': 'h'},
        'day': {'count': 1, 'unit': 'd'},
        'week': {'count': 7, 'unit': 'd'},
        'month': {'count': 30, 'unit': 'd'}
    };
    dateFormat = {'hour': 'd MMMM h:mm a', 'day': 'd MMMM y', 'week': 'd MMMM y', 'month': 'MMMM y'};
    dateRange = '30d';
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

    constructor(protected route: ActivatedRoute,
                protected http: HttpClient,
                protected dataSourceService: DataSourceService,
                protected dialog: MatDialog,
                protected dashboardService: DashboardService) {
    }

    ngOnInit() {
        this.getDataSources();

        this.route.paramMap.subscribe(params => {
            this.dashboardId = +params.get('dashboard_id');
            this.getDashboard();
        });

        this.setDateRange();
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
            data: {chart: {dashboard_id: this.dashboardId}, dataSources: this.dataSources},
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

    updateView(view) {
        this.dateView = view;
        this.dateRangeCounter = 1;
        this.dateRange = this.range[this.dateView].unit;
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
        const range = this.range[this.dateView].count;
        const date = new Date();
        const end = new Date();
        if (this.dateView === 'hour') {
            this.dateSelect = new Date(date.setHours(date.getHours() - (this.dateRangeCounter * range)));
            this.endDate = new Date(end.setHours(end.getHours() - ((this.dateRangeCounter - 1) * range)));
        } else {
            this.dateSelect = new Date(date.setDate(date.getDate() - (this.dateRangeCounter * range)));
            this.endDate = new Date(end.setDate(end.getDate() - ((this.dateRangeCounter - 1) * range)));
        }
    }
}
