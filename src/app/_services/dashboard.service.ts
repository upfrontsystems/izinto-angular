import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Dashboard} from '../_models/dashboard';
import {DashboardView} from '../_models/dashboard_view';
import {DateSelection} from '../_models/date_selection';


@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    toggleDateSelect: EventEmitter<boolean> = new EventEmitter<boolean>();
    currentDashboard: EventEmitter<Dashboard> = new EventEmitter<Dashboard>();
    datesUpdated: EventEmitter<DateSelection> = new EventEmitter<DateSelection>();
    private dateSelection: DateSelection;

    constructor(private http: HttpClient) {
    }

    getDashboards(filters) {
        return this.http.get<Dashboard[]>(`/api/dashboards`, {params: filters});
    }

    getById(id) {
        return this.http.get<Dashboard>(`/api/dashboards/` + id);
    }

    add(dashboard) {
        return this.http.post<Dashboard>('/api/dashboards', dashboard);
    }

    edit(dashboard) {
        return this.http.put<Dashboard>(`/api/dashboards/` + dashboard.id, dashboard);
    }

    delete(dashboard) {
        return this.http.delete(`/api/dashboards/` + dashboard.id);
    }

    reorderDashboard(dashboard) {
        return this.http.put('/api/dashboards/' + dashboard.id + '/reorder', dashboard);
    }

    listDashboardViews() {
        return this.http.get<DashboardView[]>('/api/dashboard_views');
    }

    setDateSelection(selection) {
        this.dateSelection = selection;
        this.datesUpdated.emit(this.dateSelection);
    }

    getDateSelection() {
        return this.dateSelection;
    }
}
