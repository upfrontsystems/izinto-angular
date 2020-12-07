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

@Component({
    selector: 'app-user-access',
    templateUrl: './user.access.component.html',
    styleUrls: ['./user.access.component.css']
})
export class UserAccessComponent implements OnInit, AfterViewInit {

    users: User[];
    usersAccess = {};
    roles: Role[];
    // http service for this class context
    contextService: (CollectionService | DashboardService);
    contextId: number;
    dataSource = new MatTableDataSource<User>(this.users);
    public form: FormGroup;
    displayedColumns: string[] = ['name', 'role'];
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

        this.getUsers({inactive: false});
        this.getUserAccess();
        this.getRoles();
        this.dataSource.sort = this.sort;
        this.form = this.fb.group({search: '', inactive: false});

        this.form.get('search').valueChanges.pipe(debounceTime(1000), distinctUntilChanged())
            .subscribe(value => this.getUsers({search: value, inactive: this.form.controls.inactive.value}));
        this.form.get('inactive').valueChanges
            .subscribe(value => this.getUsers({search: this.form.controls.search.value, inactive: value}));
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
    }

    getRoles() {
        this.authService.getAllRoles().subscribe(resp => {
            this.roles = resp;
        });
    }

    getUsers(filters) {
        this.userService.getAll(filters).subscribe(resp => {
            this.users = resp;
            this.refresh();
        });
    }

    getUserAccess() {
        this.contextService.getUserAccess(this.contextId).subscribe(resp => {
            // map user roles to dictionary
            this.usersAccess = Object.assign({}, ...resp.map((x) => ({[x.user_id]: x})));
        });
    }

    updateUserAccess(role, user) {
        this.contextService.updateUserAccess(user.id, this.contextId, role);
    }

    refresh() {
        this.dataSource.data = this.dataSource.sortData(this.users, this.sort);
    }
}
