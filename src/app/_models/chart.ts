export type ChartType = 'Pie' | 'Bar' | 'Line' | 'Wind Arrow';

export class Chart {
    index: number;
    selector: string;
    title: string;
    group_by: string;
    unit: string;
    color: string;
    fillFunc?: Function;
    type: ChartType;
    query: string;
}
