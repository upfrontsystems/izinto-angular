import {Component, ElementRef, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {Chart} from '../../_models/chart';
import {MatDialog} from '@angular/material';
import {ChartService} from '../../_services/chart.service';
import {Variable} from '../../_models/variable';
import {moveItemInArray} from '@angular/cdk/drag-drop';
import {DataSource} from '../../_models/data.source';

@Component({
    selector: 'app-chart-list',
    templateUrl: './chart.list.component.html',
    styleUrls: ['./../dashboard.component.scss']
})
export class ChartListComponent implements OnInit, OnChanges {

    @ViewChild('chart') private chartContainer: ElementRef;
    @ViewChild('deleteConfirm') private deleteConfirm: any;
    @Input() dashboardId: number;
    @Input() addedChart: Chart;
    @Input() variables: Variable[];
    @Input() dataSources: DataSource[];
    @Input() view: string;
    @Input() dateRange: string;
    private charts: Chart[] = [];

    constructor(protected dialog: MatDialog,
                protected chartService: ChartService) {
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
        if (!event.isPointerOverContainer) {
            return;
        }

        const index = event.currentIndex;
        const chart = event.item.data;
        if (this.charts[index].id === event.item.data.id) {
            return;
        }

        const oldIndex = event.item.data.order;
        const change = index < event.previousIndex ? 1 : -1;

        let newIndex = this.charts[index].index;
        if (newIndex === oldIndex) {
            newIndex += index > event.previousIndex ? 1 : -1;
        }
        if (index > event.previousIndex) {
            for (const item of this.charts.slice(event.previousIndex, index + 1)) {
                item.index += change;
            }
        } else {
            for (const item of this.charts.slice(index, event.previousIndex)) {
                item.index += change;
            }
        }

        chart.index = newIndex;
        this.chartService.reorder(chart).subscribe(resp => {
            this.charts = [];
            this.getCharts();
        });
    }
}
