import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Chart, ChartGroupBy, ChartTypes} from '../../_models/chart';
import {DataSource} from '../../_models/data.source';
import {ChartService} from '../../_services/chart.service';

@Component({
    selector: 'app-chart-dialog',
    templateUrl: './chart.dialog.component.html',
    styleUrls: ['./../dashboard.component.scss']
})
export class ChartDialogComponent implements OnInit {

    public form: FormGroup;
    chart: Chart;
    chartTypes = ChartTypes;
    groupBy = ChartGroupBy;
    dataSources: DataSource[];
    state: string;

    constructor(
        private chartService: ChartService,
        public dialogRef: MatDialogRef<ChartDialogComponent>,
        private renderer: Renderer2,
        private fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    ngOnInit() {
        this.chart = this.data.chart;
        this.dataSources = this.data.dataSources;
        this.state = this.chart.id ? 'Edit' : 'Add';

        const formData = {
            id: this.chart.id,
            dashboard_id: this.chart.dashboard_id,
            title: new FormControl(this.chart.title, [Validators.required]),
            index: this.chart.index,
            unit: this.chart.unit,
            color: this.chart.color,
            decimals: (this.chart.decimals || 2),
            type: this.chart.type,
            group_by: this.chart.group_by,
            query: this.chart.query,
            data_source_id: new FormControl(this.chart.data_source_id, [Validators.required])
        };
        this.form = this.fb.group(formData);

        this.onFormChanges();
    }

    onFormChanges(): void {
    }

    updateColors(event) {
        let value = this.form.controls.color.value;
        if (value) {
            value += (', ' + event.color.hex);
        } else {
            value = event.color.hex;
        }
        this.form.controls.color.setValue(value);
    }

    formValid() {
        return this.form.valid;
    }

    submit() {
        const form = this.form.value;
        if (this.chart.id) {
            this.editChart(form);
        } else {
            this.addChart(form);
        }
    }

    addChart(form) {
        this.chartService.add(form).subscribe(resp => {
            this.dialogRef.close(resp);
        });
    }

    editChart(form) {
        this.chartService.edit(form).subscribe(resp => {
            this.dialogRef.close(resp);
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
