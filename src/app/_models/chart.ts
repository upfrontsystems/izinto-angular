import {DataSource} from './data.source';

export const ChartTypes = ['Bar', 'Line', 'Wind Arrow'];
export type ChartType = 'Bar' | 'Line' | 'Wind Arrow';

export class Chart {
    id: number;
    dashboard_id: number;
    title: string;
    index: number;
    unit: string;
    color: string;
    decimals: number;
    type: ChartType;
    query: string;
    data_source_id: number;
    data_source: DataSource;
    fillFunc?: Function;
}
