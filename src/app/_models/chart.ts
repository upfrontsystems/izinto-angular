export const ChartGroupBy = ['10m', '1h', '1d'];
export const ChartTypes = ['Bar', 'Line', 'Wind Arrow'];
export type ChartType = 'Bar' | 'Line' | 'Wind Arrow';

export class Chart {
    id: number;
    dashboard_id: number;
    title: string;
    index: number;
    selector: string;
    unit: string;
    color: string;
    type: ChartType;
    group_by: string;
    query: string;
    fillFunc?: Function;
}
