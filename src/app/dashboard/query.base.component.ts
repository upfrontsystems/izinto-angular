import {Component, Input} from '@angular/core';
import {Variable} from '../_models/variable';
import {DataSource} from '../_models/data.source';

@Component({
    selector: 'app-query-base',
    template: '<div></div>'
})
export class QueryBaseComponent {
    @Input() view: string;
    @Input() variables: Variable[];
    @Input() dataSources: DataSource[];
    @Input() dateRange: string;
    group_by = {'hour': '10m', 'day': '1h', 'week': '1d', 'month': '1d'};

    constructor() {
    }

    formatQuery(query, dataSource: DataSource) {
        query = query.replace(/:range:/g, this.dateRange);
        query = query.replace(/:group_by:/g, this.group_by[this.view]);

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
