import {Component, ElementRef, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {Chart} from '../../_models/chart';
import {ChartService} from '../../_services/chart.service';
import {QueryBaseComponent} from '../query.base.component';
import {AuthenticationService} from '../../_services/authentication.service';
import {DashboardService} from '../../_services/dashboard.service';

@Component({
    selector: 'app-chart-list',
    templateUrl: './chart.list.component.html',
    styleUrls: ['./chart.component.scss']
})
export class ChartListComponent extends QueryBaseComponent implements OnInit, OnChanges {

    @ViewChild('chart', {static: true}) private chartContainer: ElementRef;
    @ViewChild('deleteConfirm', {static: true}) private deleteConfirm: any;
    @Input() dashboardId: number;
    @Input() addedChart: Chart;
    charts: Chart[] = [];
    sliderCoordinates: number;

    constructor(protected authService: AuthenticationService,
                protected chartService: ChartService,
                protected dashboardService: DashboardService) {
        super(authService, dashboardService);
    }

    ngOnChanges(changes) {
        if (changes.addedChart && changes.addedChart.currentValue) {
            this.chartAdded(changes.addedChart.currentValue);
        }
        if (changes.dashboardId && !changes.dashboardId.firstChange) {
            this.getCharts();
        }
    }

    ngOnInit() {
        this.getCharts();
        this.checkPermissions();
    }

    getCharts() {
        this.chartService.getCharts({dashboard_id: this.dashboardId}).subscribe(charts => {
            this.charts = charts.sort((a, b) => a.index - b.index);
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

    sliderManager(event) {
        const target = event.target as HTMLElement;
        if (target.matches('rect')) {
            // prevent hammerjs swiping while on chart
            event.srcEvent.stopPropagation();
            // calculate x coordinate within chart
            const bounds = target.getBoundingClientRect();
            // update coordinates watched by chart
            this.sliderCoordinates = event.center.x - bounds.left;
        }
    }
}
