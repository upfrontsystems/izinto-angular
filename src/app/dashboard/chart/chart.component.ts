import {Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output} from '@angular/core';
import {Chart} from '../../_models/chart';
import * as d3Trans from 'd3-transition';
import {ChartService} from '../../_services/chart.service';
import {ChartDialogComponent} from './chart.dialog.component';
import * as d3 from 'd3-selection';
import {Record} from '../../_models/record';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3TimeFormat from 'd3-time-format';
import * as d3Axis from 'd3-axis';
import * as d3Shape from 'd3-shape';
import {MatDialog} from '@angular/material';
import {QueryBaseComponent} from '../query.base.component';
import {DataSourceService} from '../../_services/data.source.service';
import {MouseListenerDirective} from 'app/shared/mouse-listener/mouse.listener.directive';


export const groupByValues = {
    '10s': 10,
    '1m': 60,
    '5m': 300,
    '30m': 60 * 30,
    '1h': 60 * 60,
    '6h': 60 * 60 * 6,
    '1d': 60 * 60 * 24,
    '7d': 60 * 60 * 24 * 7
};

@Component({
    selector: 'app-chart',
    templateUrl: './chart.component.html',
    styleUrls: ['./../dashboard.component.scss']
})
export class ChartComponent extends QueryBaseComponent implements OnInit, OnChanges {

    @Input() chart: Chart;
    @Input() startDate: Date;
    @Input() endDate: Date;
    @Output() edited: EventEmitter<Chart> = new EventEmitter();
    @Output() deleted: EventEmitter<Chart> = new EventEmitter();
    private dataSets = [];
    private scales = [];

