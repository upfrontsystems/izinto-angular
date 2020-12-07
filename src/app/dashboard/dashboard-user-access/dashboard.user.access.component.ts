import {Component, OnInit} from '@angular/core';
import {UserAccessComponent} from '../../shared/user-access/user.access.component';
import {DashboardService} from '../../_services/dashboard.service';
import {UserService} from '../../_services/user.service';
import {CollectionService} from '../../_services/collection.service';
import {FormBuilder} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute} from '@angular/router';
import {AuthenticationService} from '../../_services/authentication.service';

@Component({
    selector: 'app-dashboard-user-access',
    templateUrl: '../../shared/user-access/user.access.component.html'
})
export class DashboardUserAccessComponent extends UserAccessComponent implements OnInit {

    constructor(protected fb: FormBuilder,
                public dialog: MatDialog,
                protected route: ActivatedRoute,
                protected authService: AuthenticationService,
                protected collectionService: CollectionService,
                protected dashboardService: DashboardService,
                protected userService: UserService) {
        super(fb, dialog, route, authService, collectionService, dashboardService, userService);
        this.contextService = dashboardService;
    }
}
