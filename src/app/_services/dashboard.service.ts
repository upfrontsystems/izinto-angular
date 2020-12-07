import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Dashboard} from '../_models/dashboard';
import {DashboardView} from '../_models/dashboard_view';
import {DateSelection} from '../_models/date_selection';
import {BehaviorSubject, Observable} from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    toggleDateSelect: EventEmitter<boolean> = new EventEmitter<boolean>();
    private currentDashboardSubject: BehaviorSubject<Dashboard>;
    public currentDashboard: Observable<Dashboard>;
    datesUpdated: EventEmitter<DateSelection> = new EventEmitter<DateSelection>();
    private dateSelection: DateSelection;

    constructor(private http: HttpClient) {
        this.currentDashboardSubject = new BehaviorSubject<Dashboard>(null);
        this.currentDashboard = this.currentDashboardSubject.asObservable();
    }

    public get currentDashboardValue(): Dashboard {
        return this.currentDashboardSubject.value;
    }

    setCurrentDashboard(dashboard) {
        this.currentDashboardSubject.next(dashboard);
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

    // list the users and their access roles for this dashboard
    getUserAccess(dashboardId) {
        return this.http.get<any>(`/api/dashboards/${dashboardId}/access`);
    }

    updateUserAccess(userId, dashboardId, role) {
        return this.http.put(`/api/dashboards/${dashboardId}/access`, {user_id: userId, role});
    }
}
