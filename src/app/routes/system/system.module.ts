import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { AgGridModule } from 'ag-grid-angular';
import { SystemRoutingModule } from './system-routing.module';
import { UserItemComponent } from './user/user-item/user-item.component';
import { UserComponent } from './user/user/user.component';
import { OrganizationConfigComponent } from './organization/organization-config/organization-config.component';
import { OrganizationComponent } from './organization/organization.component';
import { PositionItemComponent } from './position/position-item/position-item.component';
import { PositionComponent } from './position/position/position.component';
import { SystemLogComponent } from './system-log/system-log/system-log.component';
import { AddRoleComponent } from './user-v2/add-role/add-role.component';
import { SignConfigComponent } from './user-v2/sign-config/sign-config.component';
import { UserV2Component } from './user-v2/user/user-v2.component';
import { OrganizationReportComponent } from './organization/organization-report/organization-report.component';
//22-9-2021 quan ly loai don vi
import { OrganizationTypeComponent } from './organization-type/organization-type/organization-type.component';
import { OrganizationTypeImportItemComponent } from './organization-type/organization-type-import-item/organization-type-import-item.component';
import { OrganizationTypeItemComponent } from './organization-type/organization-type-item/organization-type-item.component';
import { HsmAccountComponent } from './user-v2/hsm-account/hsm-account.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { CertifyModule } from '../certify/certify.module';
import { CustomerComponent } from './customer/customer.component';
import { UserModule } from '../user/user.module';
import { UserDeviceComponent } from './user-v2/user-device/user-device.component';

@NgModule({
  declarations: [
    UserComponent,
    UserItemComponent,
    OrganizationComponent,
    PositionComponent,
    UserV2Component,
    OrganizationConfigComponent,
    PositionItemComponent,
    AddRoleComponent,
    SignConfigComponent,
    SystemLogComponent,
    OrganizationReportComponent,
    //22-9-2021
    OrganizationTypeComponent,
    OrganizationTypeImportItemComponent,
    OrganizationTypeItemComponent,
    //
    HsmAccountComponent,
    //22-9-2021,
    DashboardComponent,
    CustomerComponent,
    UserDeviceComponent
  ],
  imports: [SharedModule, SystemRoutingModule, CertifyModule, AgGridModule.withComponents([]), UserModule],
})
export class SystemModule {}
