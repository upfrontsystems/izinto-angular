import {Component, AfterViewInit, OnInit, ElementRef, ViewChild, HostListener} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import * as d3Trans from 'd3-transition';
import * as d3Time from 'd3-time';
import * as d3TimeFormat from 'd3-time-format';
import * as d3ScaleChromatic from 'd3-scale-chromatic';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    'Authorization': 'Basic ' + btoa('upfrontsoftware:keHZZEd3L8nkXJvK')
  })
};

class Record {
    date: Date;
    unit: String;
    text: String;
    value: Number;
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
    @ViewChild('chart') private chartContainer: ElementRef;

    private queryURL = '/query?q=';
    private devices = [];
    private selected_device = '';
    private view = 'month';
    private datasets = [];
    private chartHeight = 160;
    private chartWidth = 1200;
    private colours = ['#B5CF6B', '#3A7FA3', '#FC9E27', '#D6616B', '#E7BA52'];
    private units = ['°C', 'mm', 'mbar', '°'];
    private titles = ['Temperature (°C)', 'Rainfall (mm)', 'Air Pressure (mbar)', 'Temperature (°C)', 'Wind speed (m/s) and direction (°)'];
    // humidity
    private group_by = {'hour': '10m', 'day': '1h', 'week': '1d', 'month': '1d'};
    private range = {'hour': '1h', 'day': '1d', 'week': '7d', 'month': '30d'};
    private margin = {top: 20, right: 10, bottom: 20, left: 10};
    private xScale: any;

    public innerWidth: any;

