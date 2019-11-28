import {Component, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {Variable} from '../../_models/variable';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material';
import {SingleStat} from '../../_models/single.stat';
import {SingleStatService} from '../../_services/single.stat.service';
import {SingleStatDialogComponent} from './single.stat.dialog.component';
import {ChartService} from '../../_services/chart.service';
import {Record} from '../../_models/record';

@Component({
    selector: 'app-single-stat-list',
    templateUrl: './single.stat.list.component.html',
    styleUrls: ['./../dashboard.component.scss']
})
export class SingleStatListComponent implements OnInit, OnChanges {

    @Input() dashboardId: number;
    @Input() addedSingleStat: SingleStat;
    @Input() variables: Variable[];
    @Input() view: string;

    private singleStats: SingleStat[] = [];
    private dataSets = [];
    private group_by = {'hour': '10m', 'day': '1h', 'week': '1d', 'month': '1d'};
    private range = {'hour': '1h', 'day': '1d', 'week': '7d', 'month': '30d'};

    constructor(protected http: HttpClient,
                protected dialog: MatDialog,
                protected chartService: ChartService,
                protected singleStatService: SingleStatService) {
    }

    ngOnChanges(changes) {
        if (changes.addedSingleStat && changes.addedSingleStat.currentValue) {
            const stat = changes.addedSingleStat.currentValue;
            this.singleStats.push(stat);
            this.loadDataSets();
        } else if (changes.view && changes.view.currentValue) {
            this.loadDataSets();
        }
    }

    ngOnInit() {
        this.getSingleStats();
    }

    getSingleStats() {
        this.singleStatService.getSingleStats({dashboard_id: this.dashboardId}).subscribe(resp => {
            this.singleStats = resp;
            this.loadDataSets();
        });
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
            data: {singleStat: singleStat},
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.singleStatService.edit(result).subscribe(resp => {
                    for (const ix in this.singleStats) {
                        if (this.singleStats[ix].id === resp.id) {
                            this.singleStats[ix] = resp;
                            this.loadDataSets();
                            break;
                        }
                    }
                });
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
        this.dataSets = [];
        for (const singleStat of this.singleStats) {
            let query = singleStat.query;
            query = this.formatQuery(query);

            this.chartService.getChartData(query).subscribe(resp => {
                const rec = new Record();
                rec.id = singleStat.id;
                rec.text = singleStat.title;
                if (resp['results'][0].hasOwnProperty('series')) {
                    const series = resp['results'][0]['series'][resp['results'][0]['series'].length - 1];
                    const record = series['values'][series['values'].length - 1];
                    const val = +record[1].toFixed(singleStat.decimals);

                    rec.valueString = this.formatValue(singleStat, val);
                    rec.color = this.thresholdColor(singleStat, val);
                }
                this.dataSets.push(rec);
            }, error => {
                const rec = new Record();
                rec.id = singleStat.id;
                rec.text = singleStat.title;
                this.dataSets.push(rec);
            });
        }
    }

    formatQuery(query) {
        query = query.replace(/:range:/g, this.range[this.view]);
        query = query.replace(/:group_by:/g, this.group_by[this.view]);

        for (const variable of this.variables) {
            const re = new RegExp(variable.name, 'g');
            query = query.replace(re, variable.value);
        }

        return query;
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
