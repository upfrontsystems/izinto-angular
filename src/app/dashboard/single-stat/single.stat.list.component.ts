import {Component, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {Variable} from '../../_models/variable';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material';
import {SingleStat} from '../../_models/single.stat';
import {SingleStatService} from '../../_services/single.stat.service';
import {SingleStatDialogComponent} from './single.stat.dialog.component';
import {Record} from '../../_models/record';
import {ChartService} from '../../_services/chart.service';

@Component({
  selector: 'app-single-stat-list',
  templateUrl: './single.stat.list.component.html',
  styleUrls: ['./single-stat-list.component.css']
})
export class SingleStatListComponent implements OnInit, OnChanges {

    @ViewChild('deleteConfirm') private deleteConfirm: any;
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

    editSingleStat(singleStat) {
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

    deleteSingleStat(singleStat) {
        this.deleteConfirm.show();
        this.deleteConfirm.onAccept.subscribe(event => {
            this.singleStatService.delete(singleStat).subscribe(resp => {
                for (const ix in this.singleStats) {
                    if (this.singleStats[ix].id === singleStat.id) {
                        this.singleStats.splice(+ix, 1);
                        this.loadDataSets();
                        break;
                    }
                }
            });
        });
    }

    loadDataSets() {
        this.dataSets.length = 0;
        for (const singleStat of this.singleStats) {
            let query = singleStat.query;
            query = this.formatQuery(query);

            this.chartService.getChartData(query).subscribe(resp => {
                if (resp['results'][0].hasOwnProperty('series')) {
                    for (const series of resp['results'][0]['series']) {
                        const record = series['values'][series['values'].length - 1];
                        const rec = new Record(),
                            val = record[1];
                        rec.text = singleStat.title;
                        // rec.unit = singleStat.unit;
                        rec.value = +val.toFixed(singleStat.decimals);
                        this.dataSets.push(rec);
                    }
                }
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
}
