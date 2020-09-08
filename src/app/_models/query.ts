import {DataSource} from './data.source';

export class Query {
    id: number;
    name: string;
    query: string;
    dashboard_id: number;
    data_source_id: number;
    data_source: DataSource;
}
