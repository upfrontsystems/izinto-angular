import {Variable} from './variable';
import {User} from './user';

export class Dashboard {
    id: number;
    title: string;
    description: string;
    users: User[];
    variables: Variable[];
}
