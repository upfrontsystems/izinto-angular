import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Dashboard} from '../../_models/dashboard';
import {ReplaySubject, Subject} from 'rxjs';
import {User} from '../../_models/user';
import {MatSelect} from '@angular/material/select';
import {AuthenticationService} from '../../_services/authentication.service';
import {UserService} from '../../_services/user.service';
import {DashboardService} from '../../_services/dashboard.service';
import {take, takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-dashboard-editor',
    templateUrl: './dashboard-editor.component.html',
    styleUrls: ['./dashboard-editor.component.css']
})
export class DashboardEditorComponent implements OnInit, AfterViewInit, OnDestroy {

    @Input() dashboard: Dashboard;
    @Output() edited: EventEmitter<Dashboard> = new EventEmitter();
    public form: FormGroup;
    public userNameFilter: FormControl = new FormControl();
    public searching = false;
    public filteredUsers: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);
    @ViewChild('userSelect', {static: true}) userSelect: MatSelect;
    protected _onDestroy = new Subject<void>();

    constructor(
        private renderer: Renderer2,
        private fb: FormBuilder,
        public authService: AuthenticationService,
        private userService: UserService,
        private dashboardService: DashboardService) {
    }

    ngOnInit() {
        const formData = {
            id: this.dashboard.id,
            title: new FormControl(this.dashboard.title, [Validators.required]),
            description: this.dashboard.description,
            collection_id: this.dashboard.collection_id,
            type: this.dashboard.type,
            content: this.dashboard.content,
            users: [this.dashboard.users],
            date_hidden: this.dashboard.date_hidden
        };
        this.form = this.fb.group(formData);
        this.filteredUsers.next(this.dashboard.users);

        this.onFormChanges();
    }

    ngAfterViewInit() {
        this.setInitialValue();
    }

    ngOnDestroy() {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    onFormChanges(): void {
        this.userNameFilter.valueChanges.subscribe(value => this.filterUsers(value));
    }

    formValid() {
        return this.form.valid;
    }

    submit() {
        this.dashboardService.edit(this.form.value).subscribe(resp => {
            this.edited.emit(resp);
        });
    }

    cancel(): void {
        this.edited.emit(this.dashboard);
    }

    protected setInitialValue() {
        if (this.userSelect) {
            this.filteredUsers.pipe(take(1), takeUntil(this._onDestroy)).subscribe(() => {
                this.userSelect.compareWith = (a: User, b: User) => a && b && a.id === b.id;
            });
        }
    }

    protected filterUsers(search) {
        if (!search) {
            this.filteredUsers.next(this.form.controls.users.value);
            return;
        }
        // filter the users
        this.searching = true;
        this.userService.getAll({'name': search}).subscribe(resp => {
            this.filteredUsers.next(resp);
            this.searching = false;
        });
    }
}
