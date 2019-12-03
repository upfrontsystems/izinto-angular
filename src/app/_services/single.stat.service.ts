import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SingleStat} from '../_models/single.stat';

@Injectable({
  providedIn: 'root'
})
export class SingleStatService {

    constructor(private http: HttpClient) {
    }

    getSingleStats(filters) {
        return this.http.get<SingleStat[]>(`/api/single_stats`, {params: filters});
    }

    getById(id) {
        return this.http.get<SingleStat>(`/api/single_stat/` + id);
    }

    add(singleStat) {
        return this.http.post<SingleStat>('/api/single_stats', singleStat);
    }

    edit(singleStat) {
        return this.http.put<SingleStat>(`/api/single_stat/` + singleStat.id, singleStat);
    }

    delete(singleStat) {
        return this.http.delete(`/api/single_stat/` + singleStat.id);
    }
}
