import {User} from './user';
import {Dashboard} from './dashboard';

export class Collection {
    id: number;
    title: string;
    description: string;
    users: User[];
    dashboards: Dashboard[];
}
