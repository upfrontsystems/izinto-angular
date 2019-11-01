import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {User} from '../_models/user';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Role} from '../_models/role';
import {AuthenticationService} from '../_services/authentication.service';
import {CustomValidators} from 'ng2-validation';
import {SpinnerService} from '../_services/spinner.service';
import {AlertService} from '../_services/alert.service';

const password = new FormControl('');
const confirmPassword = new FormControl('', CustomValidators.equalTo(password));

@Component({
    selector: 'app-user-dialog',
    templateUrl: './user.dialog.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserDialogComponent implements OnInit {

    public form: FormGroup;
    state: string;
    user: User;
    roles: Role[];

    constructor(
        private authService: AuthenticationService,
        private alertService: AlertService,
        private spinnerService: SpinnerService,
        public dialogRef: MatDialogRef<UserDialogComponent>,
        private fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data) {
    }

    ngOnInit() {
        this.user = this.data.user;
        this.state = this.user.id ? 'Edit' : 'Add';
        this.roles = this.data.roles;

        this.form = this.fb.group({
            id: this.user.id,
            email: this.user.email,
            firstname: this.user.firstname,
            surname: this.user.surname,
            role: this.user.role,
            password,
            confirmPassword,
            confirmed_registration: true,
            inactive: this.user.inactive
        });
    }

    hasRole(role) {
        return this.authService.hasRole(role);
    }

    submitForm() {
        const formData = this.form.value;
        this.dialogRef.close(formData);
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
