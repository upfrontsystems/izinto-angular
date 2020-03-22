import {Component, Input} from '@angular/core';
import {Variable} from '../_models/variable';
import {DataSource} from '../_models/data.source';
import {DashboardView} from '../_models/dashboard_view';
import {AuthenticationService} from '../_services/authentication.service';

export const groupByValues = {
    '10s': 10,
    '1m': 60,
    '5m': 300,
    '30m': 60 * 30,
    '1h': 60 * 60,
    '6h': 60 * 60 * 6,
    '1d': 60 * 60 * 24,
    '7d': 60 * 60 * 24 * 7
};

@Component({
    selector: 'app-query-base',
    template: '<div></div>'
})
export class QueryBaseComponent {
    @Input() view: string;
    @Input() variables: Variable[];
    @Input() dataSources: DataSource[];
    @Input() dateRange: string;
    @Input() dateViews: DashboardView[];
    autoGroupBy = {'Hour': '10m', 'Day': '1h', 'Week': '1d', 'Month': '1d'};
    canEdit = false;

    constructor(protected authService: AuthenticationService) {
    }

    checkCanEdit() {
        // only admin can add and edit
        this.canEdit = this.authService.hasRole('Administrator');
    }

    groupByForView(chartGroupBy) {
        let groupByValue = '1d';
        for (const group of chartGroupBy) {
            if (group.dashboard_view.name === this.view) {
                groupByValue = group.value;
            }
        }

        if (groupByValue === 'auto') {
            groupByValue = this.autoGroupBy[this.view];
        }

        return groupByValue;
    }

    formatQuery(query, chartGroupBy, dataSource: DataSource) {
        if (!query) {
            return '';
        }

        const groupByValue = groupByValues[this.groupByForView(chartGroupBy)];

        query = query.replace(/:range:/g, this.dateRange);
        query = query.replace(/:group_by:/g, this.groupByForView(chartGroupBy));

        for (const variable of this.variables) {
            const re = new RegExp(variable.name, 'g');
            query = query.replace(re, variable.value);
        }

        if (dataSource) {
            query = query.replace(/:database:/g, dataSource.database);
        }

        // Force InfluxDB to group in the local timezones when data is grouped by increments that are larger than 1 hour
        if (groupByValue > 3600) {
            return query + ' TZ(\'' + Intl.DateTimeFormat().resolvedOptions().timeZone + '\')';
        } else {
            return query;
        }
    }
}
