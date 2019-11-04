import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Dashboard} from '../_models/dashboard';

const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type':  'application/json',
      'Authorization': 'Basic ' + btoa('upfrontsoftware:keHZZEd3L8nkXJvK')
  })
};

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

    constructor(private http: HttpClient) { }

    getDevices(url) {
        return this.http.get(url, httpOptions);
    }

    selectDevice(url) {
        return this.http.get(url, httpOptions);
    }

    getDashboards(filters) {
        return this.http.get<Dashboard[]>(`/api/dashboards`, {params: filters});
    }

    getById(id) {
        return this.http.get<Dashboard>(`/api/dashboard/` + id);
    }
    
    add(dashboard) {
        return this.http.post<Dashboard>('/api/dashboards', dashboard);
    }

    edit(dashboard) {
        return this.http.put<Dashboard>(`api/dashboard/` + dashboard.id, dashboard);
    }

    delete(dashboard) {
        return this.http.delete(`api/dashboard/` + dashboard.id);
    }
}
