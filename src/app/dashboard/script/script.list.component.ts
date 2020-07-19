import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import {Script} from '../../_models/script';
import {ScriptService} from '../../_services/script.service';
import {ScriptDialogComponent} from './script.dialog.component';
import {AuthenticationService} from '../../_services/authentication.service';
import {DomSanitizer} from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-script-list',
    templateUrl: './script.list.component.html',
    styleUrls: ['./../dashboard.component.scss']
})
export class ScriptListComponent implements OnInit, OnChanges {

    @Input() dashboardId: number;
    @Input() addedScript: Script;
    public scripts: Script[] = [];
    canEdit = false;

    constructor(private sanitizer: DomSanitizer,
                protected http: HttpClient,
                protected dialog: MatDialog,
                protected authService: AuthenticationService,
                protected scriptService: ScriptService) {}

    ngOnChanges(changes) {
        if (changes.addedScript && changes.addedScript.currentValue) {
            const script = changes.addedScript.currentValue;
            this.scripts.push(script);
        } else if (changes.dateRange && changes.dateRange.currentValue) {
            return;
        } else if (changes.dashboardId && !changes.dashboardId.firstChange) {
            this.getScripts();
        }
    }

    ngOnInit() {
        this.getScripts();
        this.canEdit = this.authService.hasRole('Administrator');
    }

    getScripts() {
        this.scriptService.getScripts({dashboard_id: this.dashboardId}).subscribe(resp => {
            this.scripts = resp;
        });
    }

    getScriptURL(script_id) {
        const url = environment.scriptBaseURL + '/api/script/' + script_id + '/html';
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    trackById(index, script) {
        return script.id;
    }

    editScript(record) {
        let script = new Script();
        for (const ix in this.scripts) {
            if (this.scripts[ix].id === record.id) {
                script = this.scripts[ix];
                break;
            }
        }
        const dialogRef = this.dialog.open(ScriptDialogComponent, {
            width: '600px',
            data: {script: script},
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                for (const ix in this.scripts) {
                    if (this.scripts[ix].id === result.id) {
                        this.scripts[ix] = result;
                        break;
                    }
                }
            }
        });
    }

    deleteScript(record) {
        this.scriptService.delete(record).subscribe(resp => {
            for (const ix in this.scripts) {
                if (this.scripts[ix].id === record.id) {
                    this.scripts.splice(+ix, 1);
                    break;
                }
            }
        });
    }

}
