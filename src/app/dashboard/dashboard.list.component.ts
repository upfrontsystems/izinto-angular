import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Dashboard } from '../_models/dashboard';
import {DashboardService} from '../_services/dashboard.service';
import {MatDialog} from '@angular/material';
import {ActivatedRoute} from '@angular/router';
import {DashboardDialogComponent} from './dashboard.dialog.component';
import {CollectionService} from '../_services/collection.service';
import {moveItemInArray} from '@angular/cdk/drag-drop';
import {AlertService} from '../_services/alert.service';


@Component({
    selector: 'app-dashboard-list',
    templateUrl: './dashboard.list.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardListComponent implements OnInit {

    collectionId: number;
    @Input() dashboards: Dashboard[];
    @Output() edited: EventEmitter<Dashboard> = new EventEmitter();
    @Output() deleted: EventEmitter<Dashboard> = new EventEmitter();
    @Output() reordered: EventEmitter<any> = new EventEmitter();

    constructor(private route: ActivatedRoute,
                private http: HttpClient,
                public dialog: MatDialog,
                protected alertService: AlertService,
                private collectionService: CollectionService,
                private dashboardService: DashboardService) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.collectionId = +params.get('collection_id');
        });
    }

    editDashboard(dashboard) {
        const dialogRef = this.dialog.open(DashboardDialogComponent, {
            width: '600px',
            data: {dashboard: dashboard}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.edited.emit(result);
            }
        });
    }

    deleteDashboard(dashboard) {
        this.dashboardService.delete(dashboard).subscribe(resp => {
            this.deleted.emit(dashboard);
        });
    }

    reorderDashboard(event) {
        if (!event.isPointerOverContainer) {
            return;
        }

        const index = event.currentIndex;
        const dashboard = event.item.data;
        if (this.dashboards[index].id === dashboard.id) {
            return;
        }

        this.reordered.emit(event);
    }

    copyDashboard(dashboard) {
        this.dashboardService.copy(dashboard);
        this.alertService.success('Dashboard copied', false, 2000);
    }
}
