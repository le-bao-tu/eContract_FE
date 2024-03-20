import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactComponent } from './contact/contact/contact.component';
import { WorkflowStateComponent } from './workflow-state/workflow-state/workflow-state.component';
import { WorkflowComponent } from './workflow/workflow/workflow.component';
import { SignConfigComponent } from './sign-config/sign-config/sign-config.component';
import { NotifyConfigComponent } from './notify-config/notify-config/notify-config.component';
const routes: Routes = [
  {
    path: '',
    // component: LayoutProComponent,
    children: [
      { path: 'contact/:id', component: ContactComponent },
      { path: 'management/:id', component: WorkflowComponent },
      { path: 'workflow-state', component: WorkflowStateComponent },
      { path: 'notify-config', component: NotifyConfigComponent },
      { path: 'user-sign-config', component: SignConfigComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkflowCustomRoutingModule {}
