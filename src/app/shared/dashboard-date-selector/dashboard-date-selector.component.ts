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
    dateRangeCounter = -1;
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
        return this.mobileQueryMatches || this.dateSelectOpened;
    }

    getDateFormat() {
        if (this.mobileQueryMatches) {
            return this.dateFormat[this.dateSelection.view];
        } else {
            return this.dateFormat.mobile[this.dateSelection.view];
        }
    }

    // called when toggling between day, week, month and year
    updateView(view) {
        this.dateSelection.view = view;
        const date = new Date(this.dateSelection.startDate.valueOf());
        // set only end date range based on new view
        this.dateSelection.endDate = this.setEndDate(this.range[this.dateSelection.view].count, date);
        // updating picker object triggers change detection
        this.pickerRange = {startDate: moment(this.dateSelection.startDate), endDate: moment(this.dateSelection.endDate)};
    }

    // called when navigating forward and backwards using the date range picker
    updateDateCounter(count) {
        this.dateRangeCounter = count;
        this.setDateRange();
    }

    setDateRange() {
        const startCount = this.dateRangeCounter * this.range[this.dateSelection.view].count;
        const endCount = startCount + this.range[this.dateSelection.view].count;

        // use current date value to set range based on direction of counter
        let date = this.dateSelection.startDate || new Date();
        let end = new Date(date.valueOf());
        if (this.dateRangeCounter >= 0) {
            end = this.dateSelection.endDate || new Date();
            date = new Date(end.valueOf());
        }
        this.dateSelection.startDate = this.setStartDate(startCount, date);
        this.dateSelection.endDate = this.setEndDate(endCount, end);
        // updating picker object triggers change detection
        this.pickerRange = {startDate: moment(this.dateSelection.startDate), endDate: moment(this.dateSelection.endDate)};
    }

    setStartDate(count, date) {
        if (this.dateSelection.view === 'Hour') {
            // round minutes down
            const startTime = new Date(date.setHours(date.getHours() + count));
            const minutes = (Math.floor(startTime.getMinutes() / 10) * 10);
            startTime.setMinutes(minutes, 0, 0);
            return startTime;
        } else {
            // round start day to start of day
            const startDay = new Date(date.setDate(date.getDate() + count));
            if (this.dateSelection.view === 'Month' || this.dateSelection.view === 'Week') {
                startDay.setHours(0, 0, 0);
            }
            // set the ms to zero to prevent a slight offset problem when comparing dates returned by InfluxDb
            startDay.setSeconds(startDay.getSeconds(), 0);
            return startDay;
        }
    }

    setEndDate(count, date) {
        if (this.dateSelection.view === 'Hour') {
            // round end down
            const endTime = new Date(date.setHours(date.getHours() + count));
            const minutes = (Math.floor(endTime.getMinutes() / 10) * 10);
            endTime.setMinutes(minutes, 0, 0);
            return endTime;
        } else {
            // round end day to end of previous day
            const endDay = new Date(date.setDate(date.getDate() + count));
            if (this.dateSelection.view === 'Month' || this.dateSelection.view === 'Week') {
                endDay.setHours(23, 59, 0, 0);
            } else if (this.dateSelection.view === 'Day') {
                endDay.setMinutes(0, 0, 0);
            }
            // set the ms to zero to prevent a slight offset problem when comparing dates returned by InfluxDb
            endDay.setSeconds(endDay.getSeconds(), 0);
            return endDay;
        }
    }

    // handler function that receives the updated date range object
    // called when picker object changes
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
}
