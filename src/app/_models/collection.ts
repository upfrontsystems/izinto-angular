import {Dashboard} from './dashboard';

export class Collection {
    id: number;
    title: string;
    description: string;
    users_access: any[];
    dashboards: Dashboard[];
    image: string;
}

export const CollectionLinks = [
    {name: 'View', link: 'view', icon: 'preview'},
    {name: 'User Access', link: 'access', icon: 'supervisor_account'}
];

export const ImageDimensions = {width: 640, height: 400};
