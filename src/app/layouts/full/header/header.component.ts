import {Component, OnInit} from '@angular/core';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { Router } from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {AuthenticationService} from '../../../_services/authentication.service';
import {UserService} from '../../../_services/user.service';
import {User} from '../../../_models/user';
import {UserDialogComponent} from '../../../user/user.dialog.component';
import {Role} from '../../../_models/role';
import {MatDialog} from '@angular/material';


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html'
})
export class AppHeaderComponent implements OnInit {
    public config: PerfectScrollbarConfigInterface = {};
    // This is for Notifications
    //     {
    //         round: 'round-danger',
    //         icon: 'ti-link',
    //         title: 'Luanch Admin',
    //         subject: 'Just see the my new admin!',
    //         time: '9:30 AM'
    //     },
    notifications: object[] = [];

    // This is for Mymessages
    //     {
    //         useravatar: 'assets/images/users/1.jpg',
    //         status: 'online',
    //         from: 'Pavan kumar',
    //         subject: 'Just see the my admin!',
    //         time: '9:30 AM'
    //     },
    mymessages: object[] = [];
    currentUser: User;
    roles: Role[];

    constructor(
        private router: Router,
        public dialog: MatDialog,
        private sanitizer: DomSanitizer,
        private authenticationService: AuthenticationService,
        private userService: UserService
    ) {
        this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    }

    ngOnInit() {
        this.getRoles();
    }

    getRoles() {
        this.authenticationService.getAllRoles().subscribe(resp => {
            this.roles = resp;
        });
    }

    editProfile() {
        const dialogRef = this.dialog.open(UserDialogComponent, {
            width: '550px',
            data: {roles: this.roles, user: this.currentUser}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.userService.edit(result).subscribe(resp => {
                    resp.access_token = this.currentUser.access_token;
                    this.authenticationService.setCurrentUser(resp);
                    this.currentUser = resp;
                });
            }
        });
    }

    logout() {
        this.authenticationService.logout();
        this.router.navigate(['/login']);
    }

    safeImage(src) {
        return this.sanitizer.bypassSecurityTrustUrl(src);
    }
}
