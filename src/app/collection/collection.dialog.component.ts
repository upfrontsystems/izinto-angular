import {Component, Inject, OnInit, Renderer2, ViewChild} from '@angular/core';
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
export class CollectionDialogComponent implements OnInit {

    protected users: User[] = [];
    public userCtrl: FormControl = new FormControl();
    public filteredUsers: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);

    @ViewChild('userSelect') multiSelect: MatSelect;
    protected _onDestroy = new Subject<void>();

    public form: FormGroup;
    collection: Collection;
    state: string;

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
            usersFilter: ''
        };
        this.form = this.fb.group(formData);

        this.userCtrl.setValue(this.collection.users);
        this.filteredUsers.next(this.collection.users.slice());

        this.onFormChanges();
    }

    onFormChanges(): void {
        this.form.controls.usersFilter.valueChanges
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
        let search = this.form.controls.usersFilter.value;
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
