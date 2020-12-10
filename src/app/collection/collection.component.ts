import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import {Collection} from '../_models/collection';
import {CollectionService} from '../_services/collection.service';
import {DashboardDialogComponent} from '../dashboard/dashboard.dialog.component';
import {DashboardService} from '../_services/dashboard.service';
import {CopyService} from '../_services/copy.service';
import {AuthenticationService} from '../_services/authentication.service';

@Component({
    selector: 'app-collection',
    templateUrl: './collection.component.html',
    styleUrls: ['./collection.component.css']
})
export class CollectionComponent implements OnInit {

    collectionId: number;
    collection: Collection;
    isAdmin = false;
    canEdit = false;
    fabButtons = [
        {
            icon: 'add',
            label: 'Add Dashboard'
        }, {
            icon: 'collections',
            label: 'Paste Dashboard'
        }
    ];

    constructor(private route: ActivatedRoute,
                private router: Router,
                private http: HttpClient,
                public dialog: MatDialog,
                protected authService: AuthenticationService,
                private copyService: CopyService,
                private collectionService: CollectionService,
                private dashboardService: DashboardService) {
    }

    ngOnInit() {
        // only admin can add and edit
        this.isAdmin = this.authService.hasRole('Administrator');
        this.canEdit = this.isAdmin === true;

        this.route.parent.paramMap.subscribe(params => {
            this.collectionId = +params.get('collection_id');
            this.getCollection();
        });
    }

    fabClick(label) {
        if (label === 'Add Dashboard') {
            this.addDashboard();
        } else if (label === 'Paste Dashboard') {
            this.pasteDashboard();
        }
    }

    getCollection() {
        this.collectionService.getById(this.collectionId).subscribe(resp => {
            this.collection = resp;
            // check user permission
            this.isAdmin = this.isAdmin || this.collection.user_access.role === 'Administrator';
            this.canEdit = this.isAdmin || this.collection.user_access.role === 'Edit';
        });
    }

    sortedDashboards() {
        if (this.collection) {
            return this.collection.dashboards.sort((a, b) => a.index - b.index);
        }
    }

    addDashboard() {
        const dialogRef = this.dialog.open(DashboardDialogComponent, {
            width: '600px',
            data: {dashboard: {collection_id: this.collection.id, users: [], variables: []}}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.collection.dashboards.push(result);
                this.router.navigate(['dashboards', result.id]);
            }
        });
    }

    dashboardEdited(dashboard) {
        for (const ix in this.collection.dashboards) {
            if (this.collection.dashboards[ix].id === dashboard.id) {
                this.collection.dashboards[ix] = dashboard;
                break;
            }
        }
    }

    dashboardDeleted(dashboard) {
        for (const ix in this.collection.dashboards) {
            if (this.collection.dashboards[ix].id === dashboard.id) {
                this.collection.dashboards.splice(+ix, 1);
                break;
            }
        }
    }

    dashboardReordered(event) {
        const oldIndex = event.item.data.index;
        const index = event.currentIndex;
        const dashboard = event.item.data;

        let newIndex = this.collection.dashboards[index].index;
        if (newIndex === oldIndex) {
            newIndex += index > event.previousIndex ? 1 : -1;
        }

        dashboard.index = newIndex;
        this.dashboardService.reorderDashboard(dashboard).subscribe(resp => {
            this.getCollection();
        });
    }

    pasteDashboard() {
        this.copyService.pasteDashboard(this.collection.id).subscribe(resp => {
            this.collection.dashboards.push(resp);
            this.copyService.clearCopied('dashboard');
        });
    }
}
