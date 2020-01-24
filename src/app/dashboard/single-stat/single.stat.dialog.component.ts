import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {SingleStat} from '../../_models/single.stat';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DataSource} from '../../_models/data.source';
import {SingleStatService} from '../../_services/single.stat.service';

@Component({
    selector: 'app-single-stat-dialog',
    templateUrl: './single.stat.dialog.component.html',
    styleUrls: ['./../dashboard.component.scss']
})
export class SingleStatDialogComponent implements OnInit {

    public form: FormGroup;
    singleStat: SingleStat;
    dataSources: DataSource[];
    state: string;

    constructor(
        private singleStatService: SingleStatService,
        public dialogRef: MatDialogRef<SingleStatDialogComponent>,
        private renderer: Renderer2,
        private fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    ngOnInit() {
        this.singleStat = this.data.singleStat;
        this.dataSources = this.data.dataSources;
        this.state = this.singleStat.id ? 'Edit' : 'Add';

        this.form = this.fb.group({
            id: this.singleStat.id,
            title: new FormControl(this.singleStat.title, [Validators.required]),
            query: new FormControl(this.singleStat.query, [Validators.required]),
            decimals: this.singleStat.decimals,
            format: this.singleStat.format,
            thresholds: this.singleStat.thresholds,
            colors: this.singleStat.colors,
            dashboard_id: this.singleStat.dashboard_id,
            data_source_id: new FormControl(this.singleStat.data_source_id, [Validators.required])
        });

        this.onFormChanges();
    }

    onFormChanges(): void {
    }

    formValid() {
        return this.form.valid;
    }

    // update single state before closing dialog
    submit() {
        const form = this.form.value;
        if (this.singleStat.id) {
            this.editSingleStat(form);
        } else {
            this.addSingleStat(form);
        }
    }

    addSingleStat(form) {
        this.singleStatService.add(form).subscribe(resp => {
            this.dialogRef.close(resp);
        });
    }

    editSingleStat(form) {
        this.singleStatService.edit(form).subscribe(resp => {
            this.dialogRef.close(resp);
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
