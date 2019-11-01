import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CustomValidators} from 'ng2-validation';
import {AuthenticationService} from '../../_services/authentication.service';

@Component({
    selector: 'app-forgot',
    templateUrl: './forgot.component.html',
    styleUrls: ['./forgot.component.scss']
})
export class ForgotComponent implements OnInit {
    public form: FormGroup;
    private resetRequested = false;

    constructor(private fb: FormBuilder,
                protected authService: AuthenticationService) {
    }

    ngOnInit() {
        this.form = this.fb.group({
            application_url: window.location.origin,
            email: [
                null,
                Validators.compose([Validators.required, CustomValidators.email])
            ]
        });
    }

    onSubmit() {
        this.authService.requestResetPassword(this.form.value).subscribe(resp => {
            this.resetRequested = true;
        });
    }
}
