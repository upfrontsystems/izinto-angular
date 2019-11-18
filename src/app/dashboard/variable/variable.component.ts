import {Component, Input, OnInit} from '@angular/core';
import {Variable} from '../../_models/variable';

@Component({
  selector: 'app-variable',
  templateUrl: './variable.component.html',
    styleUrls: ['./../dashboard.component.scss']
})
export class VariableComponent implements OnInit {

    @Input() variable: Variable;

    constructor() { }

    ngOnInit() {
    }

}
