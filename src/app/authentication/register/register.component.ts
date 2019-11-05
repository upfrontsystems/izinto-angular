import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
    FormBuilder,
    FormGroup,
    Validators,
    FormControl
} from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { AuthenticationService } from '../../_services/authentication.service';
import { AlertService } from '../../_services/alert.service';
import { Role } from '../../_models/role';

const password = new FormControl('', Validators.required);
const confirmPassword = new FormControl('', CustomValidators.equalTo(password));

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
    public form: FormGroup;
    currentStep = 1;

    constructor(
        private authenticationService: AuthenticationService,
        private alertService: AlertService,
        private fb: FormBuilder,
        private router: Router) {}

    ngOnInit() {
        // set role to Handler
        this.form = this.fb.group({
            role: [Role.User],
            firstname: [
                null,
                Validators.compose([Validators.required, CustomValidators.firstname])
            ],
            surname: [
                null,
                Validators.compose([Validators.required, CustomValidators.surname])
            ],
            email: [
                null,
                Validators.compose([Validators.required, CustomValidators.email])
            ],
            password,
            confirmPassword
        });
    }

    nextStep() {
        this.currentStep += 1;
    }

    previousStep() {
        this.currentStep -= 1;
    }

    stepOneValid() {
        return this.form.controls.firstname.valid && this.form.controls.surname.valid && this.form.controls.email.valid;
    }

    onSubmit() {
        const url = window.location.protocol + '//' + window.location.host;
        this.authenticationService.register(this.form.value, url).subscribe(
            resp => {
                this.alertService.success('You have successfully registered. <br>' +
                'Please check your email for further instructions', true, 10000);
                this.router.navigate(['/']);
            });
    }
}
