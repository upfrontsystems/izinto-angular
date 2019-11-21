﻿import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../_services/authentication.service';
import {CollectionService} from '../_services/collection.service';
import {DashboardService} from '../_services/dashboard.service';
import {Collection} from '../_models/collection';
import {Dashboard} from '../_models/dashboard';
import {DashboardDialogComponent} from '../dashboard/dashboard.dialog.component';
import {CollectionDialogComponent} from '../collection/collection.dialog.component';
import {MatDialog} from '@angular/material';

@Component({templateUrl: 'home.component.html'})
export class HomeComponent implements OnInit {

    collections: Collection[];
    dashboards: Dashboard[];
    fabButtons = [
        {
            icon: 'add',
            label: 'Add Dashboard'
        },
        {
            icon: 'add',
            label: 'Add Collection',
        }
    ];

    constructor(
        private authenticationService: AuthenticationService,
        private collectionService: CollectionService,
        private dashboardService: DashboardService,
        public dialog: MatDialog) {
    }

    ngOnInit() {
        this.getCollections();
        this.getDashboards();
    }

    getDashboards() {
        // list all dashboards of this user
        this.dashboardService.getDashboards({user_id: true}).subscribe(resp => {
            this.dashboards = resp;
        });
    }

    getCollections() {
        // list all collections of this user
        this.collectionService.getCollections({user_id: true}).subscribe(resp => {
            this.collections = resp;
        });
    }

    fabClick(label) {
        if (label === 'Add Dashboard') {
            this.addDashboard();
        } else if (label === 'Add Collection') {
            this.addCollection();
        }
    }


    addCollection() {
        const dialogRef = this.dialog.open(CollectionDialogComponent, {
            width: '600px',
            data: {collection: {users: []}}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.collectionService.add(result).subscribe(resp => {
                    this.collections.push(resp);
                });
            }
        });
    }

    collectionEdited(collection) {
        for (const ix in this.collections) {
            if (this.collections[ix].id === collection.id) {
                this.collections[ix] = collection;
                break;
            }
        }
    }

    collectionDeleted(collection) {
        for (const ix in this.collections) {
            if (this.collections[ix].id === collection.id) {
                this.collections.splice(+ix, 1);
                break;
            }
        }
    }

    addDashboard() {
        const dialogRef = this.dialog.open(DashboardDialogComponent, {
            width: '600px',
            data: {dashboard: {users: []}}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.dashboardService.add(result).subscribe(resp => {
                    this.dashboards.push(resp);
                });
            }
        });
    }

    dashboardEdited(dashboard) {
        for (const ix in this.dashboards) {
            if (this.dashboards[ix].id === dashboard.id) {
                this.dashboards[ix] = dashboard;
                break;
            }
        }
    }

    dashboardDeleted(dashboard) {
        for (const ix in this.dashboards) {
            if (this.dashboards[ix].id === dashboard.id) {
                this.dashboards.splice(+ix, 1);
                break;
            }
        }
    }
}