    private chartHeight = 200;
    private chartWidth = 1200;
    private innerWidth = 0;
    private innerHeight = 0;
    public windowWidth: any;
    private margin = {top: 50, right: 10, bottom: 20, left: 40};

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.setChartWidth();
        this.buildChart();
    }

    constructor(protected dialog: MatDialog,
                protected dataSourceService: DataSourceService,
                protected chartService: ChartService,
                private mouseListener: MouseListenerDirective) {
        super();
        // update marker line on all charts
        mouseListener.move.subscribe(event => {
            if (event.srcElement.matches('rect')) {
                // calculate x coordinate within chart
                const target = event.target as HTMLElement;
                const bounds = target.getBoundingClientRect();
                this.mousemove(event.clientX - bounds.left);
            }
        });
        mouseListener.over.subscribe(event => {
            if (event.srcElement.matches('rect')) {
                this.mouseover();
            }
        });
        mouseListener.out.subscribe(event => {
            if (event.srcElement.matches('rect')) {
                this.mouseout();
            }
        });
    }

    ngOnChanges(changes) {
        const dateRange = changes.dateRange;
        const groupBy = changes.groupBy;
        if (dateRange && dateRange.currentValue && !dateRange.firstChange) {
            this.loadDataSet();
        } else if (groupBy && groupBy.currentValue && !groupBy.firstChange) {
            this.loadDataSet();
        }
    }

    ngOnInit() {
        // Initialise transition
        d3Trans.transition().duration(750);
        this.setChartWidth();
        this.loadDataSet();
    }

    setChartWidth() {
        this.windowWidth = window.innerWidth;
        this.chartWidth = this.windowWidth - 130;
        this.innerWidth = this.chartWidth - this.margin.left - this.margin.right;
        this.innerHeight = this.chartHeight - this.margin.top - this.margin.bottom;
    }

    editChart() {
        const dialogRef = this.dialog.open(ChartDialogComponent, {
            width: '600px',
            data: {chart: this.chart, dataSources: this.dataSources, dateViews: this.dateViews},
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.edited.emit(result);
            }
        });
    }

    deleteChart() {
        this.chartService.delete(this.chart).subscribe(resp => {
            this.deleted.emit(this.chart);
        });
    }

    loadDataSet() {
        this.dataSets.length = 0;
        this.scales = [];
        d3.selectAll('div.svg-container').remove();
        let query = this.chart.query;
        query = this.formatQuery(query, this.chart.group_by, this.chart.data_source);

        this.dataSourceService.loadDataQuery(this.chart.data_source_id, query).subscribe(resp => {
            if (resp['results'] && resp['results'][0].hasOwnProperty('series')) {
                for (const series of resp['results'][0]['series']) {
                    const dataset = [];
                    for (const record of series['values']) {
                        const rec = new Record(),
                            val = record[1];
                        rec.date = new Date(record[0]);
                        rec.unit = this.chart.unit;
                        rec.value = val;
                        if (val !== null) {
                            dataset.push(rec);
                        }
                    }
                    dataset.sort();
                    this.dataSets.push(dataset);
                }
            }
            this.buildChart();
        }, err => {
            this.buildChart();
        });
    }

    buildChart() {
        if (this.chart.type === 'Line') {
            this.lineChart(this.dataSets);
        } else if (this.chart.type === 'Bar') {
            this.barChart(this.dataSets);
        } else if (this.chart.type === 'Wind Arrow') {
            this.windArrows(this.dataSets);
        } else {
            this.barChart(this.dataSets);
        }
    }

    xAxisScale() {
        return d3Scale.scaleTime().range([0, this.innerWidth]).domain(
            [this.startDate, this.endDate]
        );
    }

    xScale(dataset) {
        const x = d3Scale.scaleBand().range([0, this.innerWidth]).padding(0.1);
        x.domain(dataset.map(function (d) {
            return d.date;
        }));
        return x;
    }

    yScale(dataset, domain?) {
        const ymin = d3Array.min<Date>(dataset.map(d => d.value)),
            ymax = d3Array.max<Date>(dataset.map(d => d.value));
        return d3Scale.scaleLinear().domain(domain && domain || [ymin, ymax]).range([0, this.innerHeight]);
    }

    gridScale(dataset) {
        const ymin = d3Array.min<Date>(dataset.map(d => d.value)),
            ymax = d3Array.max<Date>(dataset.map(d => d.value));
        return d3Scale.scaleLinear()
            .domain([ymin, ymax])
            .range([this.innerHeight, 0]);
    }

    markerLine(svg) {
        const focus = svg.append('g')
            .attr('transform', 'translate(' + this.margin.left + ',0)')
            .attr('class', 'focus g-' + this.chart.id)
            .style('display', 'none');

        focus.append('line')
            .attr('class', 'x-hover-line hover-line')
            .attr('stroke', 'darkgray')
            .attr('stroke-width', '2px')
            .attr('y1', 0)
            .attr('y2', this.chartHeight);

        // add text label for each dataset
        const colors = this.chart.color.split(',');
        let yOffset = 27;
        for (let dix = 0; dix < this.dataSets.length; dix += 1) {
            yOffset += 18;
            focus.append('text')
                .attr('class', 'hover-text dataset-' + dix)
                .attr('x', 5)
                .attr('y', yOffset)
                .attr('fill', colors[dix]);
        }

        // add date label
        focus.append('text')
            .style('font-size', '12px')
            .style('word-spacing', '5px')
            .attr('class', 'hover-text dataset-date')
            .attr('x', 5)
            .attr('y', yOffset + 15)
            .attr('fill', 'grey');

        svg.append('rect')
            .attr('transform', 'translate(' + this.margin.left + ',0)')
            .attr('class', 'overlay')
            .attr('width', this.innerWidth)
            .attr('height', this.chartHeight)
            .attr('fill', 'none')
            .attr('pointer-events', 'all');
    }

    mouseover() {
        d3.select('g.focus.g-' + this.chart.id).style('display', null);
    }

    mouseout() {
        d3.select('g.focus.g-' + this.chart.id).style('display', 'none');
    }

    mousemove(xcoord) {
        if (this.dataSets.length === 0) {
            return;
        }
        const bisectDate = d3Array.bisector(function (d: Record) {
            return d.date;
        }).right;

        const markerHeight = this.chartHeight,
            newX = xcoord + this.margin.left,
            xscale = this.xAxisScale(),
            xdate = xscale.invert(xcoord),
            decimals = this.chart.decimals;

        // update marker label for each dataset
        for (let dix = 0; dix < this.dataSets.length; dix += 1) {
            const rix = bisectDate(this.dataSets[dix], xdate) - 1;

            const record = this.dataSets[dix][rix];
            if (record === undefined) {
                return;
            }

            d3.select('g.focus.g-' + this.chart.id)
                .attr('transform', 'translate(' + newX + ',' + 0 + ')')
                .style('display', null)
                .select('text.dataset-' + dix).text(function (): any {
                    if (record.text) {
                        return record.text;
                    } else {
                        return record.value.toFixed(decimals) + ' ' + record.unit;
                    }
            }).select('.x-hover-line').attr('y2', markerHeight);

            // add date label at end
            d3.select('g.focus.g-' + this.chart.id)
                .select('text.dataset-date').text(function (): any {
                return (xdate as any).toLocaleString('en-ZA', {dateStyle: 'medium', timeStyle: 'short'});
            });
        }
    }

    xAxisInterval(width) {
        const interval = width / 50;

        if (this.view === 'Hour') {
            return interval;
        } else if (this.view === 'Day') {
            return interval > 24 && 24 || interval;
        } else if (this.view === 'Week') {
            return interval > 7 && 7 || interval;
        } else if (this.view === 'Month') {
            return interval > 30 && 30 || interval;
        }
        return interval;
    }

    tickFormat() {
        let fmt = '%d %b';
        if (this.view === 'Hour' || this.view === 'Day') {
            fmt = '%H:%M';
        }
        return d3TimeFormat.timeFormat(fmt);
    }

    arrayUnique(array) {
        const a = array.concat();
        for (let i = 0; i < a.length; ++i) {
            for (let j = i + 1; j < a.length; ++j) {
                if (a[i] === a[j]) {
                    a.splice(j--, 1);
                }
            }
        }
        return a;
    }

    barWidth() {
        const groupBy = this.groupByForView(this.chart.group_by),
            groupByValue = groupByValues[groupBy],
            xAxisScale = this.xAxisScale(),
            tickTime = new Date(this.startDate);
        tickTime.setTime(this.startDate.getTime() + groupByValue * 1000 - (2 * 3600 * 1000));
        return xAxisScale(tickTime);
    }

    barChart(dataSet) {
        const width = this.innerWidth,
            height = this.innerHeight,
            merged = this.arrayUnique([].concat.apply([], dataSet)).sort((a, b) => a.date - b.date),
            xAxisScale = this.xAxisScale(),
            yScale = this.yScale(merged),
            gridLines = d3Axis.axisLeft(this.gridScale(merged)).ticks(4).tickSize(-this.innerWidth);

        let svg = d3.select('svg.chart-' + this.chart.id + ' > g'),
            barChart = svg.select('g.chart-' + this.chart.id);
        const create = svg.empty();
        if (create) {
            d3.selectAll('div.chart-' + this.chart.id).remove();
            d3.select('div.d3-chart.chart-container-' + this.chart.id)
                .append('div').attr('class', 'svg-container chart-' + this.chart.id);

            svg = d3.select('div.chart-' + this.chart.id)
                .append('svg')
                .attr('class', 'chart-' + this.chart.id)
                .attr('width', this.chartWidth)
                .attr('height', this.chartHeight)
                .append('g')
                .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
            svg.append('g')
                .attr('class', 'grid');
            barChart = svg.append('g').attr('class', 'chart-' + this.chart.id);
        }

        svg.selectAll('text.section-label').remove();
        svg.append('text')
            .attr('class', 'section-label')
            .attr('x', 0)
            .attr('y', -40)
            .attr('dy', '0.8em')
            .attr('fill', 'black')
            .text(this.chart.title);

        svg.selectAll('g.x-axis').remove();
        svg.selectAll('g.grid > *').remove();
        const interval = this.xAxisInterval(width),
            tickFormat = this.tickFormat();
        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3Axis.axisBottom(xAxisScale)
                .ticks(interval)
                .tickFormat(function (d: any) {
                    return tickFormat(d);
                })
            );
        svg.select('g.grid')
            .call(gridLines)
            .call(g => g.selectAll('.tick line')
                .attr('x1', 10)
                .attr('stroke-opacity', 0.5)
                .attr('stroke-dasharray', '2,2'))
            .call(g => g.selectAll('.tick text')
                .attr('x', -10)
                .attr('dy', -4))
            .call(g => g.select('.domain')
                .remove());

        const fillFunc = this.chart.fillFunc;
        const color = this.chart.color;
        dataSet.forEach((dataset, index) => {
            const bar_selector = 'rect.chart-' + this.chart.id + '-' + index,
                bandwidth = this.barWidth(),
                padding = 2,
                update = barChart.selectAll(bar_selector).data(dataset);
            barChart.selectAll('rect').remove();
            update.enter().append('rect')
                .attr('class', bar_selector)
                .attr('x', (d: any) => xAxisScale(d.date) + bandwidth * index)
                .attr('y', function (d: Record) {
                    return height - yScale(d.value);
                })
                .attr('width', bandwidth - padding)
                .attr('height', function (d: Record) {
                    return yScale(d.value);
                })
                .attr('fill', function (d: Record) {
                    if (fillFunc) {
                        return fillFunc(d.value);
                    } else {
                        return color.split(',')[index];
                    }
                });

        });
        if (create && dataSet.length > 0) {
            this.markerLine(d3.select('svg.chart-' + this.chart.id));
        }
    }

    lineChart(dataSet) {

        const width = this.innerWidth,
            height = this.innerHeight,
            merged = this.arrayUnique([].concat.apply([], dataSet)).sort((a, b) => a.date - b.date),
            gridLines = d3Axis.axisLeft(this.gridScale(merged)).ticks(4).tickSize(-width),
            xAxisScale = this.xAxisScale(),
            yScale = this.yScale(merged, [
                d3Array.max<Date>(merged.map(d => d.value)),
                d3Array.min<Date>(merged.map(d => d.value))]);

        const line = d3Shape.line<Record>()
            .x(function (d: any): number {
                return xAxisScale(d.date);
            }) // set the x values for the line generator
            .y(function (d: Record): number {
                return yScale(d.value);
            }) // set the y values for the line generator
            .curve(d3Shape.curveMonotoneX); // apply smoothing to the line

        let svg = d3.select('svg.chart-' + this.chart.id + ' > g');
        const create = svg.empty(),
            trans: any = 1000;
        if (create) {
            d3.select('div.d3-chart.chart-container-' + this.chart.id)
                .append('div').attr('class', 'svg-container chart-' + this.chart.id);

            svg = d3.select('div.chart-' + this.chart.id)
                .append('svg')
                .attr('class', 'chart-' + this.chart.id)
                .attr('width', this.chartWidth)
                .attr('height', this.chartHeight)
                .append('g')
                .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
            svg.append('g')
                .attr('class', 'grid');
            dataSet.forEach((dataset, index) => {
                const linechart = svg.append('g').attr('class', 'line-chart-' + index);
                linechart.append('path')
                    .datum(dataset)
                    .attr('fill', 'none')
                    .style('stroke', this.chart.color.split(',')[index])
                    .style('stroke-width', '2px')
                    .attr('class', 'line')
                    .attr('d', line);
                linechart.append('text')
                    .attr('class', 'section-label')
                    .attr('x', 0)
                    .attr('y', -40)
                    .attr('dy', '0.8em')
                    .attr('fill', 'black')
                    .text(this.chart.title);
            });
        } else {
            dataSet.forEach((dataset, index) => {
                svg.select('g.line-chart-' + index + ' path.line')
                    .transition(trans)
                    .attr('d', line(dataset));
            });
        }

        const interval = this.xAxisInterval(width);
        const tickFormat = this.tickFormat();

        svg.selectAll('g.x-axis').remove();
        svg.selectAll('g.grid > *').remove();
        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3Axis.axisBottom(xAxisScale)
                .ticks(interval)
                .tickFormat(function (d: any) {
                    return tickFormat(d);
                })
            );
        svg.select('g.grid')
            .call(gridLines)
            .call(g => g.selectAll('.tick line')
                .attr('x1', 10)
                .attr('stroke-opacity', 0.5)
                .attr('stroke-dasharray', '2,2'))
            .call(g => g.selectAll('.tick text')
                .attr('x', -10)
                .attr('dy', -4))
            .call(g => g.select('.domain')
                .remove());

        if (create && dataSet.length > 0) {
            this.markerLine(d3.select('svg.chart-' + this.chart.id));
        }

    }

    windArrow(idx, arrowX, arrowWidth, direction, svg) {
        const xint = arrowX,
            x = xint.toString(),
            x_min_3 = (xint - 3).toString(),
            x_min_2 = (xint - 2).toString(),
            x_plus_3 = (xint + 3).toString();
        let d = '',
            arrowStart = 0;

        if (arrowWidth <= 20) {
            d = 'M' + x + ',10L' + x + ',5L' + x_min_3 + ',5L' + x + ',1L' + x_plus_3 + ',5L' + x + ',5';
            arrowStart = 6 + (arrowWidth / 2.0 - 10);
        } else {
            d = 'M' + x + ',15L' + x + ',5L' + x_min_3 + ',5L' + x + ',1L' + x_plus_3 + ',5L' + x + ',5';
            arrowStart = 6 + (arrowWidth / 2.0 - 10);
        }

        svg.append('path')
            .attr('d', d)
            .attr('class', 'arrowHead')
            .attr('fill', 'black')
            .attr('stroke', 'black')
            .attr('stroke-width', '2px')
            .attr('transform', 'translate(' + arrowStart + ',130) rotate(' + direction + ', ' + x + ', 7.5)');
    }

    windArrows(dataset) {
        // use the bar chart as base for the chart
        this.barChart(dataset);
        if (dataset.length) {
            dataset = dataset[0];
        }

        // remove the bars
        const bars = d3.select('svg.chart-' + this.chart.id + ' > g').select('g.chart-' + this.chart.id);
        bars.remove();

        let svg = d3.select('svg.chart-' + this.chart.id + ' > g.wind-arrows');
        svg.remove();
        svg = d3.select('svg.chart-' + this.chart.id)
            .append('g')
            .attr('class', 'wind-arrows')
            .attr('transform', 'translate(' + this.margin.left + ',0)');

        const arrowScale = this.xAxisScale();

        for (let i = 0; i < dataset.length; i++) {
            const arrowX = arrowScale(dataset[i].date),
                arrowWidth = this.innerWidth / dataset.length;
            this.windArrow(i, arrowX, arrowWidth, dataset[i].value, svg);
        }
    }
}
