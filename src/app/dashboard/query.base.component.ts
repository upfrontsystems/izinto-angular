import {Component, Input} from '@angular/core';
import {Variable} from '../_models/variable';
import {DataSource} from '../_models/data.source';
import {AuthenticationService} from '../_services/authentication.service';
import {AutoGroupBy} from '../_models/chart';
import {DashboardService} from '../_services/dashboard.service';
import {DashboardView} from '../_models/dashboard_view';
import {DateSelection} from '../_models/date_selection';

@Component({
    selector: 'app-query-base',
    template: '<div></div>'
})
export class QueryBaseComponent {
    @Input() variables: Variable[];
    @Input() dataSources: DataSource[];
    @Input() dateViews: DashboardView[];
    canEdit = false;
    dateSelection: DateSelection = new DateSelection();

    constructor(protected authService: AuthenticationService,
                protected dashboardService: DashboardService) {
    }

    checkCanEdit() {
        // only admin can add and edit
        this.canEdit = this.authService.hasRole('Administrator');
    }

    groupByForView(chartGroupBy) {
        let groupByValue = '1d';
        for (const group of chartGroupBy) {
            if (group.dashboard_view.name === this.dateSelection.view) {
                groupByValue = group.value;
            }
        }

        if (groupByValue === 'auto') {
            groupByValue = AutoGroupBy[this.dateSelection.view];
        }

        return groupByValue;
    }

    formatQuery(query, chartGroupBy, dataSource: DataSource) {
        if (!query) {
            return '';
        }

        query = query.replace(/:range:/g, this.dateSelection.dateRange);
        query = query.replace(/:group_by:/g, this.groupByForView(chartGroupBy));

        for (const variable of this.variables) {
            const re = new RegExp(':' + variable.name + ':', 'g');
            query = query.replace(re, variable.value);
        }

        if (dataSource) {
            query = query.replace(/:database:/g, dataSource.database);
        }

        return query;
    }
}
