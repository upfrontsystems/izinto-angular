import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DataSource} from '../_models/data.source';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {ActivatedRoute} from '@angular/router';
import {DataSourceService} from '../_services/data.source.service';
import {DataSourceDialogComponent} from '../data-source/data.source.dialog.component';

@Component({
  selector: 'app-data-source',
  templateUrl: './data.source.component.html',
  styleUrls: ['./data.source.component.css']
})
export class DataSourceComponent implements OnInit, AfterViewInit  {

    dataSources: DataSource[];
    dataSource = new MatTableDataSource<DataSource>(this.dataSources);
    displayedColumns: string[] = ['name', 'type', 'url', 'database', 'action'];
    fabButtons = [
        {
            icon: 'add',
            label: 'Add Data Source',
        }
    ];

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(private route: ActivatedRoute,
                private dataSourceService: DataSourceService,
                public dialog: MatDialog) {
    }

    ngOnInit() {
        this.dataSource.sort = this.sort;
        this.getDataSources();
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
    }

    getDataSources() {
        this.dataSourceService.getAll({}).subscribe(
            resp => {
                this.dataSources = resp;
                this.refresh();
            }
        );
    }

    add() {
        const dialogRef = this.dialog.open(DataSourceDialogComponent, {
            width: '550px',
            data: {}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.dataSources.push(result);
                this.refresh();
            }
        });
    }

    edit(item: DataSource) {
        const dialogRef = this.dialog.open(DataSourceDialogComponent, {
            width: '550px',
            data: item
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                for (const ix in this.dataSources) {
                    if (this.dataSources[ix].id === result.id) {
                        this.dataSources[ix] = result;
                        break;
                    }
                }
                this.refresh();
            }
        });
    }

    delete(item: DataSource) {
        this.dataSourceService.delete(item).subscribe(resp => {
            for (const ix in this.dataSources) {
                if (this.dataSources[ix].id === item.id) {
                    this.dataSources.splice(+ix, 1);
                    break;
                }
            }
            this.refresh();
        });
    }

    refresh() {
        this.dataSource.data = this.dataSource.sortData(this.dataSources, this.sort);
    }
}
