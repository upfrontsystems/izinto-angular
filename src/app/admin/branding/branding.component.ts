import { Inject, OnDestroy, Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FileItem, FileUploader } from 'ng2-file-upload';
import { Subject } from 'rxjs';
import { CollectionDialogComponent } from '../../collection/collection.dialog.component';
import { ImageDimensions } from '../../_models/collection';
import { Branding } from '../../_models/branding';
import { AuthenticationService } from '../../_services/authentication.service';
import { BrandingService } from '../../_services/branding.service';

const URL = 'api/files';

@Component({
    selector: 'app-branding',
    templateUrl: './branding.component.html',
    styleUrls: ['./branding.component.css']
})
export class BrandingComponent implements OnInit, OnDestroy {

    branding: Branding;
    public form: FormGroup;
    public uploader: FileUploader = new FileUploader({
        url: URL, allowedFileType: ['image'],
        authToken: 'Bearer ' + this.authService.getToken()
    });
    hasBaseDropZoneOver = false;
    previews = {};
    maxDimensions = ImageDimensions;
    imageFields = ['favicon', 'logo', 'logo_mobile', 'banner'];
    imageLabels = {'favicon': 'Favicon', 'logo': 'Logo', 'logo_mobile': 'Mobile Logo', 'banner': 'Banner'}
    protected _onDestroy = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private location: Location,
        public authService: AuthenticationService,
        protected brandingService: BrandingService) {
    }

    ngOnInit() {
        // find branding linked to admin user
        this.brandingService.search({ user_id: true }).subscribe(resp => {
            this.branding = resp;
            for (const field of this.imageFields) {
                this.previews[field] = 'data:image/png;base64,' + this.branding[field];
            }
            const formData = {
                id: this.branding.id,
                hostname: [this.branding.hostname, Validators.required],
                favicon: this.branding.favicon,
                logo: this.branding.logo,
                logo_mobile: this.branding.logo_mobile,
                banner: this.branding.banner
            };
            this.form = this.fb.group(formData);
        })
    }

    ngOnDestroy() {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    // Angular2 File Upload
    fileOverBase(e: any): void {
        this.hasBaseDropZoneOver = e;
    }

    dropped(event, field) {
        this.imageSelected(event, field);
    }

    imageSelected(files, field) {
        if (files.length === 0) {
            return;
        }
        // rename file
        const oldFileItem = files[0];
        const fileExtension = oldFileItem.name.split('?')[0].split('.').pop();
        const newFile: File = new File([files[0]], field + '.' + fileExtension, { type: oldFileItem.type });
        this.form.controls[field].setValue(newFile);
        const reader = new FileReader();
        reader.readAsDataURL(files[0]);
        reader.onload = (event) => {
            this.previews[field] = reader.result.toString();
        };
    }

    updateBranding() {
        const formData = new FormData();
        formData.append('id', this.form.get('id').value);
        formData.append('hostname', this.form.get('hostname').value);
        for (const field of this.imageFields) {
            if (this.form.get(field).value !== this.branding[field]) {
                formData.append(field, this.form.get(field).value);
            }
        }

        if (!this.branding.id) {
            this.brandingService.add(formData).subscribe(resp => {
                this.location.back();
            });
        } else {
            this.brandingService.edit(this.branding.id, formData).subscribe(resp => {
                this.location.back();
            });
        }
    }

    cancel(): void {
        this.location.back();
    }
}
