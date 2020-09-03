import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {Query} from '../_models/query';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {ActivatedRoute} from '@angular/router';
import {QueryService} from '../_services/query.service';
import {MatDialog} from '@angular/material/dialog';
import {QueryDialogComponent} from './query.dialog.component';

@Component({
    selector: 'app-query',
    templateUrl: './query.component.html',
    styleUrls: ['./query.component.css']
})
export class QueryComponent implements OnInit, AfterViewInit {

    queries: Query[];
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
                private queryService: QueryService,
                public dialog: MatDialog) {
    }

    ngOnInit() {
        this.dataSource.sort = this.sort;
        this.getQueries();
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
    }

    getQueries() {
        this.queryService.getAll({user_id: true}).subscribe(
            resp => {
                this.queries = resp;
                this.refresh();
            }
        );
    }

    add() {
        const dialogRef = this.dialog.open(QueryDialogComponent, {
            width: '550px',
            data: {}
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
            data: item
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
        this.queryService.delete(item).subscribe(resp => {
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
