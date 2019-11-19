import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material';
import {Collection} from '../_models/collection';
import {CollectionService} from '../_services/collection.service';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css']
})
export class CollectionComponent implements OnInit {

    collectionId: number;
    collection: Collection;


    constructor(private route: ActivatedRoute,
                private http: HttpClient,
                public dialog: MatDialog,
                private collectionService: CollectionService) {
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.collectionId = +params.get('id');
            this.getCollection();
        });
    }

    getCollection() {
        this.collectionService.getById(this.collectionId).subscribe(resp => {
            this.collection = resp;
        });
    }
}
