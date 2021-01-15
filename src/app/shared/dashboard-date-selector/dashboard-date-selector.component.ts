import {Component, Input, OnInit} from '@angular/core';
import * as moment from 'moment';
import {DashboardView} from '../../_models/dashboard_view';
import {DateSelection} from '../../_models/date_selection';
import {DashboardService} from '../../_services/dashboard.service';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';

// momentjs date formats
export const DATE_FORMATS = {
    parse: {
        dateInput: 'D MMM YYYY'
    },
    display: {
        dateInput: 'D MMM YYYY',
        monthYearLabel: 'YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'YYYY'
    }
};
@Component({
    selector: 'app-dashboard-date-selector',
    templateUrl: './dashboard-date-selector.component.html',
    styleUrls: ['./dashboard-date-selector.component.css'],
    providers: [
        {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
        {provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS},
    ],
})
export class DashboardDateSelectorComponent implements OnInit {

    @Input() mobileQueryMatches: boolean;
    @Input() dateViews: DashboardView[];
    dateSelectOpened = false;
    dateSelection: DateSelection = new DateSelection();
    // query date range from start to end
    dateRangeCounter = -1;
    pickerRange = {startDate: moment(), endDate: moment()};
    hourValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    timeOptions = [];

    public form: FormGroup;

    range = {
        'Hour': {'count': 1, 'unit': 'h'},
        'Day': {'count': 1, 'unit': 'd'},
        'Week': {'count': 7, 'unit': 'd'},
        'Month': {'count': 30, 'unit': 'd'},
        'Year': {'count': 365, 'unit': 'd'}
    };

    constructor(private dashboardService: DashboardService,
                private fb: FormBuilder) {
    }

    ngOnInit(): void {
        // build time options in 15 min increments for custom time picker
        const minutes = ['00', '15', '30', '45'];
        for (const hour of this.hourValues) {
            for (const min of minutes) {
                this.timeOptions.push(hour + ':' + min);
            }
        }
        // custom datetime selection
        this.form = this.fb.group({
            startDate: new FormControl(),
            startTime: new FormControl(),
            endDate: new FormControl(),
            endTime: new FormControl()});

        this.dashboardService.toggleDateSelect.subscribe(status => this.dateSelectOpened = status);

        this.dateSelection.view = 'Week';
        this.dateSelection.dateRange = '';
        this.setDateRange();
    }

    dateSelectVisible() {
        // Always show the date selector on bigger screens
        return this.mobileQueryMatches || this.dateSelectOpened;
    }

    // return range view from custom date selection
    customRange() {
        const start = this.pickerRange.startDate;
        const end = this.pickerRange.endDate;
        if (end.diff(start, 'hours') < 18) {
            return this.range['Hour'];
        } else if (end.diff(start, 'days') < 4) {
            return this.range['Day'];
        } else if (end.diff(start, 'weeks') < 4) {
            return this.range['Week'];
        } else if (end.diff(start, 'months') < 8) {
            return this.range['Month'];
        }
        return this.range['Year'];
    }

    // called when toggling between day, week, month and year
    updateView(view) {
        if (view === 'Custom') {
            return;
        }

        this.dateSelection.view = view;
        const date = new Date(this.dateSelection.startDate.valueOf());
        // set only end date range based on new view
        this.dateSelection.endDate = this.setEndDate(this.range[this.dateSelection.view].count, date);
        // update picker and call change update
        this.pickerRange = {startDate: moment(this.dateSelection.startDate), endDate: moment(this.dateSelection.endDate)};
        this.updateRange();
    }

    // called when navigating forward and backwards using the date range picker
    updateDateCounter(count) {
        this.dateRangeCounter = count;
        this.setDateRange();
    }

    setDateRange() {
        // use preset increments or calculate increment from custom range
        const viewRange = this.range[this.dateSelection.view] || this.customRange();
        const startCount = this.dateRangeCounter * viewRange.count;
        const endCount = startCount + viewRange.count;

        // use current date value to set range based on direction of counter
        let date = this.dateSelection.startDate || new Date();
        let end = new Date(date.valueOf());
        if (this.dateRangeCounter >= 0) {
            end = this.dateSelection.endDate || new Date();
            date = new Date(end.valueOf());
        }
        this.dateSelection.startDate = this.setStartDate(startCount, date);
        this.dateSelection.endDate = this.setEndDate(endCount, end);
        // update pick and call change update
        this.pickerRange = {startDate: moment(this.dateSelection.startDate), endDate: moment(this.dateSelection.endDate)};
        this.updateRange();
    }

    // set hour value from hour spinner
    setHour(hour) {
        this.dateSelection.startDate.setHours(hour);
        this.dateSelection.endDate.setHours(hour + 1);
        // update picker and call change update
        this.pickerRange = {startDate: moment(this.dateSelection.startDate), endDate: moment(this.dateSelection.endDate)};
        this.updateRange();
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

    // call change update when datepicker closes
    pickerClosed(event) {
        // set new end date offset from selected start date
        const endCount = this.range[this.dateSelection.view].count;
        const end = new Date(this.pickerRange.startDate.valueOf());
        this.dateSelection.endDate = this.setEndDate(endCount, end);
        // update picker and call change update
        this.pickerRange.endDate = moment(this.dateSelection.endDate);
        this.updateRange();
    }

    // call change update when daterange picker closes
    // format date and time selection to moment
    rangePickerClosed(event) {
        const form = this.form.value;
        const startDay = new Date(form.startDate).setHours(form.startTime.split(':')[0], form.startTime.split(':')[1] || 0);
        const endDay = new Date(form.endDate).setHours(form.endTime.split(':')[0], form.endTime.split(':')[1] || 0);
        this.pickerRange = {startDate: moment(startDay), endDate: moment(endDay)};
        this.updateRange();
    }

    // handler function that receives the updated date range object
    // called when date picker model updates
    updateRange() {
        if (!this.pickerRange.startDate && !this.pickerRange.endDate) {
            return;
        }

        this.dateSelection.startDate = this.pickerRange.startDate.toDate();
        // update date range form values
        this.form.controls.startDate.setValue(this.dateSelection.startDate);
        this.form.controls.startTime.setValue(this.pickerRange.startDate.format('HH:mm'));
        this.dateSelection.endDate = this.pickerRange.endDate.toDate();
        this.form.controls.endDate.setValue(this.dateSelection.endDate);
        this.form.controls.endTime.setValue(this.pickerRange.endDate.format('HH:mm'));

        this.dateSelection.dateRange = `time > '${this.dateSelection.startDate.toISOString()
            }' AND time < '${this.dateSelection.endDate.toISOString()}'`;
        // update selection in service
        this.dashboardService.setDateSelection(this.dateSelection);
    }
}
