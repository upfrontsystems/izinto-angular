import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DomSanitizer, SafeHtml, SafeResourceUrl} from '@angular/platform-browser';
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
import {AuthenticationService} from '../_services/authentication.service';
import {CopyService} from '../_services/copy.service';
import {DashboardDialogComponent} from './dashboard.dialog.component';
import {environment} from '../../environments/environment';

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
    content: any;
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
                private sanitizer: DomSanitizer,
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
        // only admin can add and edit charts
        this.canEdit = this.authService.hasRole('Administrator');
        const url = environment.scriptBaseURL + '/api/dashboard/' + this.dashboardId + '/content';
        this.contentURL = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.content = this.sanitizer.bypassSecurityTrustHtml(this.dashboard.content);
    }

    editDashboard() {
        const dialogRef = this.dialog.open(DashboardDialogComponent, {
            width: '600px',
            data: {dashboard: this.dashboard}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.edited.emit(result);
                this.content = this.sanitizer.bypassSecurityTrustHtml(result.content);
                console.log(this.content);
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

}
