import {Component, Inject, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ReplaySubject, Subject} from 'rxjs';
import {CollectionService} from '../../_services/collection.service';
import {DashboardService} from '../../_services/dashboard.service';
import {User} from '../../_models/user';
import {UserService} from '../../_services/user.service';
import {UserAccessRole} from '../../_models/role';

@Component({
    selector: 'app-dashboard-dialog',
    templateUrl: './user.access.dialog.component.html',
    styleUrls: ['./user.access.component.scss']
})
export class UserAccessDialogComponent implements OnInit, OnDestroy {

    public form: FormGroup;
    public userNameFilter: FormControl = new FormControl();
    public filteredUsers: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);
    roles = UserAccessRole;
    // http service for this class context
    contextService: (CollectionService | DashboardService);
    contextId: number;
    usersAccess: any[];

    // @ViewChild('userSelect', {static: true}) userSelect: MatSelect;
    protected _onDestroy = new Subject<void>();

    constructor(
        public dialogRef: MatDialogRef<UserAccessDialogComponent>,
        private renderer: Renderer2,
        private fb: FormBuilder,
        private userService: UserService,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    ngOnInit() {
        this.contextService = this.data.context_service;
        this.contextId = this.data.context_id;
        this.usersAccess = this.data.users_access;

        this.form = this.fb.group({
            user_id: new FormControl(null, [Validators.required]),
            role: new FormControl(null, [Validators.required]),
        });
        this.filteredUsers.next([]);

        this.onFormChanges();
    }

    ngOnDestroy() {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    onFormChanges(): void {
        this.userNameFilter.valueChanges.subscribe(value => this.filterUsers(value));
    }

    formValid() {
        return this.form.valid;
    }

    submit() {
        const form = this.form.value;
        this.addUserAccess(form);
    }

    addUserAccess(form) {
        this.contextService.addUserAccess(this.contextId, form).subscribe(resp => {
            this.dialogRef.close(resp);
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    optionSelected(event) {
        const user = event.option.value;
        this.form.controls['user_id'].setValue(user.id);
        this.userNameFilter.setValue(user.fullname, {emitEvent: false});
    }

    protected filterUsers(search) {
        if (!search) {
            return;
        } else if (search.id) {
            return;
        }
        // filter the users
        this.userService.getAll({'name': search}).subscribe(resp => {
            this.filteredUsers.next(resp);
        });
    }

    // return if user already has access
    disabledOption(user) {
        for (const access of this.usersAccess) {
            if (access.user_id === user.id) {
                return true;
            }
        }
    }
}
