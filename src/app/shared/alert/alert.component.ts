import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material';
import { AlertService } from '../../_services/alert.service';

@Component({
    selector: 'app-alert',
    template: '<div></div>',
    styleUrls: ['alert.component.scss']
})
export class AlertComponent implements OnInit {
    message: any;

    constructor(private alertService: AlertService, private snackBar: MatSnackBar) { }

    ngOnInit() {
        this.alertService.getMessage().subscribe(
            message => {
                this.message = message;
                if (this.message) {
                    this.snackBar.openFromComponent(AlertNotificationComponent, {
                        duration: this.message.timeout,
                        verticalPosition: 'top',
                        panelClass: ['mat-elevation-z5', 'alert-' + this.message.type],
                        data: this.message.text || ' '
                    });
                } else {
                    if (this.snackBar) {
                        this.snackBar.dismiss();
                    }
                }
        });
    }

    clearMessage() {
        this.alertService.clear();
    }
}

@Component({
    selector: 'app-alert-notification',
    templateUrl: 'alert.component.html',
    styleUrls: ['alert.component.scss'],
})
export class AlertNotificationComponent {
    constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any,
                private _snackRef: MatSnackBarRef<any>) { }

    dismiss() {
        this._snackRef.dismiss();
    }
}
