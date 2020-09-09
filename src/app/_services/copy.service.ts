import {Injectable} from '@angular/core';
import {Chart} from '../_models/chart';
import {HttpClient} from '@angular/common/http';
import {Collection} from '../_models/collection';
import {Dashboard} from '../_models/dashboard';
import {SingleStat} from '../_models/single.stat';

@Injectable({
    providedIn: 'root'
})
export class CopyService {

    constructor(private http: HttpClient) {
    }

    // store copy of item in local storage
    copy(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    clearCopied(key?) {
        if (key) {
            localStorage.removeItem(key);
        } else {
            localStorage.clear();
        }
    }

    canPaste(key): boolean {
        return localStorage.getItem(key) !== null;
    }

    pasteCollection() {
        const collection = JSON.parse(localStorage.getItem('collection'));
        return this.http.post<Collection>(`/api/collections/${collection.id}/paste`, collection);
    }

    pasteDashboard(collection_id) {
        // set collection id dashboard is pasted into
        const dashboard = JSON.parse(localStorage.getItem('dashboard'));
        dashboard.collection_id = collection_id;
        return this.http.post<Dashboard>(`api/dashboards/${dashboard.id}/paste`, dashboard);
    }

    pasteChart(dashboard_id) {
        // set dashboard id chart is pasted into
        const chart = JSON.parse(localStorage.getItem('chart'));
        chart.dashboard_id = dashboard_id;
        return this.http.post<Chart>(`/api/charts/${chart.id}/paste`, chart);
    }

    pasteSingleStat(dashboard_id) {
        // set dashboard id single stat is pasted into
        const stat = JSON.parse(localStorage.getItem('single_stat'));
        stat.dashboard_id = dashboard_id;
        return this.http.post<SingleStat>(`/api/single_stats/${stat.id}/paste`, stat);
    }
}
