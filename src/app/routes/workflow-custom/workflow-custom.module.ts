import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { AgGridModule } from 'ag-grid-angular';
import { WorkflowCustomRoutingModule } from './workflow-custom-routing.module';
import { ContactItemComponent } from './contact/contact-item/contact-item.component';
import { ContactComponent } from './contact/contact/contact.component';
import { WorkflowImportItemComponent } from './workflow/workflow-import-item/workflow-import-item.component';
import { WorkflowItemComponent } from './workflow/workflow-item/workflow-item.component';
import { WorkflowComponent } from './workflow/workflow/workflow.component';
import { WorkflowStateComponent } from './workflow-state/workflow-state/workflow-state.component';
import { WorkflowStateItemComponent } from './workflow-state/workflow-state-item/workflow-state-item.component';
import { SignConfigComponent } from './sign-config/sign-config/sign-config.component';
import { SignConfigItemComponent } from './sign-config/sign-config-item/sign-config-item.component';
import { NotifyConfigItemComponent } from './notify-config/notify-config-item/notify-config-item.component';
import { NotifyConfigComponent } from './notify-config/notify-config/notify-config.component';
@NgModule({
  declarations: [
    ContactComponent,
    ContactItemComponent,
    WorkflowComponent,
    WorkflowItemComponent,
    WorkflowImportItemComponent,
    WorkflowStateComponent,
    WorkflowStateItemComponent,
    NotifyConfigComponent,
    NotifyConfigItemComponent,
    SignConfigComponent,
    SignConfigItemComponent,
  ],
  imports: [SharedModule, CommonModule, WorkflowCustomRoutingModule, AgGridModule.withComponents([])],
  exports: [WorkflowItemComponent]
})
export class WorkflowCustomModule { }
