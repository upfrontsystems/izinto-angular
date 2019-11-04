import * as $ from 'jquery';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {ReactiveFormsModule} from '@angular/forms';
import {GraphQLModule} from './graph-ql/graph-ql.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {PERFECT_SCROLLBAR_CONFIG} from 'ngx-perfect-scrollbar';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';

import {FullComponent} from './layouts/full/full.component';
import {AppBlankComponent} from './layouts/blank/blank.component';
import {AppHeaderComponent} from './layouts/full/header/header.component';
import {AppSidebarComponent} from './layouts/full/sidebar/sidebar.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import { DashboardListComponent } from './dashboard/dashboard.list.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ConfirmationComponent, ConfirmationDialogComponent} from './shared/confirmation-dialog/confirmation.dialog.component';
import {MaterialModule} from './material.module';
import {NgMultiSelectDropDownModule} from 'ng-multiselect-dropdown';
import {ErrorInterceptor} from './_helpers/error.interceptor';
import {JwtInterceptor} from './_helpers/jwt.interceptor';
import {SpinnerInterceptor} from './_helpers/spinner.interceptor';
import {AppRoutes} from './app.routing';
import {AppComponent} from './app.component';
import {AlertService} from './_services/alert.service';
import {SpinnerService} from './_services/spinner.service';
import {AdminComponent} from './admin/admin.component';
import { AlertNotificationComponent } from './shared/alert/alert.component';
import {HomeComponent} from './home/home.component';
import {SharedModule} from './shared/shared.module';
import {ChartComponent} from './dashboard/chart/chart.component';
import { SpinnerComponent } from './shared/spinner/spinner.component';
import {UserComponent} from './user/user.component';
import {UserDialogComponent} from './user/user.dialog.component';
import {FabSpeedDialComponent} from './shared/fab-speed-dial/fab-speed-dial.component';
import {ChartDialogComponent} from './dashboard/chart/chart.dialog.component';
import {DashboardDialogComponent} from './dashboard/dashboard.dialog.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    suppressScrollX: true,
    wheelSpeed: 2,
    wheelPropagation: true
};

@NgModule({
    declarations: [
        AdminComponent,
        AppComponent,
        AppHeaderComponent,
        AppBlankComponent,
        AppSidebarComponent,
        ConfirmationComponent,
        ConfirmationDialogComponent,
        DashboardComponent,
        DashboardDialogComponent,
        DashboardListComponent,
        ChartComponent,
        ChartDialogComponent,
        FabSpeedDialComponent,
        FullComponent,
        HomeComponent,
        SpinnerComponent,
        UserComponent,
        UserDialogComponent,
    ],
    imports: [
        AppRoutes,
        BrowserModule,
        BrowserAnimationsModule,
        MaterialModule,
        FormsModule,
        FlexLayoutModule,
        GraphQLModule,
        HttpClientModule,
        PerfectScrollbarModule,
        ReactiveFormsModule,
        SharedModule,
        NgMultiSelectDropDownModule.forRoot(),
    ],
    entryComponents: [
        ChartDialogComponent,
        ConfirmationDialogComponent,
        DashboardDialogComponent,
        UserDialogComponent
    ],
    providers: [
        AlertService,
        SpinnerService,
        {provide: HTTP_INTERCEPTORS, useClass: SpinnerInterceptor, multi: true},
        {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
        {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
        {provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
