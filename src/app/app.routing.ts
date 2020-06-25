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
import {DataSourceComponent} from './data-source/data.source.component';
import {LandingpageComponent} from './landingpage/landingpage.component';

const appRoutes: Routes = [
    {
        path: '',
        component: FullComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                component: HomeComponent,
                pathMatch: 'full'
            },
            {
                path: 'dashboards',
                component: DashboardListComponent
            },
            {
                path: 'dashboards/:dashboard_id',
                component: DashboardComponent
            },
            {
                path: 'collections',
                component: CollectionListComponent
            },
            {
                path: 'collections/:collection_id',
                component: CollectionComponent
            },
            {
                path: 'collections/:collection_id/dashboards/:dashboard_id',
                component: DashboardComponent
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
            },
            {
                path: 'datasources',
                component: DataSourceComponent
            }]
    },
    {
        path: '',
        component: AppBlankComponent,
        children: [
            {
                path: 'authentication',
                loadChildren:
                    () => import('./authentication/authentication.module').then(m => m.AuthenticationModule)
            },
            {
                path: 'home',
                component: LandingpageComponent,
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'home'
    }
];

export const AppRoutes = RouterModule.forRoot(appRoutes);
