import {Component, AfterViewInit, OnInit, ElementRef, ViewChild, HostListener} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import * as d3Trans from 'd3-transition';

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

    private queryURL = 'http://localhost:8086/query?q=';
    private devices = [];
    private selected_device = '';
    private create = true;
    private view = 'month';
    private datasets = [];
    private chartHeight = 160;
    private chartWidth = 1200;
    private colours = ['#FC9E27', '#3A7FA3', '#B5CF6B', '#D6616B', '#E7BA52'];
    private units = ['°C', 'mm', 'mbar', '°'];
    private titles = ['Temperature (°C)', 'Rainfall (mm)', 'Air Pressure (mbar)', 'Temperature (°C)', 'Wind speed (m/s) and direction (°)'];
    private group_by = {'hour': '10m', 'day': '1h', 'week': '1d', 'month': '1d'};
    private range = {'hour': '1h', 'day': '1d', 'week': '7d', 'month': '30d'};
    private margin = {top: 20, right: 10, bottom: 20, left: 10};

    public innerWidth: any;

    constructor(private http: HttpClient) { }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.setChartWidth();
    }

    ngOnInit() {
        this.getDevices();
        this.setChartWidth();
    }

    setChartWidth() {
        this.innerWidth = window.innerWidth;
        this.chartWidth = this.innerWidth * 0.92;
        if (this.selected_device) {
            this.create = true;
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
                'mean("rain") AS "mean_rain", mean("barometer") AS "mean_barometer" FROM \ ' +
                '\"izintorain\".\"autogen\".\"measurement\" WHERE time > now() - ' + range + ' AND \"dev_id\"=\'' +
                selected_device + '\' GROUP BY time(' + group_by + ') FILL(null)');
        return this.http.get(url, httpOptions)
            .subscribe(
                data => {
                    const temps = [],
                        rains = [],
                        mbars = [],
                        element = this.chartContainer.nativeElement;
                    this.datasets.length = 0;
                    if (data['results'][0].hasOwnProperty('series')) {
                        for (const record of data['results'][0]['series'][0]['values']) {
                            const temp = new Record();
                            temp.date = new Date(record[0]);
                            temp.unit = this.units[0];
                            temp.value = Math.round(record[1]);
                            if (temp.value === null) {
                                temp.value = 0;
                            }
                            temps.push(temp);

                            const rain = new Record();
                            rain.date = new Date(record[0]);
                            rain.unit = this.units[1];
                            rain.value = Math.round(record[2]);
                            if (rain.value === null) {
                                rain.value = 0;
                            }
                            rains.push(rain);

                            const mbar = new Record();
                            mbar.date = new Date(record[0]);
                            mbar.unit = this.units[2];
                            mbar.value = Math.round(record[3]);
                            if (mbar.value === null) {
                                mbar.value = 0;
                            }
                            mbars.push(mbar);
                        }
                    }
                    this.datasets.push(temps);
                    this.datasets.push(rains);
                    this.datasets.push(mbars);
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

    markerLine(svg, xScale, color, markerHeight= 160) {

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
                _this.mousemove(this, xScale, markerHeight);
            });
    }

    mouseover() {
        d3.selectAll('g.focus').style('display', null);
    }

    mouseout() {
        d3.selectAll('g.focus').style('display', 'none');
    }

    mousemove(container, xScale, markerHeight) {
        if (this.datasets.length === 0) {
            return;
        }
        const bisectDate = d3Array.bisector(function (d: Record) {
            return d.date;
        }).right;
        const x0 = xScale.invert(d3.mouse(container)[0]),
            dsets = this.datasets,
            width = this.chartWidth;
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
        const xScale = this.genxScale(dataset, this.margin.left + 10);
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

        let svg = d3.select('svg.' + classname + ' > g');
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
        }

        svg.selectAll('g.x-axis').remove();
        svg.selectAll('text.section-label').remove();
        svg.selectAll('g.grid').remove();
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
        svg.append('g')
            .attr('class', 'grid')
            .attr('transform', 'translate(0,' + (height - maxBarHeight) + ')')
            .call(gridLines)
            .call(g => g.selectAll('.tick line')
            .attr('stroke-opacity', 0.5)
            .attr('stroke-dasharray', '2,2'))
            .call(g => g.selectAll('.tick text')
            .attr('x', 15)
            .attr('dy', -4))
            .call(g => g.select('.domain')
            .remove());

        const update = svg.selectAll('rect.' + classname).data(dataset);
        update.exit().remove();

        svg.selectAll('rect.' + classname).transition()
            .attr('y', function (d: Record) {
                return height - yScale(d.value);
            })
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
            this.markerLine(d3.select('svg.' + classname), xScale, color, this.chartHeight);
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
        const gridLines = d3Axis.axisLeft(gridScale).ticks(3).tickSize(-width);

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
            svg.append('path')
                .datum(dataset)
                .attr('fill', 'none')
                .style('stroke', color)
                .style('stroke-width', '2px')
                .attr('class', 'line')
                .attr('d', line);
            svg.append('text')
                .attr('class', 'section-label')
                .attr('x', 0)
                .attr('y', 0)
                .attr('dy', '0.8em')
                .attr('fill', 'black')
                .text(title);
        } else {
            svg.select('path.line')
                .transition(trans)
                .attr('d', line(dataset));
        }

        svg.selectAll('g.x-axis').remove();
        svg.selectAll('g.grid').remove();
        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3Axis.axisBottom(xScale));
        svg.append('g')
            .attr('class', 'grid')
            .attr('transform', 'translate(0,' + 30 + ')')
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
            this.markerLine(d3.select('svg.line'), xScale, color, this.chartHeight);
        }

        /*if (dataset.length > 40) {
            return;
        }*/

        const t = d3Trans.transition().duration(750);

        const update = svg.selectAll('text.value').data(dataset);
        update.exit().remove();

        svg.selectAll('text.value')
            .transition(t)
            .attr('x', function(d: Record) { return xScale(d.date) - 12; })
            .attr('y', function(d: Record) { return 15 + yScale(d.value); })
            .text(function(d: Record) {return d.value + '°C'; });

        update.enter().append('text')
            .attr('class', 'value')
            .attr('x', function(d: Record) { return xScale(d.date) - 12; })
            .attr('y', function(d: Record) { return 15 + yScale(d.value); })
            .attr('fill', '#3A7FA3')
            .text(function(d: Record) {return d.value + '°C'; });

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

    updateView(view) {
        this.view = view;
        this.selectDevice(this.selected_device);
    }

    updateCharts() {
        const element = this.chartContainer.nativeElement;
        this.lineChart(this.titles[3], this.datasets[0], '#D6616B');
        for (let i = 1; i < this.datasets.length; i++) {
            this.create = true;
            this.barChart(this.titles[i], this.datasets[i], this.colours[i], this.chartHeight, 'bar-' + i);
        }

        // drawXAxis(data);
    }
}
