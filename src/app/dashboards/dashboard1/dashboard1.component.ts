import {Component, AfterViewInit, OnInit} from '@angular/core';
import * as Chartist from 'chartist';
import { ChartType, ChartEvent } from 'ng-chartist/dist/chartist.component';
import { Apollo } from 'apollo-angular';
import * as Query from '../../queries';
declare var require: any;

const data: any = require('./data.json');

export interface Chart {
    type: ChartType;
    data: Chartist.IChartistData;
    options?: any;
    responsiveOptions?: any;
    events?: ChartEvent;
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard1.component.html',
    styleUrls: ['./dashboard1.component.scss']
})
export class Dashboard1Component implements OnInit, AfterViewInit {
    // Barchart
    barChart1: Chart = {
        type: 'Bar',
        data: data['Bar'],
        options: {
            seriesBarDistance: 15,
            high: 12,

            axisX: {
                showGrid: false,
                offset: 20
            },
            axisY: {
                showGrid: true,
                offset: 40
            }
        },

        responsiveOptions: [
            [
                'screen and (min-width: 640px)',
                {
                    axisX: {
                        labelInterpolationFnc: function(
                            value: number,
                            index: number
                        ): string {
                            return index % 1 === 0 ? `${value}` : null;
                        }
                    }
                }
            ]
        ]
    };

    // This is for the donute chart
    donuteChart1: Chart = {
        type: 'Pie',
        data: data['Pie'],
        options: {
            donut: true,
            showLabel: false,
            donutWidth: 30
        }
        // events: {
        //   draw(data: any): boolean {
        //     return data;
        //   }
        // }
    };
    // This is for the line chart
    // Line chart
    lineChart1: Chart = {
        type: 'Line',
        data: data['LineWithArea'],
        options: {
            low: 0,
            high: 100,
            showArea: true,
            fullWidth: true
        }
    };

    constructor(private apollo: Apollo) {}

    ngOnInit() {
        this.apollo.watchQuery<any>({
            query: Query.GetQuery
        })
            .valueChanges
            .subscribe(({ data }) => {
                const temps = [];
                const rain = [];
                const labels = [];
                console.log(data);
                for (const measurement of data['measurements_day']) {
                    temps.push(measurement['temperature']);
                    rain.push(measurement['rain']);
                    const d = new Date(measurement['datetime']);
                    const month = d.getMonth() + 1;
                    labels.push(d.getDate() + '/' + month);
                }
                this.lineChart1.data = {'labels': labels, 'series': [temps, rain]};
            });
    }

    ngAfterViewInit() {
        // Sparkline chart
        const sparklineLogin = function() {
            // spark count
            (<any>$('.spark-count')).sparkline(
                [4, 5, 0, 10, 9, 12, 4, 9, 4, 5, 3, 10, 9, 12, 10, 9, 12, 4, 9],
                {
                    type: 'bar',
                    width: '100%',
                    height: '70',
                    barWidth: '2',
                    resize: true,
                    barSpacing: '6',
                    barColor: 'rgba(255, 255, 255, 0.3)'
                }
            );
            // site A
            (<any>$('.sitea')).sparkline([2, 4, 4, 6, 8, 5, 6, 4, 8, 6, 6, 2], {
                type: 'line',
                width: '90%',
                height: '50',
                lineColor: '#26c6da',
                fillColor: '#26c6da',
                maxSpotColor: '#26c6da',
                highlightLineColor: 'rgba(0, 0, 0, 0.2)',
                highlightSpotColor: '#26c6da'
            });
            // site B
            (<any>$('.siteb')).sparkline([2, 4, 4, 6, 8, 5, 6, 4, 8, 6, 6, 2], {
                type: 'line',
                width: '90%',
                height: '50',
                lineColor: '#1e88e5',
                fillColor: '#1e88e5',
                maxSpotColor: '#1e88e5',
                highlightLineColor: 'rgba(0, 0, 0, 0.2)',
                highlightSpotColor: '#1e88e5'
            });
            // site C
            (<any>$('.sitec')).sparkline([2, 4, 4, 6, 8, 5, 6, 4, 8, 6, 6, 2], {
                type: 'line',
                width: '90%',
                height: '50',
                lineColor: '#f86c6b',
                fillColor: '#f86c6b',
                maxSpotColor: '#f86c6b',
                highlightLineColor: 'rgba(0, 0, 0, 0.2)',
                highlightSpotColor: '#f86c6b'
            });
        };
        let sparkResize;
        (<any>$(window)).resize(function(e) {
            clearTimeout(sparkResize);
            sparkResize = setTimeout(sparklineLogin, 500);
        });
        sparklineLogin();
    }
}
