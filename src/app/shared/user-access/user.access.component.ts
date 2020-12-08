import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {DashboardService} from '../../_services/dashboard.service';
import {CollectionService} from '../../_services/collection.service';
import {UserService} from '../../_services/user.service';
import {User} from '../../_models/user';
import {Role} from '../../_models/role';
import {AuthenticationService} from '../../_services/authentication.service';
import {UserAccessDialogComponent} from './user.access.dialog.component';

@Component({
    selector: 'app-user-access',
    templateUrl: './user.access.component.html',
    styleUrls: ['./user.access.component.css']
})
export class UserAccessComponent implements OnInit, AfterViewInit {

    users: User[];
    usersAccess = [];
    roles = Role;
    // http service for this class context
    contextService: (CollectionService | DashboardService);
    contextId: number;
    dataSource = new MatTableDataSource<User>(this.users);
    public form: FormGroup;
    displayedColumns: string[] = ['name', 'role', 'action'];
    fabButtons = [
        {
            icon: 'add',
            label: 'Add User',
        }
    ];

    @ViewChild(MatSort, {static: true}) sort: MatSort;
    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

    constructor(protected fb: FormBuilder,
                public dialog: MatDialog,
                protected route: ActivatedRoute,
                protected authService: AuthenticationService,
                protected collectionService: CollectionService,
                protected dashboardService: DashboardService,
                protected userService: UserService) {
    }

    ngOnInit() {
        this.route.parent.paramMap.subscribe(params => {
            this.contextId = +params.get('dashboard_id');
        });

        this.getUserAccess();
        this.dataSource.sort = this.sort;
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
    }

    fabClick(label) {
        // add user access role
        const dialogRef = this.dialog.open(UserAccessDialogComponent, {
            width: '600px',
            data: {context_id: this.contextId, context_service: this.contextService}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.usersAccess.push(result);
                this.refresh();
            }
        });
    }

    getUserAccess() {
        this.contextService.getUserAccess(this.contextId).subscribe(resp => {
            this.usersAccess = resp;
            this.refresh();
        });
    }

    update(role, user_access) {
        this.contextService.updateUserAccess(this.contextId, user_access.user_id, role);
    }

    delete(user_access) {
        this.contextService.deleteUserAccess(this.contextId, user_access.user_id);
    }

    refresh() {
        this.dataSource.data = this.dataSource.sortData(this.usersAccess, this.sort);
    }
}
