import {Component, Input, OnChanges, OnInit, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import {SingleStat} from '../../_models/single.stat';
import {SingleStatService} from '../../_services/single.stat.service';
import {SingleStatDialogComponent} from './single.stat.dialog.component';
import {Record} from '../../_models/record';
import {QueryBaseComponent} from '../query.base.component';
import {DataSourceService} from '../../_services/data.source.service';
import {AuthenticationService} from '../../_services/authentication.service';
import {AlertService} from '../../_services/alert.service';
import {CopyService} from '../../_services/copy.service';
import {DashboardService} from '../../_services/dashboard.service';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-single-stat-list',
    templateUrl: './single.stat.list.component.html',
    styleUrls: ['./../dashboard.component.scss']
})
export class SingleStatListComponent extends QueryBaseComponent implements OnInit, OnDestroy, OnChanges {

    @Input() dashboardId: number;
    @Input() addedSingleStat: SingleStat;
    public singleStats: SingleStat[] = [];
    private dataSets = {};
    datesUpdated: Subscription;

    constructor(protected http: HttpClient,
                protected dialog: MatDialog,
                protected alertService: AlertService,
                protected authService: AuthenticationService,
                private copyService: CopyService,
                protected dashboardService: DashboardService,
                protected dataSourceService: DataSourceService,
                protected singleStatService: SingleStatService) {
        super(alertService, authService, dashboardService);
    }

    ngOnChanges(changes) {
        if (changes.addedSingleStat && changes.addedSingleStat.currentValue) {
            const stat = changes.addedSingleStat.currentValue;
            this.singleStats.push(stat);
            this.loadDataSets();
        } else if (changes.dashboardId && !changes.dashboardId.firstChange) {
            this.getSingleStats();
        }
    }

    ngOnInit() {
        this.dateSelection = this.dashboardService.getDateSelection();
        this.getSingleStats();
        this.checkCanEdit();

        this.datesUpdated = this.dashboardService.datesUpdated.subscribe((selection) => {
            this.dateSelection = selection;
            this.loadDataSets();
        });
    }

    ngOnDestroy() {
        // Prevent event subscriber being called multiple times.
        // See https://stackoverflow.com/questions/53505872/angular-eventemitter-called-multiple-times
        if (this.datesUpdated) {
            this.datesUpdated.unsubscribe();
        }
    }

    getSingleStats() {
        this.singleStatService.getSingleStats({dashboard_id: this.dashboardId}).subscribe(resp => {
            this.singleStats = resp;
            this.loadDataSets();
        });
    }

    copySingleStat(record) {
        this.copyService.copy('single_stat', record);
        this.alertService.success('Single Stat copied', false, 2000);
    }

    editSingleStat(record) {
        let singleStat = new SingleStat();
        for (const ix in this.singleStats) {
            if (this.singleStats[ix].id === record.id) {
                singleStat = this.singleStats[ix];
                break;
            }
        }
        const dialogRef = this.dialog.open(SingleStatDialogComponent, {
            width: '600px',
            data: {singleStat: singleStat, dataSources: this.dataSources},
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                for (const ix in this.singleStats) {
                    if (this.singleStats[ix].id === result.id) {
                        this.singleStats[ix] = result;
                        this.loadDataSets();
                        break;
                    }
                }
            }
        });
    }

    deleteSingleStat(record) {
        this.singleStatService.delete(record).subscribe(resp => {
            for (const ix in this.singleStats) {
                if (this.singleStats[ix].id === record.id) {
                    this.singleStats.splice(+ix, 1);
                    this.loadDataSets();
                    break;
                }
            }
        });
    }

    loadDataSets() {
        this.dataSets = {};
        for (const singleStat of this.singleStats) {
            this.dataSets[singleStat.id] = new Record();
            let query = singleStat.query;
            query = this.formatQuery(query, [], singleStat.data_source);

            this.dataSourceService.loadDataQuery(singleStat.data_source_id, query).subscribe(resp => {
                const rec = new Record();
                rec.id = singleStat.id;
                rec.text = singleStat.title;
                if (resp['results'] && resp['results'][0].hasOwnProperty('series')) {
                    const series = resp['results'][0]['series'][resp['results'][0]['series'].length - 1];
                    const record = series['values'][series['values'].length - 1];
                    const val = +record[1].toFixed(singleStat.decimals);

                    rec.valueString = this.formatValue(singleStat, val);
                    rec.color = this.thresholdColor(singleStat, val);
                }
                this.dataSets[singleStat.id] = rec;
            });
        }
    }

    formatValue(stat: SingleStat, value) {
        if (!stat.format) {
            return value;
        }

        return eval('`' + stat.format + '`');
    }

    thresholdColor(stat: SingleStat, value: number) {
        const thresholds = stat.thresholds.split(',');
        const colors = stat.colors.split(',');

        if (thresholds.length !== (colors.length - 1)) {
            return '';
        }

        for (let ix = 0; ix < thresholds.length; ix += 1) {
            if (value < +thresholds[ix]) {
                return colors[ix];
            }
        }
        return colors[colors.length - 1];
    }
}
