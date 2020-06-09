import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Variable} from '../../_models/variable';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-variable-dialog',
  templateUrl: './variable.dialog.component.html',
  styleUrls: ['./../dashboard.component.scss']
})
export class VariableDialogComponent implements OnInit {

    public form: FormGroup;
    variable: Variable;
    state: string;

    constructor(
        public dialogRef: MatDialogRef<VariableDialogComponent>,
        private renderer: Renderer2,
        private fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    ngOnInit() {
        this.variable = this.data.variable;
        this.state = this.variable.id ? 'Edit' : 'Add';

        const formData = {
            id: this.variable.id,
            name: this.variable.name,
            value: this.variable.value,
            dashboard_id: this.variable.dashboard_id
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
