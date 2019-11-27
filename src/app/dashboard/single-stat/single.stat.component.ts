import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SingleStat} from '../../_models/single.stat';
import {SingleStatService} from '../../_services/single.stat.service';

@Component({
    selector: 'app-single-stat',
    templateUrl: './single.stat.component.html',
    styleUrls: ['./../dashboard.component.scss']
})
export class SingleStatComponent implements OnInit {

    public form: FormGroup;
    editing = false;
    adding = false;
    @Input() singleStat: SingleStat;
    @Input() index: number;
    @Output() edited: EventEmitter<SingleStat> = new EventEmitter();
    @Output() added: EventEmitter<SingleStat> = new EventEmitter();
    @Output() deleted: EventEmitter<SingleStat> = new EventEmitter();

    constructor(private singleStatService: SingleStatService,
                private fb: FormBuilder) {
    }

    ngOnInit() {
        this.adding = this.singleStat.id === undefined;
        this.form = this.fb.group({
            id: this.singleStat.id,
            title: this.singleStat.title,
            query: this.singleStat.query,
            decimals: this.singleStat.decimals,
            thresholds: this.singleStat.thresholds,
            colors: this.singleStat.colors,
            dashboard_id: this.singleStat.dashboard_id,
        });
    }

    submit() {
        if (this.adding) {
            this.addSingleStat();
        } else {
            this.editSingleStat();
        }
    }

    addSingleStat() {
        this.singleStatService.add(this.form.value).subscribe(resp => {
            this.added.emit(resp);
        });
    }

    editSingleStat() {
        this.singleStatService.edit(this.form.value).subscribe(resp => {
            this.edited.emit(resp);
        });
    }

    deleteSingleStat() {
        this.singleStatService.delete(this.singleStat).subscribe(resp => {
            this.deleted.emit(this.singleStat);
        });
    }
}
