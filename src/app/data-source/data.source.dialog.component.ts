import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {DataSource} from '../_models/data.source';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {DataSourceService} from '../_services/data.source.service';

@Component({
  selector: 'app-data-source-dialog',
  templateUrl: './data.source.dialog.component.html',
  styleUrls: ['./data.source.component.css']
})
export class DataSourceDialogComponent implements OnInit {
    public form: FormGroup;
    state: string;
    dataSourceTypes = ['InfluxDB'];

    constructor(
        public dialogRef: MatDialogRef<DataSourceDialogComponent>,
        private renderer: Renderer2,
        private fb: FormBuilder,
        private dataSourceService: DataSourceService,
        @Inject(MAT_DIALOG_DATA) public dataSource: DataSource) {
    }

    ngOnInit() {
        this.state = this.dataSource.id ? 'Edit' : 'Add';

        this.form = this.fb.group({
            id: this.dataSource.id,
            name: this.dataSource.name,
            type: this.dataSource.type,
            url: this.dataSource.url,
            username: this.dataSource.username,
            password: this.dataSource.password,
            database: this.dataSource.database
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
        if (this.dataSource.id) {
            this.edit(form);
        } else {
            this.add(form);
        }
    }

    add(form) {
        this.dataSourceService.add(form).subscribe(resp => {
            this.dialogRef.close(resp);
        });
    }

    edit(form) {
        this.dataSourceService.edit(form).subscribe(resp => {
            this.dialogRef.close(resp);
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
