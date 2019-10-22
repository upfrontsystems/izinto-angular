import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {Chart} from '../_models/chart';
import {CHARTS} from './mock-charts';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor() { }

  getCharts(): Observable<Chart[]> {
    return of(CHARTS);
  }
}
