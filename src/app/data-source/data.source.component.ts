import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DataSource} from '../_models/data.source';
import {Role} from '../_models/role';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {DataSourceService} from '../_services/data.source.service';
import {AuthenticationService} from '../_services/authentication.service';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {DataSourceDialogComponent} from '../data-source/data.source.dialog.component';

@Component({
  selector: 'app-data-source',
  templateUrl: './data.source.component.html',
  styleUrls: ['./data.source.component.css']
})
export class DataSourceComponent implements OnInit, AfterViewInit  {

    dataSources: DataSource[];
    roles: Role[];
    dataSource = new MatTableDataSource<DataSource>(this.dataSources);
    public form: FormGroup;
    displayedColumns: string[] = ['firstname', 'surname', 'email', 'role', 'action'];
    fabButtons = [
        {
            icon: 'add',
            label: 'Add DataSource',
        }
    ];

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(private route: ActivatedRoute,
                private dataSourceService: DataSourceService,
                private authService: AuthenticationService,
                private fb: FormBuilder,
                public dialog: MatDialog) {
    }

    ngOnInit() {
        this.dataSource.sort = this.sort;
        this.form = this.fb.group({search: '', inactive: false});

        this.form.get('search').valueChanges.pipe(debounceTime(1000), distinctUntilChanged())
            .subscribe(value => this.getDataSources({search: value, inactive: this.form.controls.inactive.value}));
        this.form.get('inactive').valueChanges
            .subscribe(value => this.getDataSources({search: this.form.controls.search.value, inactive: value}));

        this.getDataSources({inactive: false});
        this.getRoles();
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
    }

    getDataSources(filters) {
        this.dataSourceService.getAll(filters).subscribe(
            resp => {
                this.dataSources = resp;
                this.refresh();
            }
        );
    }

    getRoles() {
        this.authService.getAllRoles().subscribe(resp => {
            this.roles = resp;
        });
    }

    add() {
        const dialogRef = this.dialog.open(DataSourceDialogComponent, {
            width: '550px',
            data: {roles: this.roles, dataSource: {}}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.dataSourceService.add(result).subscribe(resp => {
                    this.dataSources.push(resp);
                    this.refresh();
                });
            }
        });
    }

    // only load full dataSource details when editing dataSource
    edit(item: DataSource) {
        this.dataSourceService.getById(item.id).subscribe(resp => {
            this.openEditDialog(resp);
        });
    }

    openEditDialog(item: DataSource) {
        const dialogRef = this.dialog.open(DataSourceDialogComponent, {
            width: '550px',
            data: {roles: this.roles, dataSource: item}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.dataSourceService.edit(result).subscribe(resp => {
                    for (const ix in this.dataSources) {
                        if (this.dataSources[ix].id === resp.id) {
                            this.dataSources[ix] = resp;
                            break;
                        }
                    }
                    this.refresh();
                });
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
