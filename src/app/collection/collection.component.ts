import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material';
import {Collection} from '../_models/collection';
import {CollectionService} from '../_services/collection.service';
import {DashboardDialogComponent} from '../dashboard/dashboard.dialog.component';
import {DashboardService} from '../_services/dashboard.service';

@Component({
    selector: 'app-collection',
    templateUrl: './collection.component.html',
    styleUrls: ['./collection.component.css']
})
export class CollectionComponent implements OnInit {

    collectionId: number;
    collection: Collection;
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
                private http: HttpClient,
                public dialog: MatDialog,
                private collectionService: CollectionService,
                private dashboardService: DashboardService) {
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
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
        });
    }

    addDashboard() {
        const dialogRef = this.dialog.open(DashboardDialogComponent, {
            width: '600px',
            data: {dashboard: {collection_id: this.collection.id, users: []}}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.collection.dashboards.push(result);
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
        const oldOrder = event.item.data.order;
        const index = event.currentIndex;
        const dashboard = event.item.data;

        let newOrder = this.collection.dashboards[index].order;
        if (newOrder === oldOrder) {
            newOrder += index > event.previousIndex ? 1 : -1;
        }

        dashboard.order = newOrder;
        this.dashboardService.reorderDashboard(dashboard).subscribe(resp => {
            this.getCollection();
        });
    }

    pasteDashboard() {
        this.dashboardService.paste(this.collection.id).subscribe(resp => {
            this.collection.dashboards.push(resp);
            this.dashboardService.clearCopied();
        });
    }
}
