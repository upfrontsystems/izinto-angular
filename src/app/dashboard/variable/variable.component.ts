import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {Variable} from '../../_models/variable';
import {DataSource} from '../../_models/data.source';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {ActivatedRoute} from '@angular/router';
import {DataSourceService} from '../../_services/data.source.service';
import {VariableService} from '../../_services/variable.service';
import {MatDialog} from '@angular/material/dialog';
import {VariableDialogComponent} from './variable-dialog.component';

@Component({
    selector: 'app-variable',
    templateUrl: './variable.component.html',
    styleUrls: ['./variable.component.css']
})
export class VariableComponent implements OnInit, AfterViewInit {

    variables: Variable[];
    dashboardId: number;
    dataSources: DataSource[];
    dataSource = new MatTableDataSource<Variable>(this.variables);
    displayedColumns: string[] = ['name', 'value', 'action'];
    fabButtons = [
        {
            icon: 'add',
            label: 'Add Variable',
        }
    ];

    @ViewChild(MatSort, {static: true}) sort: MatSort;
    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

    constructor(private route: ActivatedRoute,
                private dataSourceService: DataSourceService,
                private variableService: VariableService,
                public dialog: MatDialog) {
    }

    ngOnInit() {
        this.dataSource.sort = this.sort;
        this.route.parent.params.subscribe(params => {
            this.dashboardId = +params['dashboard_id'];
            this.getVariables();
        });
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
    }

    getVariables() {
        this.variableService.getVariables(this.dashboardId, {dashboard_id: this.dashboardId}).subscribe(
            resp => {
                this.variables = resp;
                this.refresh();
            }
        );
    }

    add() {
        const dialogRef = this.dialog.open(VariableDialogComponent, {
            width: '550px',
            data: {dashboard_id: this.dashboardId}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.variables.push(result);
                this.refresh();
            }
        });
    }

    edit(item: Variable) {
        const dialogRef = this.dialog.open(VariableDialogComponent, {
            width: '550px',
            data: item
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                for (const ix in this.variables) {
                    if (this.variables[ix].id === result.id) {
                        this.variables[ix] = result;
                        break;
                    }
                }
                this.refresh();
            }
        });
    }

    delete(item: Variable) {
        this.variableService.delete(this.dashboardId, item).subscribe(resp => {
            for (const ix in this.variables) {
                if (this.variables[ix].id === item.id) {
                    this.variables.splice(+ix, 1);
                    break;
                }
            }
            this.refresh();
        });
    }

    refresh() {
        this.dataSource.data = this.dataSource.sortData(this.variables, this.sort);
    }
}
