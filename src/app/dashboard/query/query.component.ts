import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {ActivatedRoute} from '@angular/router';
import {QueryService} from '../../_services/query.service';
import {MatDialog} from '@angular/material/dialog';
import {QueryDialogComponent} from './query.dialog.component';
import {DataSourceService} from '../../_services/data.source.service';
import {Query} from '../../_models/query';
import {DataSource} from '../../_models/data.source';
import {DashboardService} from '../../_services/dashboard.service';
import {AuthenticationService} from '../../_services/authentication.service';

@Component({
    selector: 'app-query',
    templateUrl: './query.component.html',
    styleUrls: ['./query.component.css']
})
export class QueryComponent implements OnInit, AfterViewInit {

    queries: Query[];
    dashboardId: number;
    userAccess: any;
    isAdmin = false;
    dataSources: DataSource[];
    dataSource = new MatTableDataSource<Query>(this.queries);
    displayedColumns: string[] = ['name', 'data_source', 'action'];
    fabButtons = [
        {
            icon: 'add',
            label: 'Add Query',
        }
    ];

    @ViewChild(MatSort, {static: true}) sort: MatSort;
    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

    constructor(private route: ActivatedRoute,
                private authService: AuthenticationService,
                private dashboardService: DashboardService,
                private dataSourceService: DataSourceService,
                private queryService: QueryService,
                public dialog: MatDialog) {
    }

    ngOnInit() {
        this.isAdmin = this.authService.hasRole('Administrator');
        this.route.parent.params.subscribe(params => {
            this.dashboardId = +params['dashboard_id'];
            this.getUserAccessRole();
            this.getQueries();
        });
        this.dataSource.sort = this.sort;
        this.getDataSources();
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
    }

    // get user access for the dashboard
    getUserAccessRole() {
        this.dashboardService.getUserAccessRole(this.dashboardId).subscribe(resp => {
            this.userAccess = resp;
            // check user permission
            this.isAdmin = this.isAdmin || this.userAccess.role === 'Administrator';
        });
    }

    getQueries() {
        this.queryService.getAll(this.dashboardId, {}).subscribe(
            resp => {
                this.queries = resp;
                this.refresh();
            }
        );
    }

    getDataSources() {
        this.dataSourceService.getAll({}).subscribe(
            resp => {
                this.dataSources = resp;
            }
        );
    }

    add() {
        const dialogRef = this.dialog.open(QueryDialogComponent, {
            width: '550px',
            data: {dataSources: this.dataSources, query: {dashboard_id: this.dashboardId}}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.queries.push(result);
                this.refresh();
            }
        });
    }

    edit(item: Query) {
        const dialogRef = this.dialog.open(QueryDialogComponent, {
            width: '550px',
            data: {dataSources: this.dataSources, query: item}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                for (const ix in this.queries) {
                    if (this.queries[ix].id === result.id) {
                        this.queries[ix] = result;
                        break;
                    }
                }
                this.refresh();
            }
        });
    }

    delete(item: Query) {
        this.queryService.delete(this.dashboardId, item).subscribe(resp => {
            for (const ix in this.queries) {
                if (this.queries[ix].id === item.id) {
                    this.queries.splice(+ix, 1);
                    break;
                }
            }
            this.refresh();
        });
    }

    refresh() {
        this.dataSource.data = this.dataSource.sortData(this.queries, this.sort);
    }
}
