import {Variable} from './variable';

export class Dashboard {
    id: number;
    title: string;
    description: string;
    user_id: number;
    variables: Variable[];
}
