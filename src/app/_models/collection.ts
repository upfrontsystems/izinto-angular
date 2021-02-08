import {Dashboard} from './dashboard';
import {Variable} from './variable';

export class Collection {
    id: number;
    title: string;
    description: string;
    user_access: any;
    dashboards: Dashboard[];
    image: string;
    variables: Variable[];
}

export const CollectionLinks = [
    {name: 'View', link: 'view', icon: 'preview'},
    {name: 'User Access', link: 'access', icon: 'supervisor_account'}
];

export const ImageDimensions = {width: 640, height: 400};
