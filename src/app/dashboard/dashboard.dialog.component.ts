import {Component, Inject, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSelect} from '@angular/material/select';
import {FileUploader} from 'ng2-file-upload';
import {Dashboard} from '../_models/dashboard';
import {Subject} from 'rxjs';
import {UserService} from '../_services/user.service';
import {DashboardService} from '../_services/dashboard.service';
import {AuthenticationService} from '../_services/authentication.service';
import {ImageDimensions} from '../_models/collection';

const URL = 'api/files';

@Component({
    selector: 'app-dashboard-dialog',
    templateUrl: './dashboard.dialog.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardDialogComponent implements OnInit, OnDestroy {

    public form: FormGroup;
    dashboard: Dashboard;
    state: string;
    public uploader: FileUploader = new FileUploader({
        url: URL, allowedFileType: ['image'],
        authToken: 'Bearer ' + this.authService.getToken()
    });
    hasBaseDropZoneOver = false;
    previewImage: any;
    maxDimensions = ImageDimensions;
    @ViewChild('userSelect', {static: true}) userSelect: MatSelect;
    protected _onDestroy = new Subject<void>();

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

        if (this.dashboard.image) {
            this.previewImage = this.dashboard.image;
        }

        const formData = {
            id: this.dashboard.id,
            title: new FormControl(this.dashboard.title, [Validators.required]),
            description: this.dashboard.description,
            collection_id: this.dashboard.collection_id,
            type: this.dashboard.type,
            content: this.dashboard.content,
            date_hidden: this.dashboard.date_hidden,
            image: this.dashboard.image
        };
        this.form = this.fb.group(formData);
    }

    ngOnDestroy() {
        this._onDestroy.next();
        this._onDestroy.complete();
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
                const ctx = elem.getContext('2d');
                // resize and crop image
                ctx.drawImage(img, 0, 0, this.maxDimensions.width, this.maxDimensions.height);
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
