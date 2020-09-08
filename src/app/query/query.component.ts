import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {Query} from '../_models/query';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {ActivatedRoute} from '@angular/router';
import {QueryService} from '../_services/query.service';
import {MatDialog} from '@angular/material/dialog';
import {QueryDialogComponent} from './query.dialog.component';
import {DataSource} from '../_models/data.source';
import {DataSourceService} from '../_services/data.source.service';

@Component({
    selector: 'app-query',
    templateUrl: './query.component.html',
    styleUrls: ['./query.component.css']
})
export class QueryComponent implements OnInit, AfterViewInit {

    queries: Query[];
    dashboardId: number;
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
                private dataSourceService: DataSourceService,
                private queryService: QueryService,
                public dialog: MatDialog) {
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.dashboardId = +params.get('dashboard_id');
        });
        this.dataSource.sort = this.sort;
        this.getQueries();
        this.getDataSources();
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
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
