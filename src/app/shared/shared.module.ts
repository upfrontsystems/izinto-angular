import { NgModule } from '@angular/core';

import { AccordionAnchorDirective, AccordionLinkDirective, AccordionDirective } from './accordion';
import {AlertComponent, AlertNotificationComponent} from './alert/alert.component';
import { MenuItems } from './menu-items/menu-items';

@NgModule({
    declarations: [
        AccordionAnchorDirective,
        AccordionLinkDirective,
        AccordionDirective,
        AlertComponent,
        AlertNotificationComponent,
    ],
    exports: [
        AccordionAnchorDirective,
        AccordionLinkDirective,
        AccordionDirective,
        AlertComponent,
        AlertNotificationComponent,
    ],
    entryComponents: [
        AlertNotificationComponent,
    ],
    providers: [MenuItems]
})
export class SharedModule {}
