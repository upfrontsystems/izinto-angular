import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Script} from '../../_models/script';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ScriptService} from '../../_services/script.service';

@Component({
    selector: 'app-script-dialog',
    templateUrl: './script.dialog.component.html',
    styleUrls: ['./../dashboard.component.scss']
})
export class ScriptDialogComponent implements OnInit {

    public form: FormGroup;
    script: Script;
    state: string;

    constructor(
        private scriptService: ScriptService,
        public dialogRef: MatDialogRef<ScriptDialogComponent>,
        private renderer: Renderer2,
        private fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    ngOnInit() {
        this.script = this.data.script;
        this.state = this.script.id ? 'Edit' : 'Add';

        this.form = this.fb.group({
            id: this.script.id,
            title: new FormControl(this.script.title, [Validators.required]),
            content: new FormControl(this.script.content, [Validators.required]),
            dashboard_id: this.script.dashboard_id,
        });

    }

    formValid() {
        return this.form.valid;
    }

    // update script before closing dialog
    submit() {
        const form = this.form.value;
        if (this.script.id) {
            this.editScript(form);
        } else {
            this.addScript(form);
        }
    }

    addScript(form) {
        this.scriptService.add(form).subscribe(resp => {
            this.dialogRef.close(resp);
        });
    }

    editScript(form) {
        this.scriptService.edit(form).subscribe(resp => {
            this.dialogRef.close(resp);
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
