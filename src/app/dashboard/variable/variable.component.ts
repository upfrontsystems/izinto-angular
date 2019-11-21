import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Variable} from '../../_models/variable';
import {VariableService} from '../../_services/variable.service';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
    selector: 'app-variable',
    templateUrl: './variable.component.html',
    styleUrls: ['./../dashboard.component.scss']
})
export class VariableComponent implements OnInit {

    public form: FormGroup;
    editing = false;
    adding = false;
    @Input() variable: Variable;
    @Input() index: number;
    @Output() edited: EventEmitter<Variable> = new EventEmitter();
    @Output() added: EventEmitter<Variable> = new EventEmitter();
    @Output() deleted: EventEmitter<Variable> = new EventEmitter();

    constructor(private variableService: VariableService,
                private fb: FormBuilder) {
    }

    ngOnInit() {
        this.adding = this.variable.id === undefined;
        this.form = this.fb.group({
            id: this.variable.id,
            name: this.variable.name,
            value: this.variable.value,
            dashboard_id: this.variable.dashboard_id,
            index: this.index
        });
    }

    submit() {
        if (this.adding) {
            this.addVariable();
        } else {
            this.editVariable();
        }
    }

    addVariable() {
        const formData = this.form.value;
        this.added.emit(formData);
        this.variable = formData;
        this.adding = false;
    }

    editVariable() {
        this.edited.emit(this.form.value);
    }

    deleteVariable() {
        this.deleted.emit(this.form.value);
    }
}
