import {Variable} from './variable';
import {User} from './user';

export class Dashboard {
    id: number;
    title: string;
    description: string;
    collection_id: number;
    users: User[];
    variables: Variable[];
}
