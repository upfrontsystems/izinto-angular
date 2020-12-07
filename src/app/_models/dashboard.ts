import {Variable} from './variable';
import {User} from './user';

export type DashboardType = 'old' | 'new';

export class Dashboard {
    id: number;
    title: string;
    description: string;
    collection_id: number;
    content: string;
    type: DashboardType;
    index: number;
    users: User[];
    variables: Variable[];
    date_hidden: Boolean;
    image: string;
}

export const DashboardLinks = [
    {name: 'View', link: 'view', icon: 'preview'},
    {name: 'Edit', link: 'edit', icon: 'edit'},
    {name: 'Queries', link: 'queries', icon: 'query_builder'},
    {name: 'Variables', link: 'variables', icon: 'view_module'},
    {name: 'User Access', link: 'access', icon: 'supervisor_account'}
];
