import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {QueryService} from '../_services/query.service';
import {Query} from '../_models/query';
import {DataSource} from '../_models/data.source';

@Component({
  selector: 'app-query-dialog',
  templateUrl: './query.dialog.component.html',
  styleUrls: ['./query.component.css']
})
export class QueryDialogComponent implements OnInit {
    public form: FormGroup;
    state: string;
    dataSources: DataSource[] = [];

    constructor(
        public dialogRef: MatDialogRef<QueryDialogComponent>,
        private renderer: Renderer2,
        private fb: FormBuilder,
        private queryService: QueryService,
        @Inject(MAT_DIALOG_DATA) public query: Query) {
    }

    ngOnInit() {
        this.state = this.query.id ? 'Edit' : 'Add';

        this.form = this.fb.group({
            id: this.query.id,
            name: this.query.name,
            query: this.query.query,
            user_id: this.query.user_id,
            data_source_id: this.query.data_source_id
        });

        this.onFormChanges();
    }

    onFormChanges(): void {
    }

    formValid() {
        return this.form.valid;
    }

    submit() {
        const form = this.form.value;
        if (this.query.id) {
            this.edit(form);
        } else {
            this.add(form);
        }
    }

    add(form) {
        this.queryService.add(form).subscribe(resp => {
            this.dialogRef.close(resp);
        });
    }

    edit(form) {
        this.queryService.edit(form).subscribe(resp => {
            this.dialogRef.close(resp);
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
