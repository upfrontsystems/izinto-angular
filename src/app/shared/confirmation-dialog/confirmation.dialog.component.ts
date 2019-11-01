import {Component, EventEmitter, Inject, Input, Output} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';


@Component({
    selector: 'confirmation',
    template: '<div></div>'
})
export class ConfirmationComponent {

    @Input() title: string;
    @Input() content: string;
    @Output() onAccept: EventEmitter<any> = new EventEmitter();

    constructor(public dialog: MatDialog) { }

    show(): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '350px',
            data: {title: this.title, content: this.content}
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.onAccept.emit();
            }
        });
    }
}


@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: './confirmation.dialog.component.html',
    styleUrls: ['./confirmation.dialog.component.scss']
})
export class ConfirmationDialogComponent {
    title: string;
    content: string;

    constructor(
        public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data) {
        this.title = data.title;
        this.content = data.content;
        if (!this.title) {
            this.title = 'Are you sure?';
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
