import {Component, ElementRef, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {Chart} from '../../_models/chart';
import {MatDialog} from '@angular/material';
import {ChartService} from '../../_services/chart.service';
import {Variable} from '../../_models/variable';
import {DataSource} from '../../_models/data.source';
import * as d3 from 'd3-selection';
import {Record} from '../../_models/record';
import {DataSourceService} from '../../_services/data.source.service';
import {QueryBaseComponent} from '../query.base.component';

@Component({
    selector: 'app-chart-list',
    templateUrl: './chart.list.component.html',
    styleUrls: ['./../dashboard.component.scss']
})
export class ChartListComponent extends QueryBaseComponent implements OnInit, OnChanges {

    @ViewChild('chart') private chartContainer: ElementRef;
    @ViewChild('deleteConfirm') private deleteConfirm: any;
    @Input() dashboardId: number;
    @Input() addedChart: Chart;
    @Input() variables: Variable[];
    @Input() dataSources: DataSource[];
    @Input() view: string;
    @Input() dateRange: string;
    @Input() startDate: Date;
    @Input() endDate: Date;
    charts: Chart[] = [];
    dataSets = [];
    chartData = {};

    constructor(protected dialog: MatDialog,
                protected dataSourceService: DataSourceService,
                protected chartService: ChartService) {
        super();
    }


    ngOnChanges(changes) {
        if (changes.addedChart && changes.addedChart.currentValue) {
            this.chartAdded(changes.addedChart.currentValue);
        }
    }

    ngOnInit() {
        this.getCharts();
    }

    getCharts() {
        this.chartService.getCharts({dashboard_id: this.dashboardId}).subscribe(charts => {
            this.charts = charts;
            this.loadDataSets();
        });
    }

    loadDataSets() {
        this.dataSets = [];
        this.chartData = {};
        let counter = this.charts.length;
        d3.selectAll('div.svg-container').remove();

        for (const chart of this.charts) {
            let query = chart.query;
            this.chartData[chart.id] = [];
            query = this.formatQuery(query, chart.data_source);

            this.dataSourceService.loadDataQuery(chart.data_source_id, query).subscribe(resp => {
                if (resp['results'] && resp['results'][0].hasOwnProperty('series')) {
                    const dataSets = [];
                    for (const series of resp['results'][0]['series']) {
                        const dataset = [];
                        for (const record of series['values']) {
                            const rec = new Record(),
                                val = record[1];
                            rec.date = new Date(record[0]);
                            rec.unit = chart.unit;
                            rec.value = Math.round(val);
                            if (val !== null) {
                                dataset.push(rec);
                            }
                        }
                        dataset.sort();
                        dataSets.push(dataset);
                    }
                    this.chartData[chart.id] = dataSets;
                    counter -= 1;
                    if (counter === 0) {
                        this.buildDataSets();
                    }
                }
            }, err => {
                this.chartData[chart.id] = [];
                counter -= 1;
                     if (counter === 0) {
                        this.buildDataSets();
                    }
            });
        }
    }

    buildDataSets() {
        const tempdata = [];
        for (const chart of this.charts) {
            tempdata.push(this.chartData[chart.id]);
        }
        this.dataSets = tempdata;
    }

    chartEdited(chart) {
        this.charts = [];
        this.getCharts();
    }

    chartDeleted(chart) {
        for (const ix in this.charts) {
            if (this.charts[ix].id === chart.id) {
                this.charts.splice(+ix, 1);
                break;
            }
        }
    }

    chartAdded(chart) {
        this.charts = [];
        this.getCharts();
    }

    reorderChart(event) {
        const oldIndex = event.item.data.index;
        const index = event.currentIndex;
        const chart = event.item.data;

        let newIndex = this.charts[index].index;
        if (newIndex === oldIndex) {
            newIndex += index > event.previousIndex ? 1 : -1;
        }

        chart.index = newIndex;
        this.chartService.reorder(chart).subscribe(resp => {
            this.charts = [];
            this.getCharts();
        });
    }
}
