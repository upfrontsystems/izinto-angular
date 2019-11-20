import {Component, OnInit} from '@angular/core';
import { first } from 'rxjs/operators';

import {User} from '../_models/user';
import { UserService } from '../_services/user.service';
import { AuthenticationService } from '../_services/authentication.service';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent implements OnInit {
    currentUser: User;
    userFromApi: User;
    fabButtons = [
        {
            icon: 'add',
            label: 'Add Collection',
        },
        {
            icon: 'add',
            label: 'Add Dashboard'
        }
    ];

    constructor(
        private userService: UserService,
        private authenticationService: AuthenticationService
    ) {
        this.currentUser = this.authenticationService.currentUserValue;
    }

    ngOnInit() {
        this.userService.getById(this.currentUser.id).pipe(first()).subscribe(user => {
            this.userFromApi = user;
        });
    }

    fabClick(label) {
        if (label === 'Add Dashboard') {
            this.addDashboard();
        } else if (label === 'Add Collection') {
            this.addCollection();
        }
    }

    addCollection() {

    }

    addDashboard() {

    }
}
