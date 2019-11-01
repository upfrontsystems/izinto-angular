import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {CustomValidators} from 'ng2-validation';
import {AlertService} from '../../_services/alert.service';
import {AuthenticationService} from '../../_services/authentication.service';

const password = new FormControl('', Validators.required);
const confirmPassword = new FormControl('', CustomValidators.equalTo(password));

@Component({
    selector: 'app-set-password',
    templateUrl: './set.password.component.html',
    styleUrls: ['./set.password.component.scss']
})
export class SetPasswordComponent implements OnInit {
    form: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private alertService: AlertService,
        private authenticationService: AuthenticationService) {
        if (this.authenticationService.currentUserValue) {
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {
        this.route.params.forEach((params: Params) => {
            this.form = this.formBuilder.group({
                otp: ['', Validators.required],
                email: ['', Validators.required],
                secret: params.secret,
                password,
                confirmPassword
            });
        });
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.form.controls;
    }

    onSubmit() {
        this.authenticationService.resetPassword(this.form.value).subscribe(
            data => {
                this.alertService.success('Your password has been reset successfully.',
                    true);
                this.router.navigate(['/']);
            });
    }
}
