import {Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output} from '@angular/core';
import {AutoGroupBy, Chart, GroupBy} from '../../_models/chart';
import {ChartService} from '../../_services/chart.service';
import {ChartDialogComponent} from './chart.dialog.component';
import {Record} from '../../_models/record';
import {MatDialog} from '@angular/material/dialog';
import {QueryBaseComponent} from '../query.base.component';
import {DataSourceService} from '../../_services/data.source.service';
import {MouseListenerDirective} from 'app/shared/mouse-listener/mouse.listener.directive';
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
import {saveAs} from 'file-saver';
import {DashboardService} from '../../_services/dashboard.service';
import {Subscription} from 'rxjs';


@Component({
    selector: 'app-chart',
    templateUrl: './chart.component.html',
    styleUrls: ['./../dashboard.component.scss']
})
export class ChartComponent extends QueryBaseComponent implements OnInit, OnDestroy, OnChanges {

    @Input() chart: Chart;
    @Input() sliderCoordinates: number;
    @Output() edited: EventEmitter<Chart> = new EventEmitter();
    @Output() deleted: EventEmitter<Chart> = new EventEmitter();
    public windowWidth: any;
    hiddenSeries = [];
    datesUpdated: Subscription;
    groupByValues = {};
    private dataSets = [];
    private scales = [];
    private chartHeight = 250;
    private chartWidth = 1200;
    private innerWidth = 0;
    private innerHeight = 0;
    private legendHeight = 30;
    private margin = {top: 50, right: 10, bottom: 20, left: 40};

