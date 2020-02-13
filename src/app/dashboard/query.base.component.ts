import {Component, Input} from '@angular/core';
import {Variable} from '../_models/variable';
import {DataSource} from '../_models/data.source';
import {DashboardView} from '../_models/dashboard_view';

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

    constructor() {
    }

    formatQuery(query, chartGroupBy, dataSource: DataSource) {
        if (!query) {
            return '';
        }

        let groupByValue = '1d';
        for (const group of chartGroupBy) {
            if (group.dashboard_view.name === this.view) {
                groupByValue = group.value;
            }
        }

        if (groupByValue === 'auto') {
            groupByValue = this.autoGroupBy[this.view];
        }

        query = query.replace(/:range:/g, this.dateRange);
        query = query.replace(/:group_by:/g, groupByValue);

        for (const variable of this.variables) {
            const re = new RegExp(variable.name, 'g');
            query = query.replace(re, variable.value);
        }

        if (dataSource) {
            query = query.replace(/:database:/g, dataSource.database);
        }

        return query;
    }
}
