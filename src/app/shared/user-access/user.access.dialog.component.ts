import {AfterViewInit, Component, Inject, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSelect} from '@angular/material/select';
import {ReplaySubject, Subject} from 'rxjs';
import {take, takeUntil} from 'rxjs/operators';
import {CollectionService} from '../../_services/collection.service';
import {DashboardService} from '../../_services/dashboard.service';
import {User} from '../../_models/user';
import {UserService} from '../../_services/user.service';
import {Role} from '../../_models/role';

@Component({
    selector: 'app-dashboard-dialog',
    templateUrl: './user.access.dialog.component.html',
    styleUrls: ['./user.access.component.scss']
})
export class UserAccessDialogComponent implements OnInit, AfterViewInit, OnDestroy {

    public form: FormGroup;
    public userNameFilter: FormControl = new FormControl();
    public searching = false;
    public filteredUsers: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);
    roles = Role;
    // http service for this class context
    contextService: (CollectionService | DashboardService);
    contextId: number;

    @ViewChild('userSelect', {static: true}) userSelect: MatSelect;
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

        this.form = this.fb.group({
            user_id: new FormControl(null, [Validators.required]),
            role: new FormControl(null, [Validators.required]),
        });
        this.filteredUsers.next([]);

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

    protected setInitialValue() {
        if (this.userSelect) {
            this.filteredUsers.pipe(take(1), takeUntil(this._onDestroy)).subscribe(() => {
                this.userSelect.compareWith = (a: User, b: User) => a && b && a.id === b.id;
            });
        }
    }

    protected filterUsers(search) {
        if (!search) {
            return;
        }
        // filter the users
        this.searching = true;
        this.userService.getAll({'name': search}).subscribe(resp => {
            this.filteredUsers.next(resp);
            this.searching = false;
        });
    }
}
