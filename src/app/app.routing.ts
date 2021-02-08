import {RouterModule, Routes} from '@angular/router';

import {AdminComponent} from './admin/admin.component';
import {AuthGuard} from './_guards/auth.guard';
import {Role} from './_models/role';
import {FullComponent} from './layouts/full/full.component';
import {AppBlankComponent} from './layouts/blank/blank.component';
import {UserComponent} from './user/user.component';
import {DashboardListComponent} from './dashboard/dashboard.list.component';
import {HomeComponent} from './home/home.component';
import {CollectionListComponent} from './collection/collection.list.component';
import {CollectionComponent} from './collection/collection.component';
import {DataSourceComponent} from './data-source/data.source.component';
import {LandingpageComponent} from './landingpage/landingpage.component';
import {DashboardContainerComponent} from './dashboard/dashboard-container/dashboard-container.component';
import {QueryComponent} from './dashboard/query/query.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {DashboardEditorComponent} from './dashboard/dashboard-editor/dashboard-editor.component';
import {DashboardVariableComponent} from './dashboard/variable/variable.component';
import {DashboardUserAccessComponent} from './dashboard/dashboard-user-access/dashboard.user.access.component';
import {CollectionUserAccessComponent} from './collection/collection-user-access/collection.user.access.component';
import {CollectionContainerComponent} from './collection/collection-container/collection-container.component';
import { CollectionVariableComponent } from './collection/collection-variable/collection-variable.component';

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
                component: DashboardContainerComponent,
                children: [{
                    path: '',
                    redirectTo: 'view',
                    pathMatch: 'full'
                }, {
                    path: 'view',
                    component: DashboardComponent
                }, {
                    path: 'edit',
                    component: DashboardEditorComponent,
                    data: {roles: [Role.Administrator]}
                }, {
                    path: 'queries',
                    component: QueryComponent,
                    data: {roles: [Role.Administrator]}
                }, {
                    path: 'variables',
                    component: DashboardVariableComponent,
                    data: {roles: [Role.Administrator]}
                }, {
                    path: 'access',
                    component: DashboardUserAccessComponent,
                    data: {roles: [Role.Administrator]}
                }]
            },
            {
                path: 'collections',
                component: CollectionListComponent
            },
            {
                path: 'collections/:collection_id',
                component: CollectionContainerComponent,
                children: [{
                    path: '',
                    redirectTo: 'view',
                    pathMatch: 'full'
                }, {
                    path: 'view',
                    component: CollectionComponent
                }, {
                    path: 'access',
                    component: CollectionUserAccessComponent,
                    data: {roles: [Role.Administrator]}
                }, {
                    path: 'variables',
                    component: CollectionVariableComponent,
                    data: {roles: [Role.Administrator]}
                }]
            },
            {
                path: 'collections/:collection_id/dashboards/:dashboard_id',
                component: DashboardContainerComponent,
                children: [{
                    path: 'queries',
                    component: QueryComponent
                }]
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
