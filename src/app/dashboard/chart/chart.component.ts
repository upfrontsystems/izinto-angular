import {Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output} from '@angular/core';
import {Chart} from '../../_models/chart';
import {ChartService} from '../../_services/chart.service';
import {ChartDialogComponent} from './chart.dialog.component';
import {Record} from '../../_models/record';
import { MatDialog } from '@angular/material/dialog';
import {QueryBaseComponent, groupByValues} from '../query.base.component';
import {DataSourceService} from '../../_services/data.source.service';
import {MouseListenerDirective} from 'app/shared/mouse-listener/mouse.listener.directive';
import {TouchListenerDirective} from 'app/shared/touch-listener/touch.listener.directive';
import {AuthenticationService} from '../../_services/authentication.service';
import {AlertService} from '../../_services/alert.service';
import * as d3 from 'd3-selection';
import * as d3Trans from 'd3-transition';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3TimeFormat from 'd3-time-format';
import * as d3Axis from 'd3-axis';
import * as d3Shape from 'd3-shape';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
import {CopyService} from '../../_services/copy.service';


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
    private chartHeight = 250;
    private chartWidth = 1200;
    private innerWidth = 0;
    private innerHeight = 0;
    private legendHeight = 30;
    public windowWidth: any;
    private margin = {top: 50, right: 10, bottom: 20, left: 40};

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        const width = event.target.innerWidth;
        if (width && this.windowWidth !== width) {
            this.buildChart();
        }
    }

    constructor(protected dialog: MatDialog,
                protected authService: AuthenticationService,
                protected alertService: AlertService,
                protected dataSourceService: DataSourceService,
                private copyService: CopyService,
                protected chartService: ChartService,
                private mouseListener: MouseListenerDirective,
                private touchListener: TouchListenerDirective) {
        super(alertService, authService);
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
        this.loadDataSet();

        // only admin can edit chart
        this.checkCanEdit();

        if (this.chart.type === 'Wind Arrow') {
            this.chart.fillFunc = function(value) {
                return d3Scale.scaleSequential(d3ScaleChromatic.interpolateRdYlBu)
                    .domain([20, 0])(value);
            };
        }
    }

    setChartDimensions() {
        // default height of 250
        this.chartHeight = this.chart.height || 200;
        this.windowWidth = window.innerWidth;
        if (this.windowWidth > 700) {
            this.chartWidth = this.windowWidth - 130;
        } else {
            this.chartWidth = this.windowWidth - 30;
        }

        // we assume a maximum legend width of 250px;
        const legendsPerRow = this.chartWidth / 250,
            legendRows = Math.ceil(this.dataSets.length / legendsPerRow);
        this.legendHeight = legendRows * 30;
        this.chartHeight += this.legendHeight;
        this.margin.bottom = 20 + this.legendHeight;

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

    copyChart() {
        this.copyService.copy('chart', this.chart);
        this.alertService.success('Chart copied', false, 2000);
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
        this.setChartDimensions();
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

    yScale(dataset, ascending = true) {
        let ymin = this.chart.min,
            ymax = this.chart.max;
        if (ymin === null) {
            ymin = d3Array.min<number>(dataset.map(d => d.value));
        }
        if (ymax === null) {
            ymax = d3Array.max<number>(dataset.map(d => d.value));
        }
        if (ascending) {
            return d3Scale.scaleLinear().domain([ymin, ymax]).range([0, this.innerHeight]);
        } else {
            return d3Scale.scaleLinear().domain([ymax, ymin]).range([0, this.innerHeight]);
        }
    }

    dropShadow(svg) {
        const defs = svg.append('defs');

        // black drop shadow
        const filter = defs.append('filter')
            .attr('id', 'drop-shadow');

        filter.append('feGaussianBlur')
            .attr('in', 'SourceAlpha')
            .attr('stdDeviation', 1)
            .attr('result', 'blur');
        filter.append('feOffset')
            .attr('in', 'blur')
            .attr('dx', 1)
            .attr('dy', 1)
            .attr('result', 'offsetBlur');
        filter.append('feFlood')
            .attr('in', 'offsetBlur')
            .attr('flood-color', '#2f3d4a')
            .attr('flood-opacity', '0.5')
            .attr('result', 'offsetColor');
        filter.append('feComposite')
            .attr('in', 'offsetColor')
            .attr('in2', 'offsetBlur')
            .attr('operator', 'in')
            .attr('result', 'offsetBlur');

        const feMerge = filter.append('feMerge');

        feMerge.append('feMergeNode')
            .attr('in', 'offsetBlur');
        feMerge.append('feMergeNode')
            .attr('in', 'SourceGraphic');
    }

    toolTip(svg) {
        this.dropShadow(svg);
        const lineHeight = 22;
        const focus = svg.append('g')
            .attr('transform', 'translate(' + -this.chartWidth + ',0)')
            .attr('class', 'focus g-' + this.chart.id)
            .style('display', 'none');

        focus.append('line')
            .attr('class', 'x-hover-line hover-line')
            .attr('stroke', '#eef5f9')
            .attr('stroke-width', '2px')
            .attr('y1', 0)
            .attr('y2', this.chartHeight);

        const toolTipInfo = focus.append('g').attr('class', 'tooltip');
        // add date label
        toolTipInfo.append('text')
            .style('font-size', '0.8em')
            .attr('class', 'hover-text dataset-date')
            .attr('x', 10)
            .attr('y', 40)
            .attr('font-family', 'Poppins')
            .attr('fill', 'black');

        svg.append('rect')
            .attr('transform', 'translate(' + this.margin.left + ',0)')
            .attr('class', 'overlay')
            .attr('width', this.innerWidth)
            .attr('height', this.chartHeight)
            .attr('fill', 'none')
            .attr('pointer-events', 'all');
    }

    legend(svg) {
        svg.selectAll('g.legend').remove();
        const legendGroup = svg.append('g')
                .attr('class', 'legend g-' + this.chart.id),
            colors = this.chart.color.split(','),
            labels = this.chart.labels;
        let yOffset = this.chartHeight - 30 - this.legendHeight,
            xOffset = 0;
        for (let dix = 0; dix < this.dataSets.length; dix += 1) {
            const dataset = this.dataSets[dix],
                fieldName = labels && labels.split(',')[dix] || dataset[0].fieldName,
                padding = 5,
                rectWidth = 10,
                recordValueWidth = 15 * 10,
                labelWidth = fieldName.length * 10,
                legendWidth = rectWidth + labelWidth + recordValueWidth;
            if (dix > 0) {
                xOffset += legendWidth;
            }
            // wrap to next line if legend does not fit
            if (xOffset + legendWidth > this.innerWidth) {
                xOffset = 0;
                yOffset += 22;
            }
            legendGroup.append('rect')
                .attr('x', xOffset)
                .attr('y', yOffset - 5)
                .attr('width', '10')
                .attr('height', '2')
                .attr('fill', colors[dix]);
            const label = legendGroup.append('text')
                .style('font-weight', '400')
                .attr('class', 'legend-label dataset-' + dix)
                .attr('x', xOffset + rectWidth + padding)
                .attr('y', yOffset)
                .attr('fill', 'black')
                .text(fieldName + ': '),
                bBox = (label.node() as SVGSVGElement).getBBox();
            legendGroup.append('text')
                .style('font-weight', '600')
                .attr('class', 'legend-value dataset-' + dix)
                .attr('x', bBox.x + bBox.width + padding)
                .attr('y', yOffset)
                .attr('fill', 'black');
        }

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
            decimals = this.chart.decimals,
            tooltip = d3.select('g.focus.g-' + this.chart.id),
            legend = d3.select('g.legend.g-' + this.chart.id);

        // update marker label for each dataset
        for (let dix = 0; dix < this.dataSets.length; dix += 1) {
            const rix = bisectDate(this.dataSets[dix], xdate) - 1,
                chart_type = this.chart.type;

            const record = this.dataSets[dix][rix];
            if (record === undefined) {
                return;
            }

            tooltip
                .attr('transform', 'translate(' + newX + ',' + 0 + ')')
                .style('display', null)
                .select('.x-hover-line').attr('y2', markerHeight);

            const bBox = (legend.select('text.legend-label.dataset-' + dix).node() as SVGSVGElement).getBBox();
            legend
                .select('text.legend-value.dataset-' + dix)
                    .text(function (): any {
                        if (chart_type === 'Wind Arrow' && dix === 1) {
                            // TODO: unit for wind speed is hardcoded
                            return record.value.toFixed(decimals) + ' m/s';
                        } else {
                            return record.value.toFixed(decimals) + ' ' + record.unit;
                        }
                    })
                    .attr('x', bBox.x + bBox.width + 5);
        }

        // update date label
        tooltip
            .select('text.dataset-date')
                .text(function (): any {
                    return d3TimeFormat.timeFormat('%d %B, %H:%M')(xdate as any);
                });

        const boxWidth = (tooltip.select('text.dataset-date').node() as SVGSVGElement).getBBox().width;

        if (newX + boxWidth > this.innerWidth) {
            let boxX = -boxWidth - 30;
            if (this.windowWidth <= 600) {
                boxX = this.innerWidth - (newX + boxWidth);
            }
            tooltip
                .select('g.tooltip')
                .attr('transform', 'translate(' + boxX + ', 0)');
        } else {
            tooltip
                .select('g.tooltip')
                .attr('transform', 'translate(0, 0)');
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
        const merged = this.arrayUnique([].concat.apply([], dataSet)).sort((a, b) => a.date - b.date),
            xAxisScale = this.xAxisScale(),
            yScale = this.yScale(merged),
            gridLines = d3Axis.axisLeft(this.yScale(merged, false)).ticks(4).tickSize(-this.innerWidth);

        let svg = d3.select('svg.chart-' + this.chart.id + ' > g'),
            barChart = svg.select('g.chart-' + this.chart.id);
        const create = svg.empty();
        if (create) {
            d3.selectAll('div.chart-' + this.chart.id).remove();
            d3.select('div.d3-chart.chart-container-' + this.chart.id)
                .append('div').attr('class', 'svg-container chart-' + this.chart.id);

            svg = d3.select('div.chart-' + this.chart.id)
                .append('svg')
                .attr('viewBox', '0 0 ' + this.chartWidth + ' ' + this.chartHeight)
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .attr('class', 'chart-' + this.chart.id)
                .attr('width', this.chartWidth)
                .attr('height', this.chartHeight)
                .append('g')
                .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
            svg.append('g')
                .attr('class', 'grid');
            barChart = svg.append('g').attr('class', 'chart-' + this.chart.id);
        } else {
            d3.select('div.chart-' + this.chart.id + ' svg')
                .attr('viewBox', '0 0 ' + this.chartWidth + ' ' + this.chartHeight)
                .attr('width', this.chartWidth)
                .attr('height', this.chartHeight);
            d3.select('div.chart-' + this.chart.id + ' rect.overlay')
                .attr('width', this.chartWidth)
                .attr('height', this.chartHeight);
        }

        this.legend(svg);
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
        const interval = this.xAxisInterval(this.innerWidth),
            tickFormat = this.tickFormat();
        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + this.innerHeight + ')')
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

        const fillFunc = this.chart.fillFunc,
            color = this.chart.color,
            height = this.innerHeight;
        dataSet.forEach((dataset, index) => {
            const bar_selector = 'dataset-' + index,
                bandwidth = this.barWidth(),
                padding = bandwidth > 2 && 1 || 0,
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
            this.toolTip(d3.select('svg.chart-' + this.chart.id));
        }
    }

    lineChart(dataSet) {

        const merged = this.arrayUnique([].concat.apply([], dataSet)).sort((a, b) => a.date - b.date),
            gridLines = d3Axis.axisLeft(this.yScale(merged, false)).ticks(4).tickSize(-this.innerWidth),
            xAxisScale = this.xAxisScale(),
            yScale = this.yScale(merged, false);

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
                .attr('viewBox', '0 0 ' + this.chartWidth + ' ' + this.chartHeight)
                .attr('preserveAspectRatio', 'xMidYMid meet')
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
            d3.select('div.chart-' + this.chart.id + ' svg')
                .attr('viewBox', '0 0 ' + this.chartWidth + ' ' + this.chartHeight)
                .attr('width', this.chartWidth)
                .attr('height', this.chartHeight);
            d3.select('div.chart-' + this.chart.id + ' rect.overlay')
                .attr('width', this.chartWidth)
                .attr('height', this.chartHeight);
            dataSet.forEach((dataset, index) => {
                svg.select('g.line-chart-' + index + ' path.line')
                    .transition(trans)
                    .attr('d', line(dataset));
            });
        }

        this.legend(svg);
        const interval = this.xAxisInterval(this.innerWidth);
        const tickFormat = this.tickFormat();

        svg.selectAll('g.x-axis').remove();
        svg.selectAll('g.grid > *').remove();
        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + this.innerHeight + ')')
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
            this.toolTip(d3.select('svg.chart-' + this.chart.id));
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
