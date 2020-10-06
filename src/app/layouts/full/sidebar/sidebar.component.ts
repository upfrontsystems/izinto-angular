import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {MediaMatcher} from '@angular/cdk/layout';
import {CollectionService} from '../../../_services/collection.service';
import {DashboardService} from '../../../_services/dashboard.service';
import {MatSidenav} from '@angular/material/sidenav';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: []
})
export class AppSidebarComponent implements OnInit, OnDestroy {

    @Input() sidebar: MatSidenav;
    public config: PerfectScrollbarConfigInterface = {};
    mobileQuery: MediaQueryList;
    public menuItems = [];
    private _mobileQueryListener: () => void;

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
        this.getCollections();
    }

    getCollections() {
        this.collectionService.getCollections({user_id: true, list_dashboards: true}).subscribe(resp => {
            for (const collection of resp) {
                const menuitem = {
                    link: '/collections/' + collection.id,
                    name: collection.title,
                    type: 'sub',
                    icon: 'library_books'
                };
                menuitem['children'] = [];
                const dashboards = collection['dashboards'].sort((a, b) => a.index - b.index);
                for (const dashboard of dashboards) {
                    menuitem['children'].push(
                        {
                            state: dashboard.id,
                            name: dashboard.title,
                            type: 'link',
                            link: '/dashboards/' + dashboard.id
                        }
                    );
                }
                this.menuItems.push(menuitem);
            }

            this.getDashboards();
        });
    }

    getDashboards() {
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
