import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

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
}
