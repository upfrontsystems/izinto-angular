import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Collection} from '../_models/collection';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-collection-dialog',
  templateUrl: './collection.dialog.component.html',
  styleUrls: ['./collection.component.css']
})
export class CollectionDialogComponent implements OnInit {

    public form: FormGroup;
    collection: Collection;
    state: string;

    constructor(
        public dialogRef: MatDialogRef<CollectionDialogComponent>,
        private renderer: Renderer2,
        private fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    ngOnInit() {
        this.collection = this.data.collection;
        this.state = this.collection.id ? 'Edit' : 'Add';

        const formData = {
            id: this.collection.id,
            title: this.collection.title,
            description: this.collection.description,
        };
        this.form = this.fb.group(formData);

        this.onFormChanges();
    }

    onFormChanges(): void {
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
