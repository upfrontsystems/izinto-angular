import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Dashboard } from '../_models/dashboard';
import {DashboardService} from '../_services/dashboard.service';
import { MatDialog } from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {DashboardDialogComponent} from './dashboard.dialog.component';
import {CollectionService} from '../_services/collection.service';
import {AlertService} from '../_services/alert.service';
import {AuthenticationService} from '../_services/authentication.service';
import {CopyService} from '../_services/copy.service';
import {PlaceholderBackgrounds} from '../collection/collection.list.component';


@Component({
    selector: 'app-dashboard-list',
    templateUrl: './dashboard.list.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardListComponent implements OnInit {

    isAdmin = false;
    collectionId: number;
    backgrounds = PlaceholderBackgrounds;
    @Input() dashboards: Dashboard[];
    @Output() edited: EventEmitter<Dashboard> = new EventEmitter();
    @Output() deleted: EventEmitter<Dashboard> = new EventEmitter();
    @Output() reordered: EventEmitter<any> = new EventEmitter();

    constructor(private route: ActivatedRoute,
                private router: Router,
                private http: HttpClient,
                public dialog: MatDialog,
                protected alertService: AlertService,
                protected authService: AuthenticationService,
                private collectionService: CollectionService,
                private copyService: CopyService,
                private dashboardService: DashboardService) { }

    ngOnInit() {
        // only admin can add and edit collections
        this.isAdmin = this.authService.hasRole('Administrator');

        this.route.paramMap.subscribe(params => {
            this.collectionId = +params.get('collection_id');
        });
    }

    // check if user is admin or has edit permission for the dashboard
    canEdit(dashboard) {
        if (this.isAdmin) {
            return true;
        }

        return (dashboard.user_access.role === 'Administrator' || dashboard.user_access.role === 'Edit');
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
        this.copyService.copy('dashboard', dashboard);
        this.alertService.success('Dashboard copied', false, 2000);
    }

    routeTo(dashboard) {
        this.router.navigate(['/dashboards', dashboard.id]);
    }
}
