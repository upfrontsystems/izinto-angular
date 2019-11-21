import {Component, EventEmitter, Input, Output} from '@angular/core';
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
export class DashboardListComponent {

    @Input() dashboards: Dashboard[];
    @Output() edited: EventEmitter<Dashboard> = new EventEmitter();
    @Output() deleted: EventEmitter<Dashboard> = new EventEmitter();

    constructor(private route: ActivatedRoute,
                private http: HttpClient,
                public dialog: MatDialog,
                private collectionService: CollectionService,
                private dashboardService: DashboardService) { }

    editDashboard(dashboard) {
        const dialogRef = this.dialog.open(DashboardDialogComponent, {
            width: '600px',
            data: {dashboard: dashboard}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.dashboardService.edit(result).subscribe( resp => {
                    this.edited.emit(resp);
                });
            }
        });
    }

    deleteDashboard(dashboard) {
        this.dashboardService.delete(dashboard).subscribe(resp => {
            this.deleted.emit(dashboard);
        });
    }
}
