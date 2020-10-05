import {AfterViewInit, Component, Inject, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {FileUploader} from 'ng2-file-upload';
import {Collection, ImageDimensions} from '../_models/collection';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import {User} from '../_models/user';
import {ReplaySubject, Subject} from 'rxjs';
import {UserService} from '../_services/user.service';
import {take, takeUntil} from 'rxjs/operators';
import {CollectionService} from '../_services/collection.service';
import {AuthenticationService} from '../_services/authentication.service';

const URL = 'api/files';

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
    public uploader: FileUploader = new FileUploader({
        url: URL, allowedFileType: ['image'],
        authToken: 'Bearer ' + this.authService.getToken()
    });
    hasBaseDropZoneOver = false;
    previewImage: any;
    maxDimensions = ImageDimensions;

    @ViewChild('userSelect', {static: true}) userSelect: MatSelect;

    constructor(
        public dialogRef: MatDialogRef<CollectionDialogComponent>,
        private renderer: Renderer2,
        private fb: FormBuilder,
        public authService: AuthenticationService,
        private userService: UserService,
        private collectionService: CollectionService,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    ngOnInit() {
        this.collection = this.data.collection;
        this.state = this.collection.id ? 'Edit' : 'Add';

        if (this.collection.image) {
            this.previewImage = this.collection.image;
        }

        const formData = {
            id: this.collection.id,
            title: new FormControl(this.collection.title, [Validators.required]),
            description: this.collection.description,
            users: [this.collection.users],
            image: this.collection.image
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

    // Angular2 File Upload
    fileOverBase(e: any): void {
        this.hasBaseDropZoneOver = e;
    }

    dropped(event) {
        this.showPreviewImage(event);
    }

    showPreviewImage(files) {
        if (files.length === 0) {
            return;
        }

        // get image data and format to match size constraints
        const reader = new FileReader();
        const type = files[0].type;
        reader.readAsDataURL(files[0]);
        reader.onload = (event) => {
            const img = new Image();
            img.src = reader.result.toString();
            img.onload = () => {
                const elem = document.createElement('canvas');
                elem.width = this.maxDimensions.width;
                elem.height = this.maxDimensions.height;

                let width = img.width;
                let height = img.height;
                if (width > height) {
                    width = this.maxDimensions.width * width / height;
                    height = this.maxDimensions.height;
                } else {
                    height = this.maxDimensions.height * height / width;
                    width = this.maxDimensions.width;
                }
                const widthOffset = (this.maxDimensions.width - width) / 2;
                const heightOffset = (this.maxDimensions.height - height) / 2;

                const ctx = elem.getContext('2d');
                // resize and crop image
                ctx.drawImage(img, widthOffset, heightOffset, width, height);
                this.previewImage = ctx.canvas.toDataURL(type, 1);
            };
        };
    }

    formValid() {
        return this.form.valid;
    }

    submit() {
        const form = this.form.value;
        form.image = this.previewImage;
        if (this.collection.id) {
            this.editCollection(form);
        } else {
            this.addCollection(form);
        }
    }

    addCollection(form) {
        this.collectionService.add(form).subscribe(resp => {
            this.dialogRef.close(resp);
        });
    }

    editCollection(form) {
        this.collectionService.edit(form).subscribe(resp => {
            this.dialogRef.close(resp);
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
