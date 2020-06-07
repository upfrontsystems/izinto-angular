import {Variable} from './variable';
import {User} from './user';
export const GroupBy = ['auto', '10s', '1m', '5m', '10m', '30m', '1h', '6h', '1d', '7d'];

export class Dashboard {
    id: number;
    title: string;
    description: string;
    collection_id: number;
    index: number;
    users: User[];
    variables: Variable[];
}
