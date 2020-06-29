import {BrowserModule, HAMMER_GESTURE_CONFIG, HammerGestureConfig, HammerModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ColorCompactModule} from 'ngx-color/compact';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import * as Hammer from 'hammerjs';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {FlexLayoutModule} from '@angular/flex-layout';
import {NgModule} from '@angular/core';
import {NgxMatSelectSearchModule} from 'ngx-mat-select-search';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import {PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface, PerfectScrollbarModule} from 'ngx-perfect-scrollbar';

import {AppRoutes} from './app.routing';
import {AppComponent} from './app.component';
import {AppBlankComponent} from './layouts/blank/blank.component';
import {AppHeaderComponent} from './layouts/full/header/header.component';
import {AppSidebarComponent} from './layouts/full/sidebar/sidebar.component';
import {AdminComponent} from './admin/admin.component';
import {AlertService} from './_services/alert.service';
import {ChartComponent} from './dashboard/chart/chart.component';
import {ChartDialogComponent} from './dashboard/chart/chart.dialog.component';
import {ChartListComponent} from './dashboard/chart/chart.list.component';
import {CollectionComponent} from './collection/collection.component';
import {CollectionDialogComponent} from './collection/collection.dialog.component';
import {CollectionListComponent} from './collection/collection.list.component';
import {ConfirmationComponent, ConfirmationDialogComponent} from './shared/confirmation-dialog/confirmation.dialog.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {DashboardContainerComponent} from './dashboard/dashboard-container/dashboard-container.component';
import {DashboardPreviewComponent} from './dashboard/dashboard-container/dashboard-preview.component';
import {DashboardDialogComponent} from './dashboard/dashboard.dialog.component';
import {DashboardListComponent} from './dashboard/dashboard.list.component';
import {DataSourceComponent} from './data-source/data.source.component';
import {DataSourceDialogComponent} from './data-source/data.source.dialog.component';
import {ErrorInterceptor} from './_helpers/error.interceptor';
import {FabSpeedDialComponent} from './shared/fab-speed-dial/fab-speed-dial.component';
import {FullComponent} from './layouts/full/full.component';
import {HomeComponent} from './home/home.component';
import {MaterialModule} from './material.module';
import {JwtInterceptor} from './_helpers/jwt.interceptor';
import {SpinnerInterceptor} from './_helpers/spinner.interceptor';
import {SpinnerService} from './_services/spinner.service';
import {SharedModule} from './shared/shared.module';
import {SingleStatListComponent} from './dashboard/single-stat/single.stat.list.component';
import {SingleStatDialogComponent} from './dashboard/single-stat/single.stat.dialog.component';
import {ScriptListComponent} from './dashboard/script/script.list.component';
import {ScriptDialogComponent} from './dashboard/script/script.dialog.component';
import {SpinnerComponent} from './shared/spinner/spinner.component';
import {UserComponent} from './user/user.component';
import {UserDialogComponent} from './user/user.dialog.component';
import {QueryBaseComponent} from './dashboard/query.base.component';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {LandingpageComponent} from './landingpage/landingpage.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    suppressScrollX: true,
    wheelSpeed: 2,
    wheelPropagation: true
};

export class HammerConfig extends HammerGestureConfig {
    overrides = <any>{
        pan: {direction: Hammer.DIRECTION_HORIZONTAL}
    };
    buildHammer(element: HTMLElement) {
        return new Hammer(element, {
            touchAction: 'pan-y',
        });
    }
}

@NgModule({
    declarations: [
        AdminComponent,
        AppComponent,
        AppHeaderComponent,
        AppBlankComponent,
        AppSidebarComponent,
        CollectionComponent,
        CollectionDialogComponent,
        ConfirmationComponent,
        ConfirmationDialogComponent,
        CollectionListComponent,
        DashboardComponent,
        DashboardDialogComponent,
        DashboardContainerComponent,
        DashboardPreviewComponent,
        DashboardListComponent,
        DataSourceComponent,
        ChartComponent,
        ChartDialogComponent,
        ChartListComponent,
        FabSpeedDialComponent,
        FullComponent,
        HomeComponent,
        SingleStatListComponent,
        SingleStatDialogComponent,
        ScriptListComponent,
        ScriptDialogComponent,
        SpinnerComponent,
        UserComponent,
        UserDialogComponent,
        DataSourceDialogComponent,
        QueryBaseComponent,
        LandingpageComponent
    ],
    imports: [
        AppRoutes,
        BrowserModule,
        BrowserAnimationsModule,
        ColorCompactModule,
        FlexLayoutModule,
        FormsModule,
        HammerModule,
        HttpClientModule,
        MaterialModule,
        NgxMatSelectSearchModule,
        NgxDaterangepickerMd.forRoot(),
        PerfectScrollbarModule,
        ReactiveFormsModule,
        SharedModule,
        ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
    ],
    entryComponents: [
        ChartDialogComponent,
        CollectionDialogComponent,
        ConfirmationDialogComponent,
        DashboardDialogComponent,
        DataSourceDialogComponent,
        SingleStatDialogComponent,
        ScriptDialogComponent,
        UserDialogComponent
    ],
    providers: [
        AlertService,
        SpinnerService,
        {provide: HTTP_INTERCEPTORS, useClass: SpinnerInterceptor, multi: true},
        {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
        {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
        {provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG},
        {provide: HAMMER_GESTURE_CONFIG, useClass: HammerConfig}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
