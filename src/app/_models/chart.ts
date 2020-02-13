import {DataSource} from './data.source';
import {DashboardView} from './dashboard_view';

export const ChartTypes = ['Bar', 'Line', 'Wind Arrow'];
export type ChartType = 'Bar' | 'Line' | 'Wind Arrow';

export class ChartGroupBy {
    chart_id: number;
    value: string;
    dashboard_view_id: number;
    dashboard_view: DashboardView;
}

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
    group_by: ChartGroupBy[];
    fillFunc?: Function;
}
