import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Collection, CollectionLinks} from '../../_models/collection';
import {MediaMatcher} from '@angular/cdk/layout';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import {AuthenticationService} from '../../_services/authentication.service';
import {CopyService} from '../../_services/copy.service';
import {CollectionService} from '../../_services/collection.service';
import {MobileBreakpoint} from '../../_models/chart';

@Component({
  selector: 'app-collection-container',
  templateUrl: './collection-container.component.html',
  styleUrls: ['./collection-container.component.css']
})
export class CollectionContainerComponent implements OnInit {

    collectionId: number;
    collection: Collection;
    fabButtons = [
        {
            icon: 'add',
            label: 'Add Dashboard'
        }, {
            icon: 'collections',
            label: 'Paste Dashboard'
        }
    ];
    isAdmin = false;
    canEdit = false;
    collectionLinks = CollectionLinks;
    mobileQuery: MediaQueryList;
    private readonly _mobileQueryListener: () => void;

    constructor(changeDetectorRef: ChangeDetectorRef,
                media: MediaMatcher,
                private route: ActivatedRoute,
                private router: Router,
                private http: HttpClient,
                public dialog: MatDialog,
                protected authService: AuthenticationService,
                private copyService: CopyService,
                private collectionService: CollectionService) {
        this.mobileQuery = media.matchMedia('(min-width: ' + MobileBreakpoint + 'px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addEventListener('change', this._mobileQueryListener);
    }

    ngOnInit() {
        // only admin can add and edit
        this.isAdmin = this.authService.hasRole('Administrator');
        this.canEdit = this.isAdmin === true;

        this.route.paramMap.subscribe(params => {
            this.collectionId = +params.get('collection_id');
            this.getCollection();
        });
    }

    getCollection() {
        this.collectionService.getById(this.collectionId).subscribe(resp => {
            this.collection = resp;
            // check user permission
            this.isAdmin = this.isAdmin || this.collection.user_access.role === 'Administrator';
            this.canEdit = this.isAdmin || this.collection.user_access.role === 'Edit';
        });
    }
}
