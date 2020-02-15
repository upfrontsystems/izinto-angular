import {
    ChangeDetectorRef,
    Component,
    OnInit,
    OnDestroy
} from '@angular/core';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { MediaMatcher } from '@angular/cdk/layout';
import {CollectionService} from '../../../_services/collection.service';
import {DashboardService} from '../../../_services/dashboard.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: []
})
export class AppSidebarComponent implements OnInit, OnDestroy {
    public config: PerfectScrollbarConfigInterface = {};
    mobileQuery: MediaQueryList;

    private _mobileQueryListener: () => void;
    public menuItems = [];

    constructor(
        changeDetectorRef: ChangeDetectorRef,
        media: MediaMatcher,
        private collectionService: CollectionService,
        private dashboardService: DashboardService,
    ) {
        this.mobileQuery = media.matchMedia('(min-width: 768px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);
    }

    ngOnInit() {
        this.collectionService.getCollections({user_id: true}).subscribe(resp => {
            for (const collection of resp) {
                this.menuItems.push(
                    {
                        link: '/collections/' + collection.id,
                        name: collection.title,
                        type: 'link',
                        icon: 'library_books'
                    },
                );
            }
        });

        this.dashboardService.getDashboards({user_id: true, collection_id: ''}).subscribe(resp => {
            for (const dashboard of resp) {
                this.menuItems.push(
                    {
                        link: '/dashboards/' + dashboard.id,
                        name: dashboard.title,
                        type: 'link',
                        icon: 'insert_chart'
                    },
                );
            }
        });
    }

    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this._mobileQueryListener);
    }
}
