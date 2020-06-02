import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Collection} from '../_models/collection';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material';
import {CollectionService} from '../_services/collection.service';
import {CollectionDialogComponent} from './collection.dialog.component';
import {AlertService} from '../_services/alert.service';
import {AuthenticationService} from '../_services/authentication.service';
import {CopyService} from '../_services/copy.service';

@Component({
  selector: 'app-collection-list',
  templateUrl: './collection.list.component.html',
  styleUrls: ['./collection.component.css']
})
export class CollectionListComponent implements OnInit {

    canEdit = false;

    @Input() collections: Collection[];
    @Output() edited: EventEmitter<Collection> = new EventEmitter();
    @Output() deleted: EventEmitter<Collection> = new EventEmitter();

    constructor(private route: ActivatedRoute,
                private http: HttpClient,
                public dialog: MatDialog,
                protected alertService: AlertService,
                protected authService: AuthenticationService,
                private copyService: CopyService,
                private collectionService: CollectionService) { }

    ngOnInit() {
        // only admin can add and edit collections
        this.canEdit = this.authService.hasRole('Administrator');
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
}
