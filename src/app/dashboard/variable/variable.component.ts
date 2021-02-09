import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Variable } from '../../_models/variable';
import { DataSource } from '../../_models/data.source';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { DataSourceService } from '../../_services/data.source.service';
import { VariableService } from '../../_services/variable.service';
import { MatDialog } from '@angular/material/dialog';
import { VariableDialogComponent } from './variable-dialog.component';
import { Dashboard } from '../../_models/dashboard';
import { DashboardService } from '../../_services/dashboard.service';
import { AuthenticationService } from '../../_services/authentication.service';

@Component({
    selector: 'app-variable',
    templateUrl: './variable.component.html',
    styleUrls: ['./variable.component.css']
})
export class DashboardVariableComponent implements OnInit, AfterViewInit {

    variables: Variable[] = [];
    containerId: number;
    dashboard: Dashboard;
    isAdmin = false;
    dataSources: DataSource[];
    dataSource = new MatTableDataSource<Variable>(this.variables);
    displayedColumns: string[] = ['name', 'value', 'action'];
    fabButtons = [
        {
            icon: 'add',
            label: 'Add Variable',
        }
    ];

    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    constructor(protected route: ActivatedRoute,
        protected authService: AuthenticationService,
        protected dashboardService: DashboardService,
        protected variableService: VariableService,
        public dialog: MatDialog) {
    }

    ngOnInit() {
        this.isAdmin = this.authService.hasRole('Administrator');
        this.dataSource.sort = this.sort;
        this.route.parent.params.subscribe(params => {
            this.containerId = +params['dashboard_id'];
            this.getVariables();
            this.getDashboard();
        });
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
    }

    getVariables() {
        this.variableService.getVariables(this.containerId, { container_id: this.containerId }).subscribe(
            resp => {
                this.variables = resp;
                this.refresh();
            }
        );
    }

    getDashboard() {
        // check if dashboard is in service
        // otherwise load dashboard
        const existing = this.dashboardService.currentDashboardValue;
        if (existing && existing.id === this.containerId) {
            this.dashboard = existing;
            this.isAdmin = this.isAdmin || this.dashboard.user_access.role === 'Administrator';
        } else {
            this.dashboardService.getById(this.containerId).subscribe(resp => {
                this.dashboard = resp;
                this.isAdmin = this.isAdmin || this.dashboard.user_access.role === 'Administrator';
            });
        }
    }

    add() {
        const dialogRef = this.dialog.open(VariableDialogComponent, {
            width: '550px',
            data: { container_id: this.containerId }
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
        this.variableService.delete(this.containerId, item).subscribe(resp => {
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
        // update variables on cached dashboard
        if (this.dashboard) {
            this.dashboard.variables = this.variables;
            this.dashboardService.setCurrentDashboard(this.dashboard);
        }
    }
}
