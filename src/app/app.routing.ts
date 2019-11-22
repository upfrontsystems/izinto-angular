import {Routes, RouterModule} from '@angular/router';

import {AdminComponent} from './admin/admin.component';
import {AuthGuard} from './_guards/auth.guard';
import {Role} from './_models/role';
import {FullComponent} from './layouts/full/full.component';
import {AppBlankComponent} from './layouts/blank/blank.component';
import {UserComponent} from './user/user.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {DashboardListComponent} from './dashboard/dashboard.list.component';
import {HomeComponent} from './home/home.component';
import {CollectionListComponent} from './collection/collection.list.component';
import {CollectionComponent} from './collection/collection.component';
import {DashboardSettingsComponent} from './dashboard/dashboard-settings/dashboard.settings.component';

const appRoutes: Routes = [
    {
        path: '',
        component: FullComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                redirectTo: '/home',
                pathMatch: 'full'
            },
            {
                path: 'home',
                component: HomeComponent
            },
            {
                path: 'dashboards',
                component: DashboardListComponent
            },
            {
                path: 'dashboards/:id',
                component: DashboardComponent
            },
            {
                path: 'dashboards/:id/settings',
                component: DashboardSettingsComponent
            },
            {
                path: 'collections',
                component: CollectionListComponent
            },
            {
                path: 'collections/:id',
                component: CollectionComponent
            },
            {
                path: 'admin',
                component: AdminComponent,
                data: {roles: [Role.Administrator]}
            },
            {
                path: 'users',
                component: UserComponent,
                data: {roles: [Role.Administrator]}
            }]
    },
    {
        path: '',
        component: AppBlankComponent,
        children: [
            {
                path: 'authentication',
                loadChildren:
                    './authentication/authentication.module#AuthenticationModule'
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'authentication/login'
    }
];

export const AppRoutes = RouterModule.forRoot(appRoutes);
