import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Chart, ChartGroupBy, ChartTypes} from '../../_models/chart';

@Component({
    selector: 'app-chart-dialog',
    templateUrl: './chart.dialog.component.html',
    styleUrls: ['./chart.component.css']
})
export class ChartDialogComponent implements OnInit {

    public form: FormGroup;
    chart: Chart;
    chartTypes = ChartTypes;
    groupBy = ChartGroupBy;
    state: string;

    constructor(
        public dialogRef: MatDialogRef<ChartDialogComponent>,
        private renderer: Renderer2,
        private fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    ngOnInit() {
        this.chart = this.data.chart;
        this.state = this.chart.id ? 'Edit' : 'Add';

        const formData = {
            id: this.chart.id,
            dashboard_id: this.chart.dashboard_id,
            title: this.chart.title,
            index: this.chart.index,
            selector: this.chart.selector,
            unit: this.chart.unit,
            color: this.chart.color,
            type: this.chart.type,
            group_by: this.chart.group_by,
            query: this.chart.query
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
