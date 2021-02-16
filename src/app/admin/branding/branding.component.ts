import { Inject, OnDestroy, Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import { FormGroup, FormBuilder } from '@angular/forms';
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
        this.brandingService.getById(1).subscribe(resp => {
            this.branding = resp;
            const formData = {
                hostname: this.branding.hostname,
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

        // get image data and format to match size constraints
        const reader = new FileReader();
        const type = files[0].type;
        reader.readAsDataURL(files[0]);
        reader.onload = () => {
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
                this.form.controls[field].setValue(ctx.canvas.toDataURL(type, 1));
            };
        };
    }

    updateBranding() {
        this.brandingService.edit(this.form.value).subscribe(resp => {
            this.location.back();
        });
    }

    cancel(): void {
        this.location.back();
    }
}
