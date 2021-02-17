import { Inject, OnDestroy, Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FileUploader } from 'ng2-file-upload';
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
    previewImage: any;
    maxDimensions = ImageDimensions;
    protected _onDestroy = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private location: Location,
        public authService: AuthenticationService,
        protected brandingService: BrandingService) {
    }

    ngOnInit() {
        // find branding linked to admin user
        this.brandingService.search({user_id: true}).subscribe(resp => {
            this.branding = resp;
            const formData = {
                id: this.branding.id,
                hostname: [this.branding.hostname, Validators.required],
                favicon: this.branding.favicon,
                logo: this.branding.logo,
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
        this.form.controls[field].setValue(files[0]);
    }

    updateBranding() {
        const formData = new FormData();
        formData.append('id', this.form.get('id').value);
        formData.append('hostname', this.form.get('hostname').value);
        formData.append('favicon', this.form.get('favicon').value);
        formData.append('logo', this.form.get('logo').value);
        formData.append('banner', this.form.get('banner').value);

        this.brandingService.edit(formData).subscribe(resp => {
            this.location.back();
        });
    }

    cancel(): void {
        this.location.back();
    }
}
