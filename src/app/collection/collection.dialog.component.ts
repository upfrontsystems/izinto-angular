import {AfterViewInit, Component, Inject, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {Collection} from '../_models/collection';
import {MAT_DIALOG_DATA, MatDialogRef, MatSelect} from '@angular/material';
import {User} from '../_models/user';
import {ReplaySubject, Subject} from 'rxjs';
import {UserService} from '../_services/user.service';
import {take, takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-collection-dialog',
    templateUrl: './collection.dialog.component.html',
    styleUrls: ['./collection.component.css']
})
export class CollectionDialogComponent implements OnInit, AfterViewInit, OnDestroy {

    public form: FormGroup;
    collection: Collection;
    state: string;
    public userNameFilter: FormControl = new FormControl();
    public searching = false;
    public filteredUsers: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);
    protected _onDestroy = new Subject<void>();

    @ViewChild('userSelect') userSelect: MatSelect;

    constructor(
        public dialogRef: MatDialogRef<CollectionDialogComponent>,
        private renderer: Renderer2,
        private fb: FormBuilder,
        private userService: UserService,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    ngOnInit() {
        this.collection = this.data.collection;
        this.state = this.collection.id ? 'Edit' : 'Add';

        const formData = {
            id: this.collection.id,
            title: this.collection.title,
            description: this.collection.description,
            users: [this.collection.users]
        };
        this.form = this.fb.group(formData);
        this.filteredUsers.next(this.collection.users);

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
        this.dialogRef.close(form);
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
