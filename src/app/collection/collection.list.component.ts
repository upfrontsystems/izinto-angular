import { Component, OnInit } from '@angular/core';
import {Collection} from '../_models/collection';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material';
import {CollectionService} from '../_services/collection.service';
import {CollectionDialogComponent} from './collection.dialog.component';

@Component({
  selector: 'app-collection-list',
  templateUrl: './collection.list.component.html',
  styleUrls: ['./collection-list.component.css']
})
export class CollectionListComponent implements OnInit {

    collections: Collection[];

    constructor(private route: ActivatedRoute,
                private http: HttpClient,
                public dialog: MatDialog,
                private collectionService: CollectionService) { }

    ngOnInit() {
        this.getCollections();
    }

    getCollections() {
        // list all collections of this user
        this.collectionService.getCollections({user_id: true}).subscribe(resp => {
            this.collections = resp;
        });
    }

    addCollection() {
        const dialogRef = this.dialog.open(CollectionDialogComponent, {
            width: '600px',
            data: {collection: {}}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.collectionService.add(result).subscribe(resp => {
                    this.collections.push(resp);
                });
            }
        });
    }

    editCollection(collection) {
        const dialogRef = this.dialog.open(CollectionDialogComponent, {
            width: '600px',
            data: {collection: collection}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.collectionService.edit(result).subscribe( resp => {
                    for (const ix in this.collections) {
                        if (this.collections[ix].id === resp.id) {
                            this.collections[ix] = resp;
                            break;
                        }
                    }
                });
            }
        });
    }

    deleteCollection(collection) {
        this.collectionService.delete(collection).subscribe(resp => {
            for (const ix in this.collections) {
                if (this.collections[ix].id === collection.id) {
                    this.collections.splice(+ix, 1);
                    break;
                }
            }
        });
    }
}
