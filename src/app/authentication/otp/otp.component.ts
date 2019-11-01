import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {AuthenticationService} from '../../_services/authentication.service';
import {first} from 'rxjs/operators';

@Component({
    selector: 'app-otp',
    templateUrl: './otp.component.html',
    styleUrls: ['./otp.component.scss']
})
export class OTPComponent implements OnInit {
    otpForm: FormGroup;
    loading = false;
    submitted = false;
    error = '';
    secret: string;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService
    ) {
        if (this.authenticationService.currentUserValue) {
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {
        this.otpForm = this.formBuilder.group({otp: ['', Validators.required]});
        this.route.params.forEach((params: Params) => {
            this.secret = params['secret'];
        });
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.otpForm.controls;
    }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.otpForm.invalid) {
            return;
        }

        this.loading = true;
        this.authenticationService.confirmOTP(this.f.otp.value, this.secret)
            .pipe(first())
            .subscribe(
                data => {
                    this.router.navigate(['/']);
                },
                error => {
                    this.error = error;
                    this.loading = false;
                });
    }
}
