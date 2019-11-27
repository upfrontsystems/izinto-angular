import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ChartService} from '../_services/chart.service';
import {Chart} from '../_models/chart';
import {Dashboard} from '../_models/dashboard';
import {DashboardService} from '../_services/dashboard.service';
import {ChartDialogComponent} from './chart/chart.dialog.component';
import {MatDialog} from '@angular/material';
import {ActivatedRoute} from '@angular/router';
import {SingleStatDialogComponent} from './single-stat/single.stat.dialog.component';
import {SingleStatService} from '../_services/single.stat.service';


@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

    dashboardId: number;
    dashboard: Dashboard;
    addedChart: Chart;
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
                protected dialog: MatDialog,
                protected chartService: ChartService,
                protected dashboardService: DashboardService,
                protected singleStatService: SingleStatService) {
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.dashboardId = +params.get('dashboard_id');
            this.getDashboard();
        });
    }

    getDashboard() {
        this.dashboardService.getById(this.dashboardId).subscribe(resp => {
            this.dashboard = resp;
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
            data: {chart: {dashboard_id: this.dashboardId}},
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.chartService.add(result).subscribe(resp => {
                    this.addedChart = resp;
                });
            }
        });
    }

    addSingleStat() {
        const dialogRef = this.dialog.open(SingleStatDialogComponent, {
            width: '600px',
            data: {singleStat: {dashboard_id: this.dashboardId}},
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.singleStatService.add(result).subscribe(resp => {
                });
            }
        });
    }
}
