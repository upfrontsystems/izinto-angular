import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {QueryService} from '../../_services/query.service';
import {Query} from '../../_models/query';
import {DataSource} from '../../_models/data.source';

@Component({
  selector: 'app-query-dialog',
  templateUrl: './query.dialog.component.html',
  styleUrls: ['./query.component.css']
})
export class QueryDialogComponent implements OnInit {
    public form: FormGroup;
    state: string;
    query: Query;
    dataSources: DataSource[] = [];
    testResults: any;

    constructor(
        public dialogRef: MatDialogRef<QueryDialogComponent>,
        private renderer: Renderer2,
        private fb: FormBuilder,
        private queryService: QueryService,
        @Inject(MAT_DIALOG_DATA) public data) {
    }

    ngOnInit() {
        this.query = this.data.query;
        this.dataSources = this.data.dataSources;
        this.state = this.query.id ? 'Edit' : 'Add';

        this.form = this.fb.group({
            id: this.query.id,
            name: [this.query.name, [Validators.required, Validators.pattern(/^[\w]+$/)] ],
            query: this.query.query,
            dashboard_id: this.query.dashboard_id,
            data_source_id: [this.query.data_source_id, Validators.required],
            test_data: ''
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
        this.queryService.add(this.query.dashboard_id, form).subscribe(resp => {
            this.dialogRef.close(resp);
        });
    }

    edit(form) {
        this.queryService.edit(this.query.dashboard_id, form).subscribe(resp => {
            this.dialogRef.close(resp);
        });
    }

    testQuery() {
        const form = this.form.value;
        this.queryService.testQuery(this.query.dashboard_id, form, form.test_data).subscribe(resp => {
            if (typeof resp === 'string') {
                this.testResults = JSON.stringify(JSON.parse(resp.toString()), null, 2);
            } else {
                this.testResults = JSON.stringify(resp, null, 2);
            }
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
