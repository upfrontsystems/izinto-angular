import {Component, OnInit} from '@angular/core';
import {DashboardComponent} from '../dashboard.component';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material';
import {ChartService} from '../../_services/chart.service';
import {DashboardService} from '../../_services/dashboard.service';
import {SingleStatService} from '../../_services/single.stat.service';
import {DataSourceService} from '../../_services/data.source.service';

@Component({
    selector: 'app-dashboard-settings',
    templateUrl: './dashboard.settings.component.html',
    styleUrls: ['../dashboard.component.scss']
})
export class DashboardSettingsComponent extends DashboardComponent implements OnInit {

    constructor(protected route: ActivatedRoute,
                protected http: HttpClient,
                protected dataSourceService: DataSourceService,
                public dialog: MatDialog,
                protected chartService: ChartService,
                protected dashboardService: DashboardService,
                protected singleStatService: SingleStatService) {
        super(route, http, dataSourceService, dialog, chartService, dashboardService, singleStatService);
    }


    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.dashboardId = +params.get('dashboard_id');
            this.getDashboard();
        });
    }

    addVariable() {
        const variable = {id: undefined, name: '', value: '', dashboard_id: this.dashboard.id};
        this.dashboard.variables.push(variable);
    }

    variableAdded(variable) {
        for (const ix in this.dashboard.variables) {
            if (this.dashboard.variables[ix].id === undefined) {
                this.dashboard.variables[ix] = variable;
                break;
            }
        }
    }

    variableEdited(variable) {
        for (const ix in this.dashboard.variables) {
            if (this.dashboard.variables[ix].id === variable.id) {
                this.dashboard.variables[ix] = variable;
                break;
            }
        }
    }

    variableDeleted(variable) {
        for (const ix in this.dashboard.variables) {
            if (this.dashboard.variables[ix].id === variable.id) {
                this.dashboard.variables.splice(+ix, 1);
                break;
            }
        }
    }
}
