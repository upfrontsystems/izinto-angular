import {Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, ViewChild} from '@angular/core';
import {Chart} from '../../_models/chart';
import * as d3Trans from 'd3-transition';
import {ChartService} from '../../_services/chart.service';
import {ChartDialogComponent} from './chart.dialog.component';
import {Variable} from '../../_models/variable';
import * as d3 from 'd3-selection';
import {Record} from '../../_models/record';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3TimeFormat from 'd3-time-format';
import * as d3Axis from 'd3-axis';
import * as d3Shape from 'd3-shape';
import {MatDialog} from '@angular/material';
import {DataSource} from '../../_models/data.source';
import {QueryBaseComponent} from '../query.base.component';

@Component({
    selector: 'app-chart',
    templateUrl: './chart.component.html',
    styleUrls: ['./../dashboard.component.scss']
})
export class ChartComponent extends QueryBaseComponent implements OnInit, OnChanges {

    @Input() chart: Chart;
    @Output() edited: EventEmitter<Chart> = new EventEmitter();
    @Output() deleted: EventEmitter<Chart> = new EventEmitter();
    private dataSet = [];
    private scales = [];

    private chartHeight = 200;
    private chartWidth = 1200;
    private innerWidth = 0;
    private innerHeight = 0;
    public windowWidth: any;
    private margin = {top: 50, right: 50, bottom: 20, left: 40};

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.setChartWidth();
    }

    constructor(protected dialog: MatDialog,
                protected chartService: ChartService) {
        super();
    }

    ngOnChanges(changes) {
        if (changes.dateRange && changes.dateRange.currentValue) {
            this.loadDataSet();
        }
    }

    ngOnInit() {
        // Initialise transition
        d3Trans.transition().duration(750);
        this.setChartWidth();
    }

    setChartWidth() {
        this.windowWidth = window.innerWidth;
        this.chartWidth = this.windowWidth - 130;
        this.innerWidth = this.chartWidth - this.margin.left - this.margin.right;
        this.innerHeight = this.chartHeight - this.margin.top - this.margin.bottom;
        this.loadDataSet();
    }

    editChart() {
        const dialogRef = this.dialog.open(ChartDialogComponent, {
            width: '600px',
            data: {chart: this.chart, dataSources: this.dataSources},
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.chartService.edit(result).subscribe(resp => {
                    this.edited.emit(result);
                });
            }
        });
    }

    deleteChart() {
        this.chartService.delete(this.chart).subscribe(resp => {
            this.deleted.emit(this.chart);
        });
    }

    loadDataSet() {
        this.dataSet.length = 0;
        this.scales = [];
        d3.selectAll('div.svg-container').remove();
        let query = this.chart.query;
        query = this.formatQuery(query, this.chart.data_source);

        this.chartService.getChartData(query, this.chart.data_source).subscribe(resp => {
            if (resp['results'][0].hasOwnProperty('series')) {
                const dataSet = [];
                for (const series of resp['results'][0]['series']) {
                    const dataset = [];
                    for (const record of series['values']) {
                        const rec = new Record(),
                            val = record[1];
                        rec.date = new Date(record[0]);
                        rec.unit = this.chart.unit;
                        rec.value = Math.round(val);
                        if (val !== null) {
                            dataset.push(rec);
                        }
                    }
                    dataset.sort();
                    dataSet.push(dataset);
                    this.dataSet.push(dataset);
                }
                if (this.chart.type === 'Line') {
                    this.lineChart(this.chart, dataSet);
                } else if (this.chart.type === 'Bar') {
                    this.barChart(this.chart, dataSet);
                } else if (this.chart.type === 'Wind Arrow') {
                    this.windArrows(this.chart, dataSet);
                }
            }
        }, err => {
            const dataset = [];
            if (this.chart.type === 'Line') {
                this.lineChart(this.chart, dataset);
            } else if (this.chart.type === 'Bar') {
                this.barChart(this.chart, dataset);
            } else if (this.chart.type === 'Wind Arrow') {
                this.windArrows(this.chart, dataset);
            }
        });
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

    markerLine(svg, color, markerHeight = 160) {

        const focus = svg.append('g')
            .attr('transform', 'translate(' + this.margin.left + ',0)')
            .attr('class', 'focus')
            .style('display', 'none');

        focus.append('line')
            .attr('class', 'x-hover-line hover-line')
            .attr('stroke', 'darkgray')
            .attr('stroke-width', '2px')
            .attr('y1', 0)
            .attr('y2', markerHeight);

        focus.append('text')
            .attr('class', 'hover-text')
            .attr('x', 5)
            .attr('y', 45)
            .attr('fill', color);

        const _this = this;
        svg.append('rect')
            .attr('transform', 'translate(' + this.margin.left + ',0)')
            .attr('class', 'overlay')
            .attr('width', this.innerWidth)
            .attr('height', markerHeight)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .on('mouseover', () => {
                this.mouseover();
            })
            .on('mouseout', () => {
                this.mouseout();
            })
            .on('mousemove', function () {
                _this.mousemove(this, markerHeight);
            });
    }

    mouseover() {
        d3.selectAll('g.focus').style('display', null);
    }

    mouseout() {
        d3.selectAll('g.focus').style('display', 'none');
    }

    mousemove(container, markerHeight) {
        if (this.dataSet.length === 0) {
            return;
        }
        const bisectDate = d3Array.bisector(function (d: Record) {
            return d.date;
        }).right;
        const xcoord = d3.mouse(container)[0],
            dsets = this.dataSet,
            scales = this.scales,
            newX = xcoord + this.margin.left;

        d3.selectAll('g.focus').each(function (d: Record, i) {
                const dset = dsets[i],
                    scale = scales[i];
                if (dset === undefined) {
                    return;
                }
                let x0 = scale.domain()[0];
                if (typeof scale.invert === 'undefined') {
                    const eachBand = scale.step(),
                        index = Math.round(((xcoord - eachBand / 2) / eachBand));
                    x0 = scale.domain()[index];
                } else {
                    x0 = scale.invert(xcoord);
                }
                const j = bisectDate(dset, x0),
                    d0 = dset[j - 1];
                d3.select(this)
                    .attr('transform', 'translate(' + newX + ',' + 0 + ')')
                    .style('display', null)
                    .select('text').text(function (): any {
                    if (d0.text) {
                        return d0.text;
                    } else {
                        return d0.value + ' ' + d0.unit;
                    }
                })
                    .select('.x-hover-line').attr('y2', markerHeight);
            }
        );
    }

    xAxisInterval(width, group_by = '1d') {
        let interval = 1;
        if (width < 800) {
            interval = 4;
        } else if (width < 1200) {
            interval = 2;
        }
        if (this.view === 'hour') {
            interval = 5;
        }

        if (this.view === 'hour') {
            return interval;
        } else if (this.view === 'day') {
            return interval;
        } else if (this.view === 'week' || this.view === 'month') {
            if (group_by === '1d') {
                return interval;
            } else if (group_by === '1h') {
                return 24 * interval;
            }
        }
        return interval;
    }

    tickFormat() {
        let fmt = '%d %b';
        if (this.view === 'hour' || this.view === 'day') {
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

    barChart(chart, dataSet) {
        const width = this.innerWidth,
            height = this.innerHeight,
            merged = this.arrayUnique([].concat.apply([], dataSet)).sort((a, b) => a.date - b.date),
            xScale = this.xScale(merged),
            yScale = this.yScale(merged),
            gridLines = d3Axis.axisLeft(this.gridScale(merged)).ticks(4).tickSize(-this.innerWidth);

        this.scales.push(xScale);
        let svg = d3.select('svg.' + chart.selector + ' > g'),
            barChart = svg.select('g.' + chart.selector);
        const create = svg.empty();
        if (create) {
            d3.selectAll('div.' + chart.selector).remove();
            d3.select('div.d3-chart.chart' + chart.id).append('div').attr('class', 'svg-container ' + chart.selector);

            svg = d3.select('div.' + chart.selector)
                .append('svg')
                .attr('class', chart.selector)
                .attr('width', this.chartWidth)
                .attr('height', this.chartHeight)
                .append('g')
                .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
            svg.append('g')
                .attr('class', 'grid');
            barChart = svg.append('g').attr('class', chart.selector);
        }

        svg.selectAll('text.section-label').remove();
        svg.append('text')
            .attr('class', 'section-label')
            .attr('x', 0)
            .attr('y', -40)
            .attr('dy', '0.8em')
            .attr('fill', 'black')
            .text(chart.title);

        svg.selectAll('g.x-axis').remove();
        svg.selectAll('g.grid > *').remove();
        const interval = this.xAxisInterval(width),
            tickFormat = this.tickFormat();
        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3Axis.axisBottom(xScale)
                .tickValues(xScale.domain().filter(function (d, i) {
                    return !(i % interval);
                }))
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

        dataSet.forEach((dataset, index) => {
            const bar_selector = 'rect.' + chart.selector + '-' + index,
                bandwidth = xScale.bandwidth() / dataSet.length,
                update = barChart.selectAll(bar_selector).data(dataset);
            update.exit().remove();
            barChart.selectAll(bar_selector).transition()
                .attr('x', (d: any) => xScale(d.date) + bandwidth * index)
                .attr('y', function (d: Record) {
                    return height - yScale(d.value);
                })
                .attr('width', xScale.bandwidth() / 2)
                .attr('height', function (d: Record) {
                    return yScale(d.value);
                });
            update.enter().append('rect')
                .attr('class', bar_selector)
                .attr('x', (d: any) => xScale(d.date) + bandwidth * index)
                .attr('y', function (d: Record) {
                    return height - yScale(d.value);
                })
                .attr('width', xScale.bandwidth() / 2)
                .attr('height', function (d: Record) {
                    return yScale(d.value);
                })
                .attr('fill', function (d: Record) {
                    if (chart.fillFunc) {
                        return chart.fillFunc(d.value);
                    } else {
                        return chart.color.split(',')[index];
                    }
                });

        });
        this.markerLine(d3.select('svg.' + chart.selector), chart.color, this.chartHeight);
    }

    lineChart(chart, dataSet) {

        const width = this.innerWidth,
            height = this.innerHeight,
            merged = this.arrayUnique([].concat.apply([], dataSet)).sort((a, b) => a.date - b.date),
            gridLines = d3Axis.axisLeft(this.gridScale(merged)).ticks(4).tickSize(-width),
            xScale = this.xScale(merged),
            yScale = this.yScale(merged, [
                d3Array.max<Date>(merged.map(d => d.value)),
                d3Array.min<Date>(merged.map(d => d.value))]);

        this.scales.push(xScale);

        const line = d3Shape.line<Record>()
            .x(function (d: any): number {
                return xScale(d.date) + xScale.bandwidth() / 2;
            }) // set the x values for the line generator
            .y(function (d: Record): number {
                return yScale(d.value);
            }) // set the y values for the line generator
            .curve(d3Shape.curveMonotoneX); // apply smoothing to the line

        let svg = d3.select('svg.' + chart.selector + ' > g');
        const create = svg.empty(),
            trans: any = 1000;
        if (create) {
            d3.select('div.d3-chart.chart' + chart.id).append('div').attr('class', 'svg-container ' + chart.selector);

            svg = d3.select('div.' + chart.selector)
                .append('svg')
                .attr('class', chart.selector)
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
                    .style('stroke', chart.color.split(',')[index])
                    .style('stroke-width', '2px')
                    .attr('class', 'line')
                    .attr('d', line);
                linechart.append('text')
                    .attr('class', 'section-label')
                    .attr('x', 0)
                    .attr('y', -40)
                    .attr('dy', '0.8em')
                    .attr('fill', 'black')
                    .text(chart.title);
            });
        } else {
            dataSet.forEach((dataset, index) => {
                svg.select('g.line-chart-' + index + ' path.line')
                    .transition(trans)
                    .attr('d', line(dataset));
            });
        }

        const tickFormat = this.tickFormat(),
            interval = this.xAxisInterval(width, chart.group_by);

        svg.selectAll('g.x-axis').remove();
        svg.selectAll('g.grid > *').remove();
        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3Axis.axisBottom(xScale)
                .tickValues(xScale.domain().filter(function (d, i) {
                    return !(i % interval);
                }))
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
            this.markerLine(d3.select('svg.' + chart.selector), chart.color, this.chartHeight);
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

    windArrows(chart, dataset) {
        // use the bar chart as base for the chart
        this.barChart(chart, dataset);

        // remove the bars
        const bars = d3.select('svg.' + chart.selector + ' > g').select('g.' + chart.selector);
        bars.remove();

        let svg = d3.select('svg.' + chart.selector + ' > g.wind-arrows');
        svg.remove();
        svg = d3.select('svg.' + chart.selector)
            .append('g')
            .attr('class', 'wind-arrows')
            .attr('transform', 'translate(' + this.margin.left + ',0)');

        const arrowScale = this.xScale(dataset);

        for (let i = 0; i < dataset.length; i++) {
            const arrowX = arrowScale(dataset[i].date),
                arrowWidth = this.innerWidth / dataset.length;
            this.windArrow(i, arrowX, arrowWidth, dataset[i].value, svg);
        }
    }
}
