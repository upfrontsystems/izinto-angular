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
            this.collectionId = +params.get('id');
            this.getCollection();
        });
    }

    getCollection() {
        this.collectionService.getById(this.collectionId).subscribe(resp => {
            this.collection = resp;
        });
    }

    addDashboard() {
        const dialogRef = this.dialog.open(DashboardDialogComponent, {
            width: '600px',
            data: {dashboard: {collection_id: this.collection.id}}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.dashboardService.add(result).subscribe(resp => {
                    this.collection.dashboards.push(resp);
                });
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
}
