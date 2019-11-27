import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SingleStat} from '../../_models/single.stat';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
    selector: 'app-single-stat-dialog',
    templateUrl: './single.stat.dialog.component.html',
    styleUrls: ['./../dashboard.component.scss']
})
export class SingleStatDialogComponent implements OnInit {

    public form: FormGroup;
    singleStat: SingleStat;
    state: string;

    constructor(
        public dialogRef: MatDialogRef<SingleStatDialogComponent>,
        private renderer: Renderer2,
        private fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    ngOnInit() {
        this.singleStat = this.data.singleStat;
        this.state = this.singleStat.id ? 'Edit' : 'Add';

        this.form = this.fb.group({
            id: this.singleStat.id,
            title: this.singleStat.title,
            query: this.singleStat.query,
            decimals: this.singleStat.decimals,
            thresholds: this.singleStat.thresholds,
            colors: this.singleStat.colors,
            dashboard_id: this.singleStat.dashboard_id,
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
        this.dialogRef.close(form);
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
