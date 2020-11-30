import {Component, HostListener, Input, OnInit, ViewChild} from '@angular/core';
import {Dashboard} from '../../_models/dashboard';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {environment} from '../../../environments/environment';
import {QueryService} from '../../_services/query.service';
import {ActivatedRoute} from '@angular/router';
import {QueryBaseComponent} from '../query.base.component';
import {AuthenticationService} from '../../_services/authentication.service';
import {DashboardService} from '../../_services/dashboard.service';

@Component({
    selector: 'app-script-container',
    templateUrl: './script.container.component.html',
    styleUrls: ['./script.container.component.css']
})
export class ScriptContainerComponent extends QueryBaseComponent implements OnInit {

    @ViewChild('iframe') iframe;
    @Input() dashboard: Dashboard;
    contentURL: SafeResourceUrl;

    constructor(private sanitizer: DomSanitizer,
                protected route: ActivatedRoute,
                private queryService: QueryService,
                protected authService: AuthenticationService,
                protected dashboardService: DashboardService) {
        super(authService, dashboardService);
    }

    ngOnInit(): void {
        // only admin can add and edit
        this.route.parent.params.subscribe(params => {
            this.trustURL(+params['dashboard_id']);
        });
        this.dateSelection = this.dashboardService.getDateSelection();
        this.dashboardService.datesUpdated.subscribe((selection) => {
            this.dateSelection = selection;
            this.postDateSelection();
        });
    }

    @HostListener('window:message', ['$event']) onPostMessage(event) {
        if (event.origin === environment.scriptBaseURL) {
            const data = event.data;
            if (data.query) {
                this.runQuery(data.query.name, data.query.values);
            } else if (data.variables) {
                this.postVariables();
            } else if (data.status && data.status === 'ready') {
                this.postDateSelection();
            }
        }
    }

    trustURL(dashboardId) {
        const url = environment.scriptBaseURL + '/api/dashboards/' + dashboardId + '/content';
        this.contentURL = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    // send dashboard variables to iframe
    postVariables() {
        if (this.iframe && this.iframe.nativeElement.contentWindow) {
            // format variables to dict
            const variables = {};
            for (const item of this.dashboard.variables) {
                variables[item.name] = item;
            }
            const data = {type: 'variables', message: variables};
            this.iframe.nativeElement.contentWindow.postMessage(data, environment.scriptBaseURL);
        }
    }

    // send date selection to iframe
    postDateSelection() {
        if (this.iframe && this.iframe.nativeElement.contentWindow) {
            const data = {type: 'date_range_updated', message: this.dateSelection};
            this.iframe.nativeElement.contentWindow.postMessage(data, environment.scriptBaseURL);
        }
    }

    // load query and return result to iframe
    runQuery(queryName, params) {
        this.queryService.runQuery(this.dashboard.id, queryName, params).subscribe(resp => {
            const result = {result: {query_name: queryName, results: resp}};
            const data = {type: 'result', message: result};
            this.iframe.nativeElement.contentWindow.postMessage(data, environment.scriptBaseURL);
        });
    }
}
