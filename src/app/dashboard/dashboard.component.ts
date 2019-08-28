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
    private scales = [];

    private chartHeight = 200;
    private chartWidth = 1200;
    private innerWidth = 0;
    private innerHeight = 0;
    public windowWidth: any;

    private colours = ['#B5CF6B', '#3A7FA3', '#FC9E27', '#D6616B', '#E7BA52'];
    private units = ['°C', 'mm', 'mbar', 'm/s', '°'];
    private titles = ['Temperature (°C)', 'Rainfall (mm)', 'Air Pressure (mbar)',
        'Wind speed (m/s)', 'Wind direction (°)'];
    // humidity
    private group_by = {'hour': '10m', 'day': '1h', 'week': '1d', 'month': '1d'};
    private range = {'hour': '1h', 'day': '1d', 'week': '7d', 'month': '30d'};
    private margin = {top: 50, right: 20, bottom: 20, left: 40};

    constructor(private http: HttpClient) { }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.setChartWidth();
    }

    ngOnInit() {
        this.getDevices();
        this.setChartWidth();
        // Initialise transition
        d3Trans.transition().duration(750);
    }

    setChartWidth() {
        this.windowWidth = window.innerWidth;
        this.chartWidth = this.windowWidth - 130;
        this.innerWidth = this.chartWidth - this.margin.left - this.margin.right;
        this.innerHeight = this.chartHeight - this.margin.top - this.margin.bottom;
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
                                const rec = new Record(),
                                    val = record[i + 1];
                                rec.date = new Date(record[0]);
                                rec.unit = this.units[i];
                                rec.value = Math.round(val);
                                if (val !== null) {
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

    xScale(dataset) {
        const x = d3Scale.scaleBand().range([0, this.innerWidth]).padding(0.1);
        x.domain(dataset.map(function(d) { return d.date; }));
        return x;
    }

    yScale(dataset, domain?) {
        const ymin = d3Array.min<Date>(dataset.map(d => d.value)),
            ymax = d3Array.max<Date>(dataset.map(d => d.value));
        return d3Scale.scaleLinear().
            domain(domain && domain || [ymin, ymax]).
            range([0, this.innerHeight]);
    }

    gridScale(dataset) {
        const ymin = d3Array.min<Date>(dataset.map(d => d.value)),
            ymax = d3Array.max<Date>(dataset.map(d => d.value));
        return d3Scale.scaleLinear()
            .domain([ymin, ymax])
            .range([this.innerHeight, 0] );
    }


    markerLine(svg, color, markerHeight= 160) {

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
        const xcoord = d3.mouse(container)[0],
            dsets = this.datasets,
            scales = this.scales,
            newX = xcoord + this.margin.left;

        d3.selectAll('g.focus').each(function(d: Record, i) {
                const dset = dsets[i],
                    scale = scales[i];
                let x0 = scale.domain()[0];
                if (typeof scale.invert === 'undefined') {
                    const eachBand = scale.step(),
                        index = Math.round(((xcoord - eachBand / 2) / eachBand));
                    x0 = scale.domain()[index];
                } else {
                    x0 = scale.invert(xcoord);
                }
                const j = bisectDate(dset, x0),
                    d0 = dset[j - 1],
                    d1 = dset[j];
                if (j <= 0 || j > dset.length - 1) {
                    return;
                }
                d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                d3.select(this)
                    .attr('transform', 'translate(' + newX + ',' + 0 + ')')
                    .style('display', null)
                    .select('text').text(function(): any {
                        if (d.text) {
                            return d.text;
                        } else {
                            return d.value + ' ' + d.unit;
                        }
                    })
                    .select('.x-hover-line').attr('y2', markerHeight);
            }
        );
    }

    xAxisInterval(width) {
        let ticks = d3Time.timeDay;
        if (this.view === 'hour') {
            ticks = d3Time.timeMinute;
        } else if (this.view === 'day') {
            ticks = d3Time.timeHour;
        }
        let interval = ticks.every(1);
        if (width < 800) {
            interval = ticks.every(4);
        } else if (width < 1200) {
            interval = ticks.every(2);
        }
        if (this.view === 'hour') {
            interval = ticks.every(5);
        }
        return interval;
    }

    barChart(title, dataset, color, chartHeight, classname= 'bar', fillFunc?, showMarkerLine= true) {
        const width = this.innerWidth,
            height = this.innerHeight,
            xScale = this.xScale(dataset),
            yScale = this.yScale(dataset),
            gridLines = d3Axis.axisLeft(this.gridScale(dataset)).ticks(4).tickSize(-this.innerWidth);

        this.scales.push(xScale);
        let svg = d3.select('svg.' + classname + ' > g'),
            barChart = svg.select('g.' + classname);
        const create = svg.empty();
        if (create) {
            d3.selectAll('svg.' + classname).remove();
            svg = d3.select('div.d3-chart')
                .append('svg')
                .attr('class', classname)
                .attr('width', this.chartWidth)
                .attr('height', chartHeight)
                .append('g')
                .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
            svg.append('g')
                .attr('class', 'grid');
            barChart = svg.append('g').attr('class', classname);
        }

        svg.selectAll('text.section-label').remove();
        svg.append('text')
            .attr('class', 'section-label')
            .attr('x', 0)
            .attr('y', -40)
            .attr('dy', '0.8em')
            .attr('fill', 'black')
            .text(title);

        svg.selectAll('g.x-axis').remove();
        svg.selectAll('g.grid > *').remove();
        const interval = this.xAxisInterval(width);
        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3Axis.axisBottom(xScale)
                .tickValues(xScale.domain().filter(function(d, i) { return !(i % 1 ); }))
                .tickFormat(function(d: any) {
                    return d3TimeFormat.timeFormat('%d %b')(d);
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

        const update = barChart.selectAll('rect.' + classname).data(dataset);
        update.exit().remove();

        barChart.selectAll('rect.' + classname).transition()
            .attr('x', (d: any) => xScale(d.date))
            .attr('y', function (d: Record) {
                return height - yScale(d.value);
            })
            .attr('width', xScale.bandwidth())
            .attr('height', function (d: Record) {
                return yScale(d.value);
            });

        update.enter().append('rect')
            .attr('class', classname)
            .attr('x', (d: any) => xScale(d.date))
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
            });

        if (create && showMarkerLine) {
            this.markerLine(d3.select('svg.' + classname), color, chartHeight);
        }
    }

    lineChart(title, dataset, color) {
        const width = this.innerWidth,
            height = this.innerHeight,
            gridLines = d3Axis.axisLeft(this.gridScale(dataset)).ticks(4).tickSize(-width),
            xScale = this.xScale(dataset),
            yScale = this.yScale(dataset, [
                d3Array.max<Date>(dataset.map(d => d.value)),
                d3Array.min<Date>(dataset.map(d => d.value))]);

        this.scales.push(xScale);

        const line = d3Shape.line<Record>()
            .x(function(d: any): number { return xScale(d.date) + xScale.bandwidth() / 2; }) // set the x values for the line generator
            .y(function(d: Record): number { return yScale(d.value); }) // set the y values for the line generator
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
                .attr('class', 'grid');
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
                .attr('y', -40)
                .attr('dy', '0.8em')
                .attr('fill', 'black')
                .text(title);
        } else {
            svg.select('g.line-chart path.line')
                .transition(trans)
                .attr('d', line(dataset));
        }

        const interval = this.xAxisInterval(width);
        svg.selectAll('g.x-axis').remove();
        svg.selectAll('g.grid > *').remove();
        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3Axis.axisBottom(xScale)
                .tickValues(xScale.domain().filter(function(d, i) { return !(i % 1 ); }))
                .tickFormat(function(d: any) {
                    return d3TimeFormat.timeFormat('%d %b')(d);
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
            .attr('cx', function(d: any) { return xScale(d.date) + xScale.bandwidth() / 2; })
            .attr('cy', function(d: Record) { return yScale(d.value); });

        blankdot.enter().append('circle')
            .attr('class', 'blankdot')
            .attr('fill', 'white')
            .attr('stroke', '')
            .attr('cx', function(d: any) { return xScale(d.date) + xScale.bandwidth() / 2; })
            .attr('cy', function(d: Record) { return yScale(d.value); })
            .attr('r', 7);

        const dot = svg.selectAll('circle.dot').data(dataset);
        dot.exit().remove();
        svg.selectAll('circle.dot')
            .attr('cx', function(d: any) { return xScale(d.date) + xScale.bandwidth() / 2; })
            .attr('cy', function(d: Record) { return yScale(d.value); });

        dot.enter().append('circle')
            .attr('class', 'dot')
            .attr('fill', '#3A7FA3')
            .attr('stroke', '')
            .attr('cx', function(d: any) { return xScale(d.date) + xScale.bandwidth() / 2; })
            .attr('cy', function(d: Record) { return yScale(d.value); })
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
        const windSpeed = this.datasets[3],
            windDirection = this.datasets[4],
            lowScale = d3Scale.scaleSequential(d3ScaleChromatic.interpolateBlues)
                .domain([0, 4]),
            highScale = d3Scale.scaleSequential(d3ScaleChromatic.interpolateYlOrRd)
                .domain([4, 20]);

        function colorScale(d) {
            let value = 0;
            for (let i = 0; i < windSpeed.length; i++) {
                if (windSpeed[i].date.toUTCString() === d.date.toUTCString()) {
                    value = windSpeed[i].value;
                }
            }
            if (value < 5) {
                return lowScale(value);
            } else if (5 < value && value < 20) {
                return highScale(value);
            }
        }

        this.barChart('Wind speed and direction', windSpeed, this.colours[4], this.chartHeight, 'wind-bar', colorScale);

        // XXX: make width and height calculation and creation of chart area a utility function
        const width = this.innerWidth,
              height = this.innerHeight;
        let svg = d3.select('svg.wind-bar > g.wind-arrows');
        svg.remove();
        svg = d3.select('svg.wind-bar')
            .append('g')
            .attr('class', 'wind-arrows')
            .attr('transform', 'translate(' + this.margin.left + ',0)');

        const arrowScale = this.xScale(windSpeed);

        for (let i = 0; i < windSpeed.length; i++) {
            const arrowX = arrowScale(windSpeed[i].date),
                arrowWidth = width / windSpeed.length;
            this.windArrow(i, arrowX, arrowWidth, windDirection[i].value, svg);
        }
    }

    updateView(view) {
        this.view = view;
        this.selectDevice(this.selected_device);
    }

    updateCharts() {
        this.lineChart(this.titles[0], this.datasets[0], '#D6616B');
        this.barChart(this.titles[1], this.datasets[1], this.colours[1], this.chartHeight, 'bar-rain');
        this.barChart(this.titles[2], this.datasets[2], this.colours[2], this.chartHeight, 'bar-pressure');
        this.windArrows();
    }
}
