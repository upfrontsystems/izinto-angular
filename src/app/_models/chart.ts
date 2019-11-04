export type ChartType = 'Pie' | 'Bar' | 'Line' | 'Wind Arrow';

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
