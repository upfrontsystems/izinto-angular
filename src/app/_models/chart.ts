import {DataSource} from './data.source';
import {DashboardView} from './dashboard_view';

export const ChartTypes = ['Bar', 'Line', 'Wind Arrow'];
export type ChartType = 'Bar' | 'Line' | 'Wind Arrow';
export const GroupBy = ['auto', '10s', '1m', '5m', '10m', '30m', '1h', '3h', '6h', '1d', '7d'];
export const GroupByValues = {
    '10s': 10,
    '1m': 60,
    '5m': 300,
    '30m': 60 * 30,
    '1h': 60 * 60,
    '6h': 60 * 60 * 6,
    '1d': 60 * 60 * 24,
    '7d': 60 * 60 * 24 * 7
};
export const AutoGroupBy = {'Hour': '10m', 'Day': '1h', 'Week': '1d', 'Month': '1d', 'Year': '1d'};

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
    labels: string;
    min: number;
    max: number;
    height: number;
    data_source_id: number;
    data_source: DataSource;
    group_by: ChartGroupBy[];
    fillFunc?: Function;
}
