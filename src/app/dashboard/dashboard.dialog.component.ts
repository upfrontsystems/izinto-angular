import {Component, Inject, OnInit, Renderer2, ViewChild} from '@angular/core';
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
export class DashboardDialogComponent implements OnInit {

    protected users: User[] = [];
    public userCtrl: FormControl = new FormControl();
    public usersFilterCtrl: FormControl = new FormControl();
    public filteredUsers: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);

    @ViewChild('userSelect') multiSelect: MatSelect;
    protected _onDestroy = new Subject<void>();

    public form: FormGroup;
    dashboard: Dashboard;
    state: string;

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
            collection_id: this.dashboard.collection_id
        };
        this.form = this.fb.group(formData);

        this.userCtrl.setValue(this.dashboard.users);
        this.filteredUsers.next(this.dashboard.users.slice());

        this.onFormChanges();
    }

    onFormChanges(): void {
        this.usersFilterCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterUsers();
            });
    }

    protected setInitialValue() {
        this.filteredUsers.pipe(take(1), takeUntil(this._onDestroy))
            .subscribe(() => {
                this.multiSelect.compareWith = (a: User, b: User) => a && b && a.id === b.id;
            });
    }

    protected filterUsers() {
        if (!this.users) {
            return;
        }
        // get the search keyword
        let search = this.usersFilterCtrl.value;
        if (!search) {
            this.filteredUsers.next(this.users.slice());
            return;
        } else {
            search = search.toLowerCase();
        }
        // filter the users
        this.userService.getAll({'fullname': search}).subscribe(resp => {
            this.filteredUsers.next(resp);
        });
    }

    addVariable() {
        const variable = {id: undefined, name: '', value: '', dashboard_id: this.dashboard.id};
        this.dashboard.variables.push(variable);
    }

    variableAdded(variable) {
        for (const ix in this.dashboard.variables) {
            if (this.dashboard.variables[ix].id === undefined) {
                this.dashboard.variables[ix] = variable;
                break;
            }
        }
    }

    variableEdited(variable) {
        for (const ix in this.dashboard.variables) {
            if (this.dashboard.variables[ix].id === variable.id) {
                this.dashboard.variables[ix] = variable;
                break;
            }
        }
    }

    variableDeleted(variable) {
        for (const ix in this.dashboard.variables) {
            if (this.dashboard.variables[ix].id === variable.id) {
                this.dashboard.variables.splice(+ix, 1);
                break;
            }
        }
    }

    formValid() {
        return this.form.valid;
    }

    submit() {
        const form = this.form.value;
        this.dialogRef.close(form);
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
