import { Routes } from '@angular/router';

import { ErrorComponent } from './error/error.component';
import { ForgotComponent } from './forgot/forgot.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { OTPComponent } from './otp/otp.component';
import {SetPasswordComponent} from './set-password/set.password.component';
export const AuthenticationRoutes: Routes = [
    {
        path: '',
        children: [
            {
                path: '404',
                component: ErrorComponent
            },
            {
                path: 'forgot',
                component: ForgotComponent
            },
            {
                path: 'lockscreen',
                component: LockscreenComponent
            },
            {
                path: 'login',
                component: LoginComponent
            },
            {
                path: 'register',
                component: RegisterComponent
            },
            {
                path: 'otp/:secret',
                component: OTPComponent
            },
            {
                path: 'set-password/:secret',
                component: SetPasswordComponent
            }]
    }
];
