import {Component, ElementRef, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {Chart} from '../../_models/chart';
import {ChartService} from '../../_services/chart.service';
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
    @Input() startDate: Date;
    @Input() endDate: Date;
    charts: Chart[] = [];

    constructor(protected chartService: ChartService) {
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
        });
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
