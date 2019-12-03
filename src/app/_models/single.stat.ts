import {DataSource} from './data.source';

export class SingleStat {
    id: number;
    title: string;
    query: string;
    decimals: number;
    thresholds: string;
    colors: string;
    dashboard_id: number;
    format: string;
    data_source_id: number;
    data_source: DataSource;
}
