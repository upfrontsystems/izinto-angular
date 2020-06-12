import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {Variable} from '../../_models/variable';
import {VariableService} from '../../_services/variable.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

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

    // close editor on esc key
    @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
        this.editing = false;
    }

    ngOnInit() {
        this.adding = this.variable.id === undefined;
        this.form = this.fb.group({
            id: this.variable.id,
            name: [this.variable.name, [Validators.required, Validators.pattern(/^[a-zA-Z0-9_-]*$/)]],
            value: [this.variable.value, Validators.required],
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
        this.variableService.add(this.form.value).subscribe(resp => {
            this.added.emit(resp);
        });
    }

    editVariable() {
        this.variableService.edit(this.form.value).subscribe(resp => {
            this.edited.emit(resp);
        });
    }

    deleteVariable() {
        this.variableService.delete(this.variable).subscribe(resp => {
            this.deleted.emit(this.variable);
        });
    }
}
