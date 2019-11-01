import { Role } from './role';

export class User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    firstname: string;
    lastName: string;
    surname: string;
    fullname: string;
    role: Role;
    roles: Role[];
    access_token?: string;
    inactive: boolean;
}
