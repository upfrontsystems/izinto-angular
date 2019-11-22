import {AfterViewInit, Component, Inject, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef, MatSelect} from '@angular/material';
import {Dashboard} from '../_models/dashboard';
import {User} from '../_models/user';
import {ReplaySubject, Subject} from 'rxjs';
import {take, takeUntil} from 'rxjs/operators';
import {UserService} from '../_services/user.service';

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
        private userService: UserService,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    ngOnInit() {
        this.dashboard = this.data.dashboard;
        this.state = this.dashboard.id ? 'Edit' : 'Add';

        const formData = {
            id: this.dashboard.id,
            title: this.dashboard.title,
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
        this.filteredUsers.pipe(take(1), takeUntil(this._onDestroy)).subscribe(() => {
            this.userSelect.compareWith = (a: User, b: User) => a && b && a.id === b.id;
        });
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
        this.dialogRef.close(form);
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
