import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {VariableService} from '../../_services/variable.service';
import {Variable} from '../../_models/variable';

@Component({
    selector: 'app-variable-dialog',
    templateUrl: './variable-dialog.component.html',
    styleUrls: ['./variable.component.css']
})
export class VariableDialogComponent implements OnInit {
    public form: FormGroup;
    state: string;

    constructor(
        public dialogRef: MatDialogRef<VariableDialogComponent>,
        private renderer: Renderer2,
        private fb: FormBuilder,
        private variableService: VariableService,
        @Inject(MAT_DIALOG_DATA) public variable: Variable) {
    }

    ngOnInit() {
        this.state = this.variable.id ? 'Edit' : 'Add';

        this.form = this.fb.group({
            id: this.variable.id,
            name: [this.variable.name, Validators.required],
            value: [this.variable.value, Validators.required],
            dashboard_id: this.variable.dashboard_id
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
        if (this.variable.id) {
            this.edit(form);
        } else {
            this.add(form);
        }
    }

    add(form) {
        this.variableService.add(this.variable.dashboard_id, form).subscribe(resp => {
            this.dialogRef.close(resp);
        });
    }

    edit(form) {
        this.variableService.edit(this.variable.dashboard_id, form).subscribe(resp => {
            this.dialogRef.close(resp);
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
