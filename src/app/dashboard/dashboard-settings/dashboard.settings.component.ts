import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DashboardComponent} from '../dashboard.component';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import {DashboardService} from '../../_services/dashboard.service';
import {DataSourceService} from '../../_services/data.source.service';
import {MediaMatcher} from '@angular/cdk/layout';
import {AuthenticationService} from '../../_services/authentication.service';
import {CopyService} from '../../_services/copy.service';
import {CollectionService} from '../../_services/collection.service';

@Component({
    selector: 'app-dashboard-settings',
    templateUrl: './dashboard.settings.component.html',
    styleUrls: ['../dashboard.component.scss']
})
export class DashboardSettingsComponent extends DashboardComponent implements OnInit {

    constructor(changeDetectorRef: ChangeDetectorRef,
                media: MediaMatcher,
                protected authService: AuthenticationService,
                protected route: ActivatedRoute,
                protected http: HttpClient,
                protected dataSourceService: DataSourceService,
                public dialog: MatDialog,
                protected copyService: CopyService,
                protected collectionService: CollectionService,
                protected dashboardService: DashboardService) {
        super(changeDetectorRef, media, route, http, dialog, authService, copyService, collectionService,
            dataSourceService, dashboardService);
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
