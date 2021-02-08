import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DashboardVariableComponent } from '../../dashboard/variable/variable.component';
import { Collection } from '../../_models/collection';
import { AuthenticationService } from '../../_services/authentication.service';
import { CollectionService } from '../../_services/collection.service';
import { DashboardService } from '../../_services/dashboard.service';
import { VariableService } from '../../_services/variable.service';

@Component({
    selector: 'app-collection-variable',
    templateUrl: '../../dashboard/variable/variable.component.html',
    styleUrls: ['../../dashboard/variable/variable.component.css']
})
export class CollectionVariableComponent extends DashboardVariableComponent implements OnInit {

    collection: Collection;

    constructor(protected route: ActivatedRoute,
        protected authService: AuthenticationService,
        protected collectionService: CollectionService,
        protected dashboardService: DashboardService,
        protected variableService: VariableService,
        public dialog: MatDialog) {
        super(route, authService, dashboardService, variableService, dialog);
    }

    ngOnInit(): void {
        this.isAdmin = this.authService.hasRole('Administrator');
        this.dataSource.sort = this.sort;
        this.route.parent.params.subscribe(params => {
            this.containerId = +params['collection_id'];
            this.getVariables();
            this.getCollection();
        });
    }

    getCollection() {
        this.collectionService.getById(this.containerId).subscribe(resp => {
            this.collection = resp;
            this.isAdmin = this.isAdmin || this.collection.user_access.role === 'Administrator';
        });
    }

    refresh() {
        this.dataSource.data = this.dataSource.sortData(this.variables, this.sort);
    }
}
