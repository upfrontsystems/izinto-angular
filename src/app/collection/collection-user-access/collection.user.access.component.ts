import {Component} from '@angular/core';
import {UserAccessComponent} from '../../shared/user-access/user.access.component';
import {CollectionService} from '../../_services/collection.service';
import {DashboardService} from '../../_services/dashboard.service';
import {FormBuilder} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute} from '@angular/router';
import {AuthenticationService} from '../../_services/authentication.service';

@Component({
    selector: 'app-collection-user-access',
    templateUrl: '../../shared/user-access/user.access.component.html'
})
export class CollectionUserAccessComponent extends UserAccessComponent {

    constructor(protected fb: FormBuilder,
                public dialog: MatDialog,
                protected route: ActivatedRoute,
                protected authService: AuthenticationService,
                protected collectionService: CollectionService,
                protected dashboardService: DashboardService) {
        super(fb, dialog, route, authService, collectionService, dashboardService);
        this.contextService = collectionService;
        this.contextKey = 'collection_id';
    }
}
