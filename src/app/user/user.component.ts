import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {User} from '../_models/user';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {UserService} from '../_services/user.service';
import {UserDialogComponent} from '../user/user.dialog.component';
import {Role} from '../_models/role';
import {AuthenticationService} from '../_services/authentication.service';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, AfterViewInit {

    users: User[];
    roles: Role[];
    dataSource = new MatTableDataSource<User>(this.users);
    public form: FormGroup;
    displayedColumns: string[] = ['firstname', 'surname', 'email', 'membership_no', 'role', 'action'];
    fabButtons = [
        {
            icon: 'add',
            label: 'Add User',
        }
    ];

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(private route: ActivatedRoute,
                private userService: UserService,
                private authService: AuthenticationService,
                private fb: FormBuilder,
                public dialog: MatDialog) {
    }

    ngOnInit() {
        this.dataSource.sort = this.sort;
        this.form = this.fb.group({search: '', inactive: false});

        this.form.get('search').valueChanges.pipe(debounceTime(1000), distinctUntilChanged())
            .subscribe(value => this.getUsers({search: value, inactive: this.form.controls.inactive.value}));
        this.form.get('inactive').valueChanges
            .subscribe(value => this.getUsers({search: this.form.controls.search.value, inactive: value}));

        this.getUsers({inactive: false});
        this.getRoles();
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
    }

    getUsers(filters) {
        this.userService.getAll(filters).subscribe(
            resp => {
                this.users = resp;
                this.refresh();
            }
        );
    }

    getRoles() {
        this.authService.getAllRoles().subscribe(resp => {
            this.roles = resp;
        });
    }

    add() {
        const dialogRef = this.dialog.open(UserDialogComponent, {
            width: '550px',
            data: {roles: this.roles, user: {}}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.userService.add(result).subscribe(resp => {
                    this.users.push(resp);
                    this.refresh();
                });
            }
        });
    }

    // only load full user details when editing user
    edit(item: User) {
        this.userService.getById(item.id).subscribe(resp => {
            this.openEditDialog(resp);
        });
    }

    openEditDialog(item: User) {
        const dialogRef = this.dialog.open(UserDialogComponent, {
            width: '550px',
            data: {roles: this.roles, user: item}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.userService.edit(result).subscribe(resp => {
                    for (const ix in this.users) {
                        if (this.users[ix].id === resp.id) {
                            this.users[ix] = resp;
                            break;
                        }
                    }
                    this.refresh();
                });
            }
        });
    }

    delete(item: User) {
        this.userService.delete(item).subscribe(resp => {
            for (const ix in this.users) {
                if (this.users[ix].id === item.id) {
                    this.users.splice(+ix, 1);
                    break;
                }
            }
            this.refresh();
        });
    }

    refresh() {
        this.dataSource.data = this.dataSource.sortData(this.users, this.sort);
    }
}
