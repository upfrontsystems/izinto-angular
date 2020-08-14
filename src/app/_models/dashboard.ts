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
}
