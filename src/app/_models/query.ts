import {DataSource} from './data.source';

export class Query {
    id: number;
    name: string;
    query: string;
    user_id: number;
    data_source_id: number;
    data_source: DataSource;
}
