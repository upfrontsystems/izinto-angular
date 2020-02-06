import {AfterViewInit, Component, Inject, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef, MatSelect} from '@angular/material';
import {Dashboard} from '../_models/dashboard';
import {User} from '../_models/user';
import {ReplaySubject, Subject} from 'rxjs';
import {take, takeUntil} from 'rxjs/operators';
import {UserService} from '../_services/user.service';
import {DashboardService} from '../_services/dashboard.service';
import {AuthenticationService} from '../_services/authentication.service';

@Component({
    selector: 'app-dashboard-dialog',
    templateUrl: './dashboard.dialog.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardDialogComponent implements OnInit, AfterViewInit, OnDestroy {

    public form: FormGroup;
    dashboard: Dashboard;
    state: string;
    public userNameFilter: FormControl = new FormControl();
    public searching = false;
    public filteredUsers: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);
    protected _onDestroy = new Subject<void>();

    @ViewChild('userSelect') userSelect: MatSelect;

    constructor(
        public dialogRef: MatDialogRef<DashboardDialogComponent>,
        private renderer: Renderer2,
        private fb: FormBuilder,
        public authService: AuthenticationService,
        private userService: UserService,
        private dashboardService: DashboardService,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    ngOnInit() {
        this.dashboard = this.data.dashboard;
        this.state = this.dashboard.id ? 'Edit' : 'Add';

        const formData = {
            id: this.dashboard.id,
            title: new FormControl(this.dashboard.title, [Validators.required]),
            description: this.dashboard.description,
            collection_id: this.dashboard.collection_id,
            users: [this.dashboard.users],
            variables: [this.dashboard.variables]
        };
        this.form = this.fb.group(formData);
        this.filteredUsers.next(this.dashboard.users);

        this.onFormChanges();
    }

    ngAfterViewInit() {
        this.setInitialValue();
    }

    ngOnDestroy() {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    onFormChanges(): void {
        this.userNameFilter.valueChanges.subscribe(value => this.filterUsers(value));
    }

    protected setInitialValue() {
        if (this.userSelect) {
            this.filteredUsers.pipe(take(1), takeUntil(this._onDestroy)).subscribe(() => {
                this.userSelect.compareWith = (a: User, b: User) => a && b && a.id === b.id;
            });
        }
    }

    protected filterUsers(search) {
        if (!search) {
            this.filteredUsers.next(this.form.controls.users.value);
            return;
        }
        // filter the users
        this.searching = true;
        this.userService.getAll({'name': search}).subscribe(resp => {
            this.filteredUsers.next(resp);
            this.searching = false;
        });
    }

    formValid() {
        return this.form.valid;
    }

    submit() {
        const form = this.form.value;
        form.variables = this.dashboard.variables;
        if (this.dashboard.id) {
            this.editDashboard(form);
        } else {
            this.addDashboard(form);
        }
    }

    addDashboard(form) {
        this.dashboardService.add(form).subscribe(resp => {
            this.dialogRef.close(resp);
        });
    }

    editDashboard(form) {
        this.dashboardService.edit(form).subscribe(resp => {
            this.dialogRef.close(resp);
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
