import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Collection} from '../_models/collection';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import {CollectionService} from '../_services/collection.service';
import {CollectionDialogComponent} from './collection.dialog.component';
import {AlertService} from '../_services/alert.service';
import {AuthenticationService} from '../_services/authentication.service';
import {CopyService} from '../_services/copy.service';

export const PlaceholderBackgrounds = [
        '#CC334B',
        '#98CC33',
        '#33CCB4',
        '#6733CC',
        '#3163CE',
        '#31CE4E',
        '#31B2CE',
        '#CE9C31',
        '#F95606',
        '#CE31B1',
        '#2B27B8',
        '#27B874'];

@Component({
  selector: 'app-collection-list',
  templateUrl: './collection.list.component.html',
  styleUrls: ['./collection.component.css']
})
export class CollectionListComponent implements OnInit {

    isAdmin = false;
    backgrounds = PlaceholderBackgrounds;

    @Input() collections: Collection[];
    @Output() edited: EventEmitter<Collection> = new EventEmitter();
    @Output() deleted: EventEmitter<Collection> = new EventEmitter();

    constructor(private route: ActivatedRoute,
                private router: Router,
                private http: HttpClient,
                public dialog: MatDialog,
                protected alertService: AlertService,
                protected authService: AuthenticationService,
                private copyService: CopyService,
                private collectionService: CollectionService) { }

    ngOnInit() {
        // only admin can add and edit collections
        this.isAdmin = this.authService.hasRole('Administrator');
    }

    // check if user is admin or has edit permission for the collection
    canEdit(collection) {
        if (this.isAdmin) {
            return true;
        }

        const user = this.authService.currentUserValue;
        for (const access of collection.users_access) {
            if (access.user_id === user.id) {
                return (access.role === 'Administrator' || access.role === 'Edit');
            }
        }
        return false;
    }

    editCollection(collection) {
        const dialogRef = this.dialog.open(CollectionDialogComponent, {
            width: '600px',
            data: {collection: collection}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.collectionService.edit(result).subscribe( resp => {
                    this.edited.emit(resp);
                });
            }
        });
    }

    deleteCollection(collection) {
        this.collectionService.delete(collection).subscribe(resp => {
            this.deleted.emit(collection);
        });
    }

    copyCollection(collection) {
        this.copyService.copy('collection', collection);
        this.alertService.success('Collection copied', false, 2000);
    }

    routeTo(collection) {
        this.router.navigate(['/collections', collection.id]);
    }
}
