import {Component, Input, OnInit} from '@angular/core';
import * as moment from 'moment';
import {DashboardView} from '../../_models/dashboard_view';
import {DateSelection} from '../../_models/date_selection';
import {DashboardService} from '../../_services/dashboard.service';

@Component({
    selector: 'app-dashboard-date-selector',
    templateUrl: './dashboard-date-selector.component.html',
    styleUrls: ['./dashboard-date-selector.component.css']
})
export class DashboardDateSelectorComponent implements OnInit {

    @Input() mobileQueryMatches: boolean;
    @Input() dateViews: DashboardView[];
    dateSelectOpened = false;
    dateSelection: DateSelection = new DateSelection();
    // query date range from start to end
    today = moment();
    dateRangeCounter = 1;
    pickerRange = {startDate: moment(), endDate: moment()};
    dateFormat = {
        'Hour': 'D MMM h:mm a', 'Day': 'D MMMM', 'Week': 'D MMM YYYY', 'Month': 'D MMM YYYY', 'Year': 'MMM YYYY',
        'mobile': {
            'Hour': 'D MMM H:mm', 'Day': 'D MMMM', 'Week': 'D MMM YYYY', 'Month': 'D MMM YYYY', 'Year': 'MMM YYYY',
        }
    };
    private range = {
        'Hour': {'count': 1, 'unit': 'h'},
        'Day': {'count': 1, 'unit': 'd'},
        'Week': {'count': 7, 'unit': 'd'},
        'Month': {'count': 30, 'unit': 'd'},
        'Year': {'count': 365, 'unit': 'd'}
    };

    constructor(private dashboardService: DashboardService) {
    }

    ngOnInit(): void {
        this.dashboardService.toggleDateSelect.subscribe(status => this.dateSelectOpened = status);

        this.dateSelection.view = 'Week';
        this.dateSelection.dateRange = '';
        this.setDateRange();
    }

    dateSelectVisible() {
        // Always show the date selector on bigger screens
        if (this.mobileQueryMatches) {
            return true;
        } else {
            return this.dateSelectOpened;
        }
    }

    getDateFormat() {
        if (this.mobileQueryMatches) {
            return this.dateFormat[this.dateSelection.view];
        } else {
            return this.dateFormat.mobile[this.dateSelection.view];
        }
    }

    // handler function that receives the updated date range object
    // called when user selects a start and end date manually
    updateRange(event) {

        if (!this.pickerRange.startDate && !this.pickerRange.endDate) {
            return;
        }

        this.dateSelection.startDate = this.pickerRange.startDate.toDate();
        this.dateSelection.endDate = this.pickerRange.endDate.toDate();
        this.dateSelection.dateRange = `time > '${this.dateSelection.startDate.toISOString()
            }' AND time < '${this.dateSelection.endDate.toISOString()}'`;
        // update selection in service
        this.dashboardService.setDateSelection(this.dateSelection);
    }

    // called when toggling between day, week, month and year
    updateView(view) {
        this.dateSelection.view = view;
        this.dateRangeCounter = 1;
        this.setDateRange();
    }

    // called when navigating forward and backwards using the date range picker
    updateDateCounter(count) {
        if (this.dateRangeCounter + count < 1) {
            return;
        }

        this.dateRangeCounter += count;
        this.setDateRange();
    }

    setDateRange() {
        const startCount = this.dateRangeCounter * this.range[this.dateSelection.view].count;
        const endCount = (this.dateRangeCounter - 1) * this.range[this.dateSelection.view].count;

        const date = new Date();
        const end = new Date();
        if (this.dateSelection.view === 'Hour') {
            // round minutes down
            const startTime = new Date(date.setHours(date.getHours() - startCount));
            let minutes = (Math.floor(startTime.getMinutes() / 10) * 10);
            startTime.setMinutes(minutes, 0, 0);
            this.dateSelection.startDate = startTime;

            // round end down
            const endTime = new Date(end.setHours(end.getHours() - endCount));
            minutes = (Math.floor(endTime.getMinutes() / 10) * 10);
            endTime.setMinutes(minutes, 0, 0);
            this.dateSelection.endDate = endTime;
        } else {
            // round start day to start of day
            const startDay = new Date(date.setDate(date.getDate() - startCount));
            if (this.dateSelection.view === 'Month' || this.dateSelection.view === 'Week') {
                startDay.setHours(0, 0, 0);
            }
            this.dateSelection.startDate = startDay;

            // round end day to end of previous day
            const endDay = new Date(end.setDate(end.getDate() - endCount));
            if (this.dateSelection.view === 'Month' || this.dateSelection.view === 'Week') {
                endDay.setHours(23, 59, 0, 0);
            } else if (this.dateSelection.view === 'Day') {
                endDay.setMinutes(0, 0, 0);
            }
            this.dateSelection.endDate = endDay;

            // set the ms to zero to prevent a slight offset problem when comparing dates returned by InfluxDb
            this.dateSelection.startDate.setSeconds(this.dateSelection.startDate.getSeconds(), 0);
            this.dateSelection.endDate.setSeconds(this.dateSelection.endDate.getSeconds(), 0);
        }

        this.pickerRange = {startDate: moment(this.dateSelection.startDate), endDate: moment(this.dateSelection.endDate)};
        this.dateSelection.dateRange = `time > '${this.dateSelection.startDate.toISOString()
            }' AND time < '${this.dateSelection.endDate.toISOString()}'`;
        // update selection in service
        this.dashboardService.setDateSelection(this.dateSelection);
    }
}
