import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationComponent } from './organization/organization.component';
import { PositionComponent } from './position/position/position.component';
import { SystemLogComponent } from './system-log/system-log/system-log.component';
import { UserV2Component } from './user-v2/user/user-v2.component';
import { OrganizationTypeComponent } from './organization-type/organization-type/organization-type.component';
import { CustomerComponent } from './customer/customer.component';
const routes: Routes = [
  {
    path: '',
    // component: LayoutProComponent,
    children: [
      { path: '', redirectTo: 'user', pathMatch: 'full' },
      { path: 'user', component: UserV2Component },
      { path: 'organization', component: OrganizationComponent },
      { path: 'log', component: SystemLogComponent },
      { path: 'position', component: PositionComponent },
      { path: 'organization-type', component: OrganizationTypeComponent },
      { path: 'customer', component: CustomerComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SystemRoutingModule {}