    constructor(protected dialog: MatDialog,
                protected authService: AuthenticationService,
                protected alertService: AlertService,
                protected dashboardService: DashboardService,
                protected dataSourceService: DataSourceService,
                private copyService: CopyService,
                protected chartService: ChartService,
                private mouseListener: MouseListenerDirective) {
        super(authService, dashboardService);
        // update marker line on all charts
        mouseListener.move.subscribe(event => {
            const target = event.target as HTMLElement;
            if (target.matches('rect')) {
                // calculate x coordinate within chart
                const bounds = target.getBoundingClientRect();
                this.mousemove(event.clientX - bounds.left);
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
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        const width = event.target.innerWidth;
        if (width && this.windowWidth !== width) {
            this.buildChart();
        }
    }

    ngOnInit() {
        this.buildGroupByValues();
        // Initialise transition
        d3Trans.transition().duration(750);
        this.dateSelection = this.dashboardService.getDateSelection();
        this.loadDataSet();

        // only admin can edit chart
        this.checkCanEdit();

        this.datesUpdated = this.dashboardService.datesUpdated.subscribe((selection) => {
            if (selection) {
                this.dateSelection = selection;
                this.loadDataSet();
            }
        });

        if (this.chart.type === 'Wind Arrow') {
            this.chart.fillFunc = function (value) {
                return d3Scale.scaleSequential(d3ScaleChromatic.interpolateRdYlBu)
                    .domain([20, 0])(value);
            };
        }
    }

    ngOnDestroy() {
        // Prevent event subscriber being called multiple times.
        // See https://stackoverflow.com/questions/53505872/angular-eventemitter-called-multiple-times
        if (this.datesUpdated) {
            this.datesUpdated.unsubscribe();
        }
    }

    ngOnChanges(changes) {
        // listen for changes in the slider and update the tooltip
        if (changes.sliderCoordinates && changes.sliderCoordinates.currentValue !== undefined) {
            this.mousemove(changes.sliderCoordinates.currentValue);
        }
    }

    // calculate seconds value of query group by values
    buildGroupByValues() {
        const secondsPerUnit = {'s': 1, 'm': 60, 'h': 60 * 60, 'd': 60 * 60 * 24};
        for (const group of GroupBy) {
            if (group === 'auto') {
                continue;
            }
            const number = +(group.match(/\d+/g)[0]);
            const unit = group.match(/[a-zA-Z]+/g)[0];
            this.groupByValues[group] = number * secondsPerUnit[unit];
        }
        this.groupByValues['30d'] = 30 * secondsPerUnit['d'];
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
        this.innerWidth = this.chartWidth - this.margin.left - this.margin.right;

        // calculate number of legend rows
        const labels = this.buildLegendLabels();
        let legendRows = 1,
            xOffset = 0;
        for (let dix = 0; dix < this.dataSets.length; dix += 1) {
            const dataset = this.dataSets[dix];
            if (dataset.length === 0) {
                continue;
            }
            const header = dataset[0].header,
                fieldName = labels[header] || labels[dix] || (this.dataSets.length === 1 ? dataset[0].fieldName : header),
                rectWidth = 10,
                recordValueWidth = 7 * 10 + (this.chart.unit || '').length * 10 + this.chart.decimals * 10,
                labelWidth = fieldName.length * 10,
                legendWidth = rectWidth + labelWidth + recordValueWidth;

            xOffset += legendWidth;
            // count next row
            if ((dix < this.dataSets.length - 1) && (xOffset + legendWidth) > this.innerWidth) {
                xOffset = 0;
                legendRows += 1;
            }
        }

        this.legendHeight = legendRows * 30;
        this.chartHeight += this.legendHeight;
        this.margin.bottom = 20 + this.legendHeight;
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
        this.chartService.delete(this.chart).subscribe(() => {
            this.deleted.emit(this.chart);
        });
    }

    copyChart() {
        this.copyService.copy('chart', this.chart);
        this.alertService.success('Chart copied', false, 2000);
    }

    // download chart data as csv file
    downloadCSV() {
        const csvData = [];
        if (this.dataSets.length === 1) {
            const columns = ['time', this.dataSets[0][0].fieldName];
            const csv = [columns.join(',')];
            // format to csv
            for (const record of this.dataSets[0]) {
                csv.push([record.date, record.value].join(','));
            }
            const csvArray = csv.join('\r\n');
            csvData.push(csvArray);
        } else {
            const headers = ['time'];
            let longest = [];
            const datasets = [];
            // include multiple series id as headers
            for (const series of this.dataSets) {
                if (!series.length) {
                    continue;
                }
                datasets.push(series);
                longest = series.length > longest.length ? series : longest;
                headers.push(series[0].header);
            }

            const placeholder = datasets.map(() => '');
            const csv = longest.map(record => {
                const row = [record.date];
                return row.concat(placeholder);
            });

            // format record to csv
            for (let sIx = 0; sIx < datasets.length; sIx += 1) {
                const series = datasets[sIx];
                for (let rIx = 0; rIx < series.length; rIx += 1) {
                    csv[rIx][sIx + 1] = series[rIx].value;
                }
            }
            csv.unshift(headers);
            const csvArray = csv.join('\r\n');
            csvData.push(csvArray);
        }

        const blob = new Blob(csvData, {type: 'text/csv'});
        saveAs(blob, this.chart.title + '.csv');
    }

    loadDataSet() {
        this.dataSets.length = 0;
        this.scales = [];
        d3.selectAll('div.svg-container').remove();
        let query = this.chart.query;
        query = this.formatQuery(query, this.chart.group_by, this.chart.data_source);

        this.dataSourceService.loadDataQuery(this.chart.data_source_id, query).subscribe(resp => {
            if (resp['results']) {
                const groupByValue = this.groupByValues[this.groupByForView(this.chart.group_by)];
                // iterate through results of multiple queries
                for (const queryResult of resp['results']) {
                    // a result can have multiple series, each series is a separate dataset
                    if (!queryResult.hasOwnProperty('series')) {
                        continue;
                    }
                    const seriesList = queryResult['series'];
                    for (const series of seriesList) {
                        const datasets = [];
                        let tag;
                        if (seriesList.length > 1) {
                            const tags = Object.keys(series['tags']).map(function (key) {
                                return series['tags'][key];
                            });
                            tag = tags[0];
                        }

                        for (const record of series['values']) {
                            const date = new Date(record[0]);
                            if (date < this.dateSelection.startDate || date > this.dateSelection.endDate) {
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
                                if (tag) {
                                    rec.fieldName = series['columns'][index + 1] + ': ' + tag;
                                } else {
                                    rec.fieldName = series['columns'][index + 1];
                                }
                                rec.value = val;
                                rec.header = tag || rec.fieldName;
                                if (val !== null) {
                                    datasets[index].push(rec);
                                }
                            });
                        }

                        // if there is only one record in this dataset exclude it
                        if (datasets[0] && datasets[0].length === 1 && resp['results'].length > 1) {
                            continue;
                        }
                        for (const dataset of datasets) {
                            dataset.sort();
                            this.dataSets.push(dataset);
                        }
                    }
                }
            } else if (resp['error']) {
                this.alertService.error(resp['error']);
            }
            this.buildChart();
        }, () => {
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
            this.windArrowChart(this.dataSets);
        } else {
            this.barChart(this.dataSets);
        }
    }

    visibleSeries(dataSets) {
        const hidden = this.hiddenSeries;
        return dataSets.filter(function (e, i) {
            return hidden.indexOf(i) === -1;
        });
    }

    xAxisScale() {
        return d3Scale.scaleTime().range([0, this.innerWidth]).domain(
            [this.dateSelection.startDate, this.dateSelection.endDate]
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

        // add pixel space below for arrows
        if (this.chart.type === 'Wind Arrow') {
            const pixelHeight = this.margin.bottom * 0.9;
            const scale = ymax - ymin;
            ymin = ymin - scale * pixelHeight / this.chartHeight;
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
        // const lineHeight = 22;
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

        // overlay to capture mouse move events on chart
        // it doesn't cover the full `chartHeight` to ensure that click events on legends can fire
        svg.append('rect')
            .attr('transform', 'translate(' + this.margin.left + ',0)')
            .attr('class', 'overlay')
            .attr('width', this.innerWidth)
            .attr('height', this.chartHeight - this.margin.bottom)
            .attr('fill', 'none')
            .attr('pointer-events', 'all');
    }

    addLegend(svg) {
        svg.selectAll('g.legend').remove();
        const legendGroup = svg.append('g')
                .attr('class', 'legend g-' + this.chart.id),
            chart = this,
            colors = (this.chart.color || '').split(','),
            labels = this.buildLegendLabels();
        let yOffset = this.chartHeight - 30 - this.legendHeight,
            xOffset = 0;
        // prepend arrow colour to colours
        if (this.chart.type === 'Wind Arrow') {
            colors.unshift('black');
        }
        for (let dix = 0; dix < this.dataSets.length; dix += 1) {
            const dataset = this.dataSets[dix];
            if (dataset.length === 0) {
                continue;
            }
            const header = dataset[0].header,
                fieldName = labels[header] || labels[dix] || (this.dataSets.length === 1 ? dataset[0].fieldName : header);
            const padding = 5,
                rectWidth = 10,
                recordValueWidth = 7 * 10 + (this.chart.unit || '').length * 10 + this.chart.decimals * 10,
                labelWidth = fieldName.length * 10,
                legendWidth = rectWidth + labelWidth + recordValueWidth;
            const seriesLegend = legendGroup.append('g')
                .attr('class', 'series-legend')
                .attr('series-index', dix)
                .on('click', function () {
                    chart.toggleSeries(this);
                });
            let textFill = 'black',
                rectFill = colors[dix] || 'black';
            if (this.hiddenSeries.indexOf(dix) > -1) {
                textFill = rectFill = 'lightgray';
            }
            seriesLegend.append('rect')
                .attr('x', xOffset)
                .attr('y', yOffset - 5)
                .attr('width', '10')
                .attr('height', '2')
                .attr('fill', rectFill);
            const label = seriesLegend.append('text')
                .style('font-weight', '400')
                .attr('class', 'legend-label dataset-' + dix)
                .attr('x', xOffset + rectWidth + padding)
                .attr('y', yOffset)
                .attr('fill', textFill)
                .text(fieldName + ': ');
            if (label.node()) {
                const bBox = (label.node() as SVGSVGElement).getBBox();
                seriesLegend.append('text')
                    .style('font-weight', '600')
                    .attr('class', 'legend-value dataset-' + dix)
                    .attr('x', bBox.x + bBox.width + padding)
                    .attr('y', yOffset)
                    .attr('fill', textFill);
            }
            xOffset += legendWidth;
            // wrap to next line if legend does not fit
            if ((xOffset + legendWidth) > this.innerWidth) {
                xOffset = 0;
                yOffset += 22;
            }
        }
    }

    // build legend labels from label mapping
    buildLegendLabels() {
        const labels = this.chart.labels;
        if (!labels) {
            return [];
        }
        if (labels.includes(':')) {
            const mapping = {};
            for (const value of labels.split(',')) {
                mapping[value.split(':')[0].trim()] = value.split(':')[1].trim();
            }
            return mapping;
        }
        return labels.split(',');
    }

    // add grid to chart
    addGrid(svg, yScale) {
        const gridLines = d3Axis.axisLeft(yScale).ticks(4).tickSize(-this.innerWidth);

        svg.selectAll('g.grid > *').remove();
        svg.select('g.grid')
            .call(gridLines)
            .call(g => g.selectAll('.tick line')
                .attr('stroke-opacity', 0.5)
                .attr('stroke-dasharray', '2,2'))
            .call(g => g.selectAll('.tick text')
                .attr('x', -20))
            .call(g => g.select('.domain')
                .remove());
    }

    // add x axis labels
    addXAxis(svg, xAxisScale) {
        const interval = this.calcTickCount(this.innerWidth),
            tickFormat = this.tickFormat();

        svg.selectAll('g.x-axis').remove();
        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + this.innerHeight + ')')
            .call(d3Axis.axisBottom(xAxisScale)
                .ticks(interval)
                .tickFormat(function (d: any) {
                    return tickFormat(d);
                })
            );
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
            decimals = this.chart.decimals,
            tooltip = d3.select('g.focus.g-' + this.chart.id),
            legend = d3.select('g.legend.g-' + this.chart.id);

        // update marker label for each dataset
        for (let dix = 0; dix < this.dataSets.length; dix += 1) {
            const rix = bisectDate(this.dataSets[dix], xdate) - 1,
                chart_type = this.chart.type;

            const record = this.dataSets[dix][rix];
            if (record === undefined) {
                continue;
            }

            tooltip
                .attr('transform', 'translate(' + newX + ',' + 0 + ')')
                .style('display', null)
                .select('.x-hover-line').attr('y2', markerHeight);

            const legendText = legend.select('text.legend-label.dataset-' + dix).node() as SVGSVGElement;
            if (legendText) {
                const bBox = legendText.getBBox();
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

    toggleSeries(element) {
        const seriesIdx = Number(element.getAttribute('series-index'));
        const ii = this.hiddenSeries.indexOf(seriesIdx);
        if (ii > -1) {
            this.hiddenSeries.splice(ii, 1);
        } else {
            this.hiddenSeries.push(seriesIdx);
        }
        this.buildChart();
    }

    calcTickCount(width) {
        const interval = width / 100;
        let dayCount = (this.dateSelection.endDate.getTime() - this.dateSelection.startDate.getTime()) /
            this.groupByValues[AutoGroupBy[this.dateSelection.view]] / 1000;
        if (this.dateSelection.view === 'Hour') {
            return interval;
            // show monthly intervals for year
        } else if (this.dateSelection.view === 'Year') {
            dayCount = (this.dateSelection.endDate.getTime() - this.dateSelection.startDate.getTime()) / 2592000 / 1000;
            return interval > dayCount && dayCount || interval;
        } else {
            return interval > dayCount && dayCount || interval;
        }
    }

    tickFormat() {
        let fmt = '%d %b';
        if (this.dateSelection.view === 'Hour' || this.dateSelection.view === 'Day') {
            fmt = '%H:%M';
        } else if (this.dateSelection.view === 'Year') {
            fmt = '%b %Y';
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
            groupByValue = this.groupByValues[groupBy],
            xAxisScale = this.xAxisScale(),
            tickTime = new Date(this.dateSelection.startDate);
        tickTime.setTime(this.dateSelection.startDate.getTime() + groupByValue * 1000);
        if (this.chart.type === 'Wind Arrow') {
            return xAxisScale(tickTime);
        } else {
            return xAxisScale(tickTime) / this.dataSets.length;
        }
    }

    barChart(dataSet) {
        const merged = this.arrayUnique([].concat.apply([], this.visibleSeries(dataSet))).sort((a, b) => a.date - b.date),
            xAxisScale = this.xAxisScale(),
            yScale = this.yScale(merged, false);

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
                .attr('height', this.chartHeight - this.margin.bottom);
        }

        this.addLegend(svg);
        svg.selectAll('text.section-label').remove();
        svg.append('text')
            .attr('class', 'section-label')
            .attr('x', 0)
            .attr('y', -40)
            .attr('dy', '0.8em')
            .attr('fill', 'black')
            .text(this.chart.title);

        // add x axis
        this.addXAxis(svg, xAxisScale);
        // add grid
        this.addGrid(svg, yScale);

        const fillFunc = this.chart.fillFunc,
            colors = (this.chart.color || '').split(','),
            height = this.innerHeight;
        dataSet.forEach((dataset, index) => {
            const bar_selector = 'dataset-' + index,
                bandwidth = this.barWidth(),
                padding = bandwidth > 2 && 1 || 0,
                update = barChart.selectAll('rect.' + bar_selector).data(dataset);
            if (this.hiddenSeries.indexOf(index) > -1) {
                update.transition(<any>1000).remove();
            } else {
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
                            return colors[index] || 'black';
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
            }
        });
        if (create && dataSet.length > 0) {
            this.toolTip(d3.select('svg.chart-' + this.chart.id));
        }
    }

    lineChart(dataSet) {
        const merged = this.arrayUnique([].concat.apply([], this.visibleSeries(dataSet))).sort((a, b) => a.date - b.date),
            yScale = this.yScale(merged, false),
            xAxisScale = this.xAxisScale();

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
            trans: any = 1000,
            colors = (this.chart.color || '').split(',');
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
        } else {
            d3.select('div.chart-' + this.chart.id + ' svg')
                .attr('viewBox', '0 0 ' + this.chartWidth + ' ' + this.chartHeight)
                .attr('width', this.chartWidth)
                .attr('height', this.chartHeight);
            d3.select('div.chart-' + this.chart.id + ' rect.overlay')
                .attr('width', this.chartWidth)
                .attr('height', this.chartHeight - this.margin.bottom);
        }
        dataSet.forEach((dataset, index) => {
            if (this.hiddenSeries.indexOf(index) > -1) {
                svg.select('g.line-chart-' + index).remove();
            } else {
                const ch = svg.select('g.line-chart-' + index);
                if (ch.empty()) {
                    const linechart = svg.append('g').attr('class', 'line-chart-' + index);
                    linechart.append('path')
                        .datum(dataset)
                        .attr('fill', 'none')
                        .style('stroke', colors[index] || 'black')
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
                } else {
                    ch.select('path').transition(trans).attr('d', line(dataset));
                }
            }
        });

        // add legend
        this.addLegend(svg);
        // add x axis
        this.addXAxis(svg, xAxisScale);
        // add grid
        this.addGrid(svg, yScale);

        if (create && dataSet.length > 0) {
            this.toolTip(d3.select('svg.chart-' + this.chart.id));
        }

    }

    windArrowChart(dataset) {
        // if there are two data sets in the result, we assume the second dataset is the wind speed
        if (dataset.length === 2) {
            this.lineChart([dataset[1]]);
        } else {
            this.lineChart(dataset);
        }
        dataset = dataset[0];

        let svg = d3.select('svg.chart-' + this.chart.id + ' > g.wind-arrows');
        svg.remove();
        svg = d3.select('svg.chart-' + this.chart.id)
            .append('g')
            .attr('class', 'wind-arrows')
            .attr('transform', 'translate(' + this.margin.left + ',0)');

        const arrowScale = this.xAxisScale();
        const arrowWidth = this.barWidth();
        const minArrowWidth = 20;
        let previousArrow = 0;
        for (let i = 0; i < dataset.length; i++) {
            const arrowX = arrowScale(dataset[i].date);
            if (previousArrow > arrowX) {
                continue;
            }
            this.windArrow(i, arrowX, arrowWidth, dataset[i].value, svg);
            previousArrow = arrowX + minArrowWidth;
        }
    }

    windArrow(idx, arrowX, arrowWidth, direction, svg) {
        const xint = arrowX,
            x = xint.toString(),
            x_min_3 = (xint - 3).toString(),
            x_plus_3 = (xint + 3).toString(),
            position = this.chartHeight - (this.margin.bottom * 1.35);
            // Wind direction is reported by the direction from which it originates. For example, a northerly wind blows from
            // the north to the south.[1] Wind direction is usually reported in cardinal directions or in azimuth degrees.
            // Wind direction is measured in degrees clockwise from due north. Consequently, a wind blowing from the north has
            // a wind direction of 0° (360°); a wind blowing from the east has a wind direction of 90°; a wind blowing from the
            // south has a wind direction of 180°; and a wind blowing from the west has a wind direction of 270°.
            direction += 180;
        let d = '',
            arrowStart = 0;

        if (arrowWidth <= 20) {
            d = 'M' + x + ',10L' + x + ',5L' + x_min_3 + ',5L' + x + ',1L' + x_plus_3 + ',5L' + x + ',5';
            arrowStart = 16 + (arrowWidth / 2.0 - 10);
        } else {
            d = 'M' + x + ',15L' + x + ',5L' + x_min_3 + ',5L' + x + ',1L' + x_plus_3 + ',5L' + x + ',5';
            arrowStart = 16 + (arrowWidth / 2.0 - 5);
        }

        svg.append('path')
            .attr('d', d)
            .attr('class', 'arrowHead')
            .attr('fill', 'black')
            .attr('stroke', 'black')
            .attr('stroke-width', '2px')
            .attr('transform', 'translate(' + arrowStart + ',' + position + ') rotate(' + direction + ', ' + x + ', 7.5)');
    }
}
