import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Chart} from '../_models/chart';
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

    getById(id) {
        return this.http.get<Dashboard>(`/api/dashboard/` + id);
    }
}