    constructor(private http: HttpClient) { }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.setChartWidth();
    }

    ngOnInit() {
        this.getDevices();
        this.setChartWidth();
        d3Trans.transition().duration(750);
    }

    setChartWidth() {
        this.innerWidth = window.innerWidth;
        this.chartWidth = this.innerWidth - 130;
        d3.selectAll('svg').remove();
        if (this.selected_device) {
            this.selectDevice(this.selected_device);
        }
    }

    ngAfterViewInit() {}

    getDevices() {
        const url = this.queryURL + encodeURIComponent('SHOW TAG VALUES ON \"izintorain\" FROM \"measurement\" WITH KEY = \"dev_id\"');
        return this.http.get(url, httpOptions)
            .subscribe(
                data => { // json data
                    this.devices = [];
                    for (const record of data['results'][0]['series'][0]['values']) {
                        this.devices.push(record[1]);
                    }
                },
                error => {
                    console.log('Error: ', error);
                });
    }

    selectDevice(selected_device) {
        const group_by = this.group_by[this.view],
            range = this.range[this.view],
            url = this.queryURL + encodeURIComponent('SELECT mean(\"temperature\") AS \"mean_temperature\",' +
                'mean("rain") AS "mean_rain", mean("barometer") AS "mean_barometer",' +
                'mean("wind") AS "mean_wind", mean("windDirection") AS "mean_windDirection" FROM \ ' +
                '\"izintorain\".\"autogen\".\"measurement\" WHERE time > now() - ' + range + ' AND \"dev_id\"=\'' +
                selected_device + '\' GROUP BY time(' + group_by + ') FILL(null)');
        return this.http.get(url, httpOptions)
            .subscribe(
                data => {
                    this.datasets = [[], [], [], [], []];
                    if (data['results'][0].hasOwnProperty('series')) {
                        for (const record of data['results'][0]['series'][0]['values']) {
                            this.datasets.forEach((dataset, i) => {
                                const rec = new Record();
                                rec.date = new Date(record[0]);
                                rec.unit = this.units[i];
                                rec.value = Math.round(record[i + 1]);
                                if (record[i + 1] !== null) {
                                    dataset.push(rec);
                                }
                            });
                        }
                    }
                    this.updateCharts();
                },
                error => {
                    console.log('Error: ', error);
                });
    }

    genxScale(dataset, rangeMin= 0, rangeMax= this.chartWidth) {
        const xmin = d3Array.min<Date>(dataset.map(d => d.date));
        const xmax = d3Array.max<Date>(dataset.map(d => d.date));
        return d3Scale.scaleTime().
            domain([xmin, xmax]).
            range([rangeMin, rangeMax]);
    }

    markerLine(svg, color, markerHeight= 160) {

        const focus = svg.append('g')
            .attr('class', 'focus')
            .style('display', 'none');

        focus.append('line')
            .attr('class', 'x-hover-line hover-line')
            .attr('stroke', 'darkgray')
            .attr('stroke-width', '2px')
            .attr('y1', 0)
            .attr('y2', markerHeight);

        focus.append('line')
            .attr('class', 'y-hover-line hover-line')
            .attr('stroke', 'darkgray')
            .attr('stroke-width', '2px')
            .attr('x1', this.chartWidth)
            .attr('x2', this.chartWidth);

        focus.append('text')
            .attr('class', 'hover-text')
            .attr('x', 5)
            .attr('y', 55)
            .attr('fill', color);

        const _this = this;
        svg.append('rect')
            .attr('class', 'overlay')
            .attr('width', this.chartWidth)
            .attr('height', markerHeight)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .on('mouseover', () => {
                this.mouseover();
            })
            .on('mouseout', () => {
                this.mouseout();
            })
            .on('mousemove', function() {
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
        if (this.datasets.length === 0) {
            return;
        }
        const bisectDate = d3Array.bisector(function (d: Record) {
            return d.date;
        }).right;
        const x0 = this.xScale.invert(d3.mouse(container)[0]),
            dsets = this.datasets,
            width = this.chartWidth,
            xScale = this.xScale;
        d3.selectAll('g.focus').each(function(d: Record, i) {
                const dset = dsets[i];
                const j = bisectDate(dset, x0),
                    d0 = dset[j - 1],
                    d1 = dset[j];
                if (j <= 0 || j > dset.length - 1) {
                    return;
                }
                d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                d3.select(this)
                    .attr('transform', 'translate(' + xScale(x0) + ',' + 0 + ')')
                    .style('display', null)
                    .select('text').text(function(): any {
                        if (d.text) {
                            return d.text;
                        } else {
                            return d.value + ' ' + d.unit;
                        }
                    })
                    .select('.x-hover-line').attr('y2', markerHeight)
                    .select('.y-hover-line').attr('x2', width * 2);
            }
        );
    }

    barChart(title, dataset, color, chartHeight, classname= 'bar', transform= '', fillFunc?, showMarkerLine= true) {
        const width = this.chartWidth - this.margin.left - this.margin.right,
              height = this.chartHeight - this.margin.top - this.margin.bottom;
        const xScale = this.genxScale(dataset, this.margin.left + 30, width - 20);
        this.xScale = xScale;
        const ymin = d3Array.min<number>(dataset.map(d => d.value));
        const ymax = d3Array.max<number>(dataset.map(d => d.value));
        const maxBarHeight = height - (height / 3);
        const gridScale = d3Scale.scaleLinear()
            .domain([ymin, ymax])
            .range([maxBarHeight, 0] );
        const yScale = d3Scale.scaleLinear()
            .domain([ymin, ymax])
            .range([0, maxBarHeight] );
        const gridLines = d3Axis.axisLeft(gridScale).ticks(4).tickSize(-width);

        let svg = d3.select('svg.' + classname + ' > g'),
            barChart = svg.select('g.' + classname);
        const create = svg.empty();
        if (create) {
            d3.selectAll('svg.' + classname).remove();
            svg = d3.select('div.d3-chart')
                .append('svg')
                .attr('class', classname)
                .attr('width', this.chartWidth)
                .attr('height', this.chartHeight)
                .append('g')
                .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
            svg.append('g')
                .attr('class', 'grid')
                .attr('transform', 'translate(0,' + (height - maxBarHeight) + ')');
            barChart = svg.append('g').attr('class', classname);
        }

        svg.selectAll('g.x-axis').remove();
        svg.selectAll('text.section-label').remove();
        svg.selectAll('g.grid > *').remove();
        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3Axis.axisBottom(xScale));
        svg.append('text')
            .attr('class', 'section-label')
            .attr('x', 0)
            .attr('y', 0)
            .attr('dy', '0.8em')
            .attr('fill', 'black')
            .text(title);
        svg.select('g.grid')
            .call(gridLines)
            .call(g => g.selectAll('.tick line')
            .attr('stroke-opacity', 0.5)
            .attr('stroke-dasharray', '2,2'))
            .call(g => g.selectAll('.tick text')
            .attr('x', 15)
            .attr('dy', -4))
            .call(g => g.select('.domain')
            .remove());

        const update = barChart.selectAll('rect.' + classname).data(dataset);
        update.exit().remove();

        barChart.selectAll('rect.' + classname).transition()
            .attr('x', function (d: Record) {
                return xScale(d.date);
            })
            .attr('y', function (d: Record) {
                return height - yScale(d.value);
            })
            .attr('width', width / (dataset.length * 1.2))
            .attr('height', function (d: Record) {
                return yScale(d.value);
            });

        update.enter().append('rect')
            .attr('class', classname)
            .attr('x', function (d: Record) {
                return xScale(d.date);
            })
            .attr('y', function (d: Record) {
                return height - yScale(d.value);
            })
            .attr('width', width / (dataset.length * 1.2))
            .attr('height', function (d: Record) {
                return yScale(d.value);
            })
            .attr('fill', function(d: Record) {
                if (fillFunc) {
                    return fillFunc(d);
                } else {
                    return color;
                }
            })
            .attr('transform', transform);

        svg.selectAll('g.x-axis')
            .call(d3Axis.axisBottom(xScale));

        if (create && showMarkerLine) {
            this.markerLine(d3.select('svg.' + classname), color, this.chartHeight);
        }
    }

    lineChart(title, dataset, color) {
        const width = this.chartWidth - this.margin.left - this.margin.right,
              height = this.chartHeight - this.margin.top - this.margin.bottom;
        const xScale = this.genxScale(dataset, this.margin.left + 30, width - 20);
        const ymin = d3Array.min<Date>(dataset.map(d => d.value));
        const ymax = d3Array.max<Date>(dataset.map(d => d.value));
        const yScale = d3Scale.scaleLinear().
            domain([ymax, ymin]).
            range([40, height - 40]);
        const gridScale = d3Scale.scaleLinear()
            .domain([ymin, ymax])
            .range([height - 40, 40] );
        const gridLines = d3Axis.axisLeft(gridScale).ticks(4).tickSize(-width);

        const line = d3Shape.line<Record>()
            .x(function(d: Record): number { return xScale(d.date); }) // set the x values for the line generator
            .y(function(d: Record): number { return 30 + yScale(d.value); }) // set the y values for the line generator
            .curve(d3Shape.curveMonotoneX); // apply smoothing to the line

        let svg = d3.select('svg.line > g');
        const create = svg.empty(),
              trans: any = 1000;
        if (create) {
            svg = d3.select('div.d3-chart')
                .append('svg')
                .attr('class', 'line')
                .attr('width', this.chartWidth)
                .attr('height', this.chartHeight)
                .append('g')
                .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
            svg.append('g')
                .attr('class', 'grid')
                .attr('transform', 'translate(0,' + 30 + ')');
            const linechart = svg.append('g').attr('class', 'line-chart');
            linechart.append('path')
                .datum(dataset)
                .attr('fill', 'none')
                .style('stroke', color)
                .style('stroke-width', '2px')
                .attr('class', 'line')
                .attr('d', line);
            linechart.append('text')
                .attr('class', 'section-label')
                .attr('x', 0)
                .attr('y', 0)
                .attr('dy', '0.8em')
                .attr('fill', 'black')
                .text(title);
        } else {
            svg.select('g.line-chart path.line')
                .transition(trans)
                .attr('d', line(dataset));
        }

        svg.selectAll('g.x-axis').remove();
        svg.selectAll('g.grid > *').remove();
        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3Axis.axisBottom(xScale));
        svg.select('g.grid')
            .call(gridLines)
            .call(g => g.selectAll('.tick line')
            .attr('stroke-opacity', 0.5)
            .attr('stroke-dasharray', '2,2'))
            .call(g => g.selectAll('.tick text')
            .attr('x', 15)
            .attr('dy', -4))
            .call(g => g.select('.domain')
            .remove());

        if (create) {
            this.markerLine(d3.select('svg.line'), color, this.chartHeight);
        }

        if (width < 600) {
            svg.selectAll('circle').remove();
            return;
        }

        const blankdot = svg.selectAll('circle.blankdot').data(dataset);
        blankdot.exit().remove();
        svg.selectAll('circle.blankdot')
            .attr('cx', function(d: Record) { return xScale(d.date); })
            .attr('cy', function(d: Record) { return 30 + yScale(d.value); });

        blankdot.enter().append('circle')
            .attr('class', 'blankdot')
            .attr('fill', 'white')
            .attr('stroke', '')
            .attr('cx', function(d: Record) { return xScale(d.date); })
            .attr('cy', function(d: Record) { return 30 + yScale(d.value); })
            .attr('r', 7);

        const dot = svg.selectAll('circle.dot').data(dataset);
        dot.exit().remove();
        svg.selectAll('circle.dot')
            .attr('cx', function(d: Record) { return xScale(d.date); })
            .attr('cy', function(d: Record) { return 30 + yScale(d.value); });

        dot.enter().append('circle')
            .attr('class', 'dot')
            .attr('fill', '#3A7FA3')
            .attr('stroke', '')
            .attr('cx', function(d: Record) { return xScale(d.date); })
            .attr('cy', function(d: Record) { return 30 + yScale(d.value); })
            .attr('r', 5);
    }

    calcPoint(input) {
        const j = input % 8,
            _input = (input / 8) || 0 % 4,
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
            // .attr("transform", "translate(" + arrowStart + ",100) rotate(" + 90 + ", " + x + ", 7.5)");
    }

    windArrows() {
        // XXX: make width and height calculation and creation of chart area a utility function
        const width = this.chartWidth - this.margin.left - this.margin.right,
              height = this.chartHeight - this.margin.top - this.margin.bottom;
        let svg = d3.select('svg.wind > g');
        const create = svg.empty();
        if (create) {
            svg = d3.select('div.d3-chart')
                .append('svg')
                .attr('class', 'wind')
                .attr('width', this.chartWidth)
                .attr('height', this.chartHeight)
                .append('g')
                .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
        } else {
            d3.selectAll('svg.wind path.arrowHead').remove();
        }

        // XXX: make section label a reusable function
        svg.append('text')
            .attr('class', 'section-label')
            .attr('x', 5)
            .attr('y', 10)
            .attr('dy', '0.8em')
            .attr('fill', 'black')
            .text(this.titles[4]);

        const lowScale = d3Scale.scaleSequential(d3ScaleChromatic.interpolateBlues)
            .domain([0, 50]);
        const highScale = d3Scale.scaleSequential(d3ScaleChromatic.interpolateYlOrRd)
            .domain([51, 100]);

        const windSpeed = this.datasets[3],
            windDirection = this.datasets[4];
        function colorScale(d) {
            let value = 0;
            for (let i = 0; i < windSpeed.length; i++) {
                if (windSpeed[i].date.toUTCString() === d.date.toUTCString()) {
                    value = windSpeed[i].value;
                }
            }
            if (value < 51) {
                return lowScale(value);
            } else if (50 < value && value < 101) {
                return highScale(value);
            }
        }
        this.barChart('Wind speed', windSpeed, this.colours[4], this.chartHeight - 40, 'wind-bar', 'translate(0,-23)', colorScale);

        const arrowScale = this.genxScale(windSpeed);

        for (let i = 0; i < windSpeed.length; i++) {
            const arrowX = arrowScale(windSpeed[i].date),
                arrowWidth = width / windSpeed.length;
            this.windArrow(i, arrowX, arrowWidth, windDirection[i].value, svg);
        }

        this.markerLine(d3.select('svg.wind'), this.colours[4], this.chartHeight);
    }

    updateView(view) {
        this.view = view;
        this.selectDevice(this.selected_device);
    }

    updateCharts() {
        this.lineChart(this.titles[3], this.datasets[0], '#D6616B');
        this.barChart(this.titles[1], this.datasets[1], this.colours[1], this.chartHeight, 'bar-rain');
        this.barChart(this.titles[2], this.datasets[2], this.colours[2], this.chartHeight, 'bar-pressure');
        // this.windArrows();
    }
}
