import { NgModule } from '@angular/core';

import { AccordionAnchorDirective, AccordionLinkDirective, AccordionDirective } from './accordion';
import {AlertComponent, AlertNotificationComponent} from './alert/alert.component';
import { MouseListenerDirective } from './mouse-listener/mouse.listener.directive';

@NgModule({
    declarations: [
        AccordionAnchorDirective,
        AccordionLinkDirective,
        AccordionDirective,
        AlertComponent,
        AlertNotificationComponent,
        MouseListenerDirective
    ],
    exports: [
        AccordionAnchorDirective,
        AccordionLinkDirective,
        AccordionDirective,
        AlertComponent,
        AlertNotificationComponent,
        MouseListenerDirective
    ],
    entryComponents: [
        AlertNotificationComponent,
    ],
})
export class SharedModule {}
