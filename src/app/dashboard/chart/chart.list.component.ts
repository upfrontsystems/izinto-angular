import {Component, ElementRef, HostListener, Input, OnChanges, OnInit, SimpleChange, ViewChild} from '@angular/core';
import {Chart} from '../../_models/chart';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material';
import {ChartService} from '../../_services/chart.service';
import * as d3Trans from 'd3-transition';
import {ChartDialogComponent} from './chart.dialog.component';
import * as d3 from 'd3-selection';
import {Record} from '../../_models/record';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3TimeFormat from 'd3-time-format';
import * as d3Axis from 'd3-axis';
import * as d3Shape from 'd3-shape';
import {Variable} from '../../_models/variable';

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

    private charts: Chart[] = [];
    private view = 'month';
    private dataSets = [];
    private scales = [];

    private chartHeight = 200;
    private chartWidth = 1200;
    private innerWidth = 0;
    private innerHeight = 0;
    public windowWidth: any;

    private group_by = {'hour': '10m', 'day': '1h', 'week': '1d', 'month': '1d'};
    private range = {'hour': '1h', 'day': '1d', 'week': '7d', 'month': '30d'};
    private margin = {top: 50, right: 20, bottom: 20, left: 40};

    constructor(protected http: HttpClient,
                protected dialog: MatDialog,
                protected chartService: ChartService) {
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.setChartWidth();
    }

    ngOnChanges(changes) {
        if (changes.addedChart && changes.addedChart.currentValue) {
            const chart = changes.addedChart.currentValue;
            this.charts.push(chart);
            this.loadDataSets();
        }
    }

    ngOnInit() {
        this.getCharts();
        // Initialise transition
        d3Trans.transition().duration(750);
    }

    getCharts() {
        this.chartService.getCharts({dashboard_id: this.dashboardId}).subscribe(charts => {
            this.charts = charts;
            this.setChartWidth();
        });
    }

    setChartWidth() {
        this.windowWidth = window.innerWidth;
        this.chartWidth = this.windowWidth - 130;
        this.innerWidth = this.chartWidth - this.margin.left - this.margin.right;
        this.innerHeight = this.chartHeight - this.margin.top - this.margin.bottom;
        this.loadDataSets();
    }

    editChart(chart) {
        const dialogRef = this.dialog.open(ChartDialogComponent, {
            width: '600px',
            data: {chart: chart},
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.chartService.edit(result).subscribe(resp => {
                    for (const ix in this.charts) {
                        if (this.charts[ix].id === resp.id) {
                            this.charts[ix] = resp;
                            this.loadDataSets();
                            break;
                        }
                    }
                });
            }
        });
    }

    deleteChart(chart) {
        this.deleteConfirm.show();
        this.deleteConfirm.onAccept.subscribe(event => {
            this.chartService.delete(chart).subscribe(resp => {
                for (const ix in this.charts) {
                    if (this.charts[ix].id === chart.id) {
                        this.charts.splice(+ix, 1);
                        this.loadDataSets();
                        break;
                    }
                }
            });
        });
    }

    createButtons(chart) {
        const self = this;
        d3.select('div.' + chart.selector)
            .append('button')
            .text('Delete')
            .attr('class', 'mat-button pull-right mat-error delete' + chart.id)
            .on('click', function () {
                self.deleteChart(chart);
            });
        d3.select('div.' + chart.selector)
            .append('button')
            .text('Edit')
            .attr('class', 'mat-button pull-right edit' + chart.id)
            .on('click', function () {
                self.editChart(chart);
            });
    }

    loadDataSets() {
        this.dataSets.length = 0;
        this.scales = [];
        d3.selectAll('div.svg-container').remove();
        for (const chart of this.charts) {
            let query = chart.query;
            query = this.formatQuery(query);

            this.chartService.getChartData(query).subscribe(resp => {
                if (resp['results'][0].hasOwnProperty('series')) {
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
                        this.dataSets.push(dataset);
                    }
                    if (chart.type === 'Line') {
                        this.lineChart(chart, dataSets);
                    } else if (chart.type === 'Bar') {
                        this.barChart(chart, dataSets);
                    } else if (chart.type === 'Wind Arrow') {
                        this.windArrows(chart, dataSets);
                    }
                }
            }, err => {
                const dataset = [];
                if (chart.type === 'Line') {
                    this.lineChart(chart, dataset);
                } else if (chart.type === 'Bar') {
                    this.barChart(chart, dataset);
                } else if (chart.type === 'Wind Arrow') {
                    this.windArrows(chart, dataset);
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
        if (this.dataSets.length === 0) {
            return;
        }
        const bisectDate = d3Array.bisector(function (d: Record) {
            return d.date;
        }).right;
        const xcoord = d3.mouse(container)[0],
            dsets = this.dataSets,
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

    barChart(chart, dataSets) {
        const width = this.innerWidth,
            height = this.innerHeight,
            merged = this.arrayUnique([].concat.apply([], dataSets)).sort((a, b) => a.date - b.date),
            xScale = this.xScale(merged),
            yScale = this.yScale(merged),
            gridLines = d3Axis.axisLeft(this.gridScale(merged)).ticks(4).tickSize(-this.innerWidth);

        this.scales.push(xScale);
        let svg = d3.select('svg.' + chart.selector + ' > g'),
            barChart = svg.select('g.' + chart.selector);
        const create = svg.empty();
        if (create) {
            d3.selectAll('div.' + chart.selector).remove();
            d3.select('div.d3-chart').append('div').attr('class', 'svg-container ' + chart.selector);
            // add edit and delete buttons
            this.createButtons(chart);

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

        dataSets.forEach((dataset, index) => {
            const bar_selector = 'rect.' + chart.selector + '-' + index,
                bandwidth = xScale.bandwidth() / dataSets.length,
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

    lineChart(chart, dataSets) {

        const width = this.innerWidth,
            height = this.innerHeight,
            merged = this.arrayUnique([].concat.apply([], dataSets)).sort((a, b) => a.date - b.date),
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
            d3.select('div.d3-chart').append('div').attr('class', 'svg-container ' + chart.selector);
            // add edit and delete buttons
            this.createButtons(chart);

            svg = d3.select('div.' + chart.selector)
                .append('svg')
                .attr('class', chart.selector)
                .attr('width', this.chartWidth)
                .attr('height', this.chartHeight)
                .append('g')
                .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
            svg.append('g')
                .attr('class', 'grid');
            dataSets.forEach((dataset, index) => {
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
            dataSets.forEach((dataset, index) => {
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

        if (create && dataSets.length > 0) {
            this.markerLine(d3.select('svg.' + chart.selector), chart.color, this.chartHeight);
        }

    }

    calcPoint(input) {
        const j = input % 8,
            _input = Math.round(input / 8) || 0 % 4,
            cardinal = ['north', 'east', 'south', 'west'],
            pointDesc = ['1', '1 by 2', '1-C', 'C by 1', 'C', 'C by 2', '2-C', '2 by 1'],
            str1 = cardinal[_input],
            str2 = cardinal[(_input + 1) % 4],
            strC = (str1 === cardinal[0] || str1 === cardinal[2]) ? str1 + str2 : str2 + str1;
        return pointDesc[j].replace('1', str1).replace('2', str2).replace('C', strC);
    }

    getShortName(name) {
        return name.replace(/north/g, 'N')
            .replace(/east/g, 'E')
            .replace(/south/g, 'S')
            .replace(/west/g, 'W')
            .replace(/by/g, 'b')
            .replace(/[\s-]/g, '');
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

    updateView(view) {
        this.view = view;
        this.loadDataSets();
    }
}
