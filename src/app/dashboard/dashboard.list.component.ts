import {Component, Input, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Dashboard } from '../_models/dashboard';
import {DashboardService} from '../_services/dashboard.service';
import {MatDialog} from '@angular/material';
import {ActivatedRoute} from '@angular/router';
import {DashboardDialogComponent} from './dashboard.dialog.component';
import {CollectionService} from '../_services/collection.service';


@Component({
    selector: 'app-dashboard-list',
    templateUrl: './dashboard.list.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardListComponent implements OnInit {

    @Input() dashboards: Dashboard[];

    constructor(private route: ActivatedRoute,
                private http: HttpClient,
                public dialog: MatDialog,
                private collectionService: CollectionService,
                private dashboardService: DashboardService) { }

    ngOnInit() {
        this.getDashboards();
    }

    getDashboards() {
        // list all dashboards of this user
        this.dashboardService.getDashboards({user_id: true}).subscribe(resp => {
            this.dashboards = resp;
        });
    }

    addDashboard() {
        const dialogRef = this.dialog.open(DashboardDialogComponent, {
            width: '600px',
            data: {dashboard: {}}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.dashboardService.add(result).subscribe(resp => {
                    this.dashboards.push(resp);
                });
            }
        });
    }

    editDashboard(dashboard) {
        const dialogRef = this.dialog.open(DashboardDialogComponent, {
            width: '600px',
            data: {dashboard: dashboard}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.dashboardService.edit(result).subscribe( resp => {
                    for (const ix in this.dashboards) {
                        if (this.dashboards[ix].id === resp.id) {
                            this.dashboards[ix] = resp;
                            break;
                        }
                    }
                });
            }
        });
    }

    deleteDashboard(dashboard) {
        this.dashboardService.delete(dashboard).subscribe(resp => {
            for (const ix in this.dashboards) {
                if (this.dashboards[ix].id === dashboard.id) {
                    this.dashboards.splice(+ix, 1);
                    break;
                }
            }
        });
    }
}
