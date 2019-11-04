import { Chart } from '../_models/chart';
import * as d3Scale from 'd3-scale';
import * as d3ScaleChromatic from 'd3-scale-chromatic';

const windScale = d3Scale.scaleSequential(d3ScaleChromatic.interpolateSpectral)
    .domain([20, 0]);


export const CHARTS: Chart[] = [
    {
        id: 1, index: 1, selector: 'temp-line', title: 'Temperature (°C)', unit: '°C', color: '#B5CF6B', type: 'Line',
        group_by: '1h', dashboard_id: 1,
        query: 'SELECT mean(\"temperature\") AS \"mean_temperature\" FROM \ ' +
            '\"izintorain\".\"autogen\".\"measurement\" WHERE time > now() - :range: AND \"dev_id\"=\':dev_id:' +
            '\' GROUP BY time(1h) FILL(null)'
    },
    {
        id: 1, index: 2, selector: 'rain-bar', title: 'Rainfall (mm)', unit: 'mm', color: '#3A7FA3', type: 'Bar',
        group_by: '1d', dashboard_id: 1,
        query: 'SELECT mean(\"rain\") AS \"mean_rain\" FROM \ ' +
            '\"izintorain\".\"autogen\".\"measurement\" WHERE time > now() - :range: AND \"dev_id\"=\':dev_id:' +
            '\' GROUP BY time(:group_by:) FILL(null)'
    },
    {
        id: 1, index: 3, selector: 'air-line', title: 'Air Pressure (mbar)', unit: 'mbar', color: '#FC9E27', type: 'Line',
        group_by: '1d', dashboard_id: 1,
        query: 'SELECT mean(\"barometer\") AS \"mean_barometer\" FROM \ ' +
            '\"izintorain\".\"autogen\".\"measurement\" WHERE time > now() - :range: AND \"dev_id\"=\':dev_id:' +
            '\' GROUP BY time(:group_by:) FILL(null)'
    },
    {
        id: 1, index: 4, selector: 'wind-speed-bar', title: 'Wind speed (m/s)', unit: 'm/s', color: '#E7BA52',
        fillFunc: windScale, type: 'Bar', group_by: '1d', dashboard_id: 1,
        query: 'SELECT mean(\"wind\") AS \"mean_wind\" FROM \ ' +
            '\"izintorain\".\"autogen\".\"measurement\" WHERE time > now() - :range: AND \"dev_id\"=\':dev_id:' +
            '\' GROUP BY time(:group_by:) FILL(null)'
    },
    {
        id: 1, index: 5, selector: 'wind-dir-arrow', title: 'Wind direction', unit: '°', color: '#E7BA52', type: 'Wind Arrow',
        group_by: '1d', dashboard_id: 1,
        query: 'SELECT mean(\"windDirection\") AS \"mean_windDirection\" FROM \ ' +
            '\"izintorain\".\"autogen\".\"measurement\" WHERE time > now() - :range: AND \"dev_id\"=\':dev_id:' +
            '\' GROUP BY time(:group_by:) FILL(null)'
    },
];
