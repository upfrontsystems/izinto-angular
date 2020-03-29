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
import * as d3SacleChromatic from 'd3-scale-chromatic';
import {MatDialog} from '@angular/material';
import {QueryBaseComponent, groupByValues} from '../query.base.component';
import {DataSourceService} from '../../_services/data.source.service';
import {MouseListenerDirective} from 'app/shared/mouse-listener/mouse.listener.directive';
import {TouchListenerDirective} from 'app/shared/touch-listener/touch.listener.directive';
import {AuthenticationService} from '../../_services/authentication.service';


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
                protected authService: AuthenticationService,
                protected dataSourceService: DataSourceService,
                protected chartService: ChartService,
                private mouseListener: MouseListenerDirective,
                private touchListener: TouchListenerDirective) {
        super(authService);
        // update marker line on all charts
        mouseListener.move.subscribe(event => {
            const target = event.target as HTMLElement;
            if (target.matches('rect')) {
                // calculate x coordinate within chart
                const bounds = target.getBoundingClientRect();
                this.mousemove(event.clientX - bounds.left, bounds);
            }
        });
        mouseListener.over.subscribe(event => {
            const target = event.target as HTMLElement;
            if (target.matches('rect')) {
                this.mouseover();
            }
        });
        mouseListener.out.subscribe(event => {
            const target = event.target as HTMLElement;
            if (target.matches('rect')) {
                this.mouseout();
            }
        });
        touchListener.touch.subscribe(event => {
            const target = event.target as HTMLElement;
            if (target.matches('rect')) {
                event.preventDefault();
                // calculate x coordinate within chart
                const bounds = target.getBoundingClientRect();
                this.mousemove(event.changedTouches[0].clientX - bounds.left, event.changedTouches[0].clientY - bounds.bottom);
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

        // only admin can edit chart
        this.checkCanEdit();

        if (this.chart.type === 'Wind Arrow') {
            this.chart.fillFunc = function(value) {
                return d3Scale.scaleSequential(d3SacleChromatic.interpolateYlGnBu)
                    .domain([0, 20])(value);
            };
        }
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
                // a result can have multiple series, each series is a separate dataset
                const groupByValue = groupByValues[this.groupByForView(this.chart.group_by)];
                for (const series of resp['results'][0]['series']) {
                    const datasets = [];
                    for (const record of series['values']) {
                        const date = new Date(record[0]);
                        if (date < this.startDate || date > this.endDate) {
                            continue;
                        }
                        // Add timezone offset if group by is greater than 1 hour
                        if (groupByValue > 3600) {
                            const timeOffsetInMS = date.getTimezoneOffset() * 60000;
                            date.setTime(date.getTime() + timeOffsetInMS);
                        }
                        const values = record.splice(1);
                        // a record can have multiple values which must be unpacked into different data sets
                        values.forEach((val, index) => {
                            if (datasets[index] === undefined) {
                                datasets[index] = [];
                            }
                            const rec = new Record();
                            rec.date = date;
                            rec.unit = this.chart.unit || '';
                            rec.fieldName = series['columns'][index + 1];
                            rec.value = val;
                            if (val !== null) {
                                datasets[index].push(rec);
                            }
                        });
                    }
                    for (const dataset of datasets) {
                        dataset.sort();
                        this.dataSets.push(dataset);
                    }
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
        const lineHeight = 22;
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

        const infoBox = focus.append('g').attr('class', 'infobox');
        infoBox.append('rect')
            .attr('class', 'background')
            .attr('transform', 'translate(10, 20)')
            .attr('stroke', 'darkgray')
            .attr('fill', 'whitesmoke')
            .attr('width', '200')
            .attr('height', this.dataSets.length * lineHeight + 30)
            .attr('fill-opacity', '0.7')
            .attr('rx', '5');

        // add date label
        infoBox.append('text')
            .style('font-size', '0.8em')
            .style('font-weight', '600')
            .style('text-anchor', 'middle')
            .attr('class', 'hover-text dataset-date')
            .attr('x', 100)
            .attr('y', 35)
            .attr('font-family', 'Poppins')
            .attr('fill', 'black');

        // add text label for each dataset
        const colors = this.chart.color.split(',');
        let yOffset = 40;
        for (let dix = 0; dix < this.dataSets.length; dix += 1) {
            yOffset += lineHeight;
            infoBox.append('text')
                .style('font-weight', '600')
                .attr('class', 'hover-text dataset-' + dix)
                .attr('x', 25)
                .attr('y', yOffset)
                .attr('fill', colors[dix]);
        }

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

    mousemove(xcoord, bounds) {
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
        let textLength = 20;
        for (let dix = 0; dix < this.dataSets.length; dix += 1) {
            const rix = bisectDate(this.dataSets[dix], xdate) - 1,
                chart_type = this.chart.type;

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
                        let text = '';
                        if (chart_type === 'Wind Arrow' && dix === 1) {
                            // TODO: unit for wind speed is hardcoded
                            text = 'Wind speed: ' + record.value.toFixed(decimals) + ' m/s';
                        } else {
                            text = record.fieldName + ': ' + record.value.toFixed(decimals) + ' ' + record.unit;
                        }
                        if (text.length > textLength) {
                            textLength = text.length;
                        }
                        return text;
                    }
            }).select('.x-hover-line').attr('y2', markerHeight);

            const boxWidth = textLength * 10;
            d3.select('g.focus.g-' + this.chart.id)
                .select('rect.background')
                .attr('width', boxWidth)

            // add date label at end
            d3.select('g.focus.g-' + this.chart.id)
                .select('text.dataset-date')
                    .attr('x', boxWidth / 2)
                    .text(function (): any {
                        return d3TimeFormat.timeFormat('%d %B %Y, %H:%M')(xdate as any);
                    });

            const focus = d3.select('g.focus.g-' + this.chart.id);
            if (newX + boxWidth > bounds.width) {
                 focus
                    .select('g.infobox')
                    .attr('transform', 'translate(' + (-boxWidth - 30) + ', 0)');
            } else {
                focus
                    .select('g.infobox')
                    .attr('transform', 'translate(0, 0)');
            }
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
        tickTime.setTime(this.startDate.getTime() + groupByValue * 1000);
        if (this.chart.type === 'Wind Arrow') {
            return xAxisScale(tickTime);
        } else {
            return xAxisScale(tickTime) / this.dataSets.length;
        }
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
            const bar_selector = 'dataset-' + index,
                bandwidth = this.barWidth(),
                padding = 1,
                update = barChart.selectAll('rect.' + bar_selector).data(dataset);
            // barChart.selectAll('rect.' + bar_selector).remove();
            update.exit().remove();
            update.enter().append('rect')
                .attr('class', bar_selector)
                .attr('x', (d: any) => padding + xAxisScale(d.date) + bandwidth * index + 1)
                .attr('y', function (d: Record) {
                    return height - yScale(d.value);
                })
                .attr('width', bandwidth - padding * 2)
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
            update.transition()
                .attr('x', (d: any) => padding + xAxisScale(d.date) + bandwidth * index + 1)
                .attr('y', function (d: Record) {
                    return height - yScale(d.value);
                })
                .attr('width', bandwidth - padding * 2)
                .attr('height', function (d: Record) {
                    return yScale(d.value);
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
            arrowStart = 6 + (arrowWidth / 2.0 - 5);
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
        // if there are two data sets in the result, we assume the second dataset is the wind speed
        if (dataset.length === 2) {
            this.barChart([dataset[1]]);
        } else {
            this.barChart(dataset);
        }
        if (dataset.length) {
            dataset = dataset[0];
        }

        let svg = d3.select('svg.chart-' + this.chart.id + ' > g.wind-arrows');
        svg.remove();
        svg = d3.select('svg.chart-' + this.chart.id)
            .append('g')
            .attr('class', 'wind-arrows')
            .attr('transform', 'translate(' + this.margin.left + ',0)');

        const arrowScale = this.xAxisScale();

        for (let i = 0; i < dataset.length; i++) {
            const arrowX = arrowScale(dataset[i].date),
                arrowWidth = this.barWidth();
            this.windArrow(i, arrowX, arrowWidth, dataset[i].value, svg);
        }
    }
}
