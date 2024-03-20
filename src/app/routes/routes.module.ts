import { NgModule, Type } from '@angular/core';

import { SharedModule } from '@shared';
// single pages
import { CallbackComponent } from './callback/callback.component';
// dashboard pages
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserLockComponent } from './passport/lock/lock.component';
// passport pages
import { UserLoginComponent } from './passport/login/login.component';
import { UserRegisterResultComponent } from './passport/register-result/register-result.component';
import { UserRegisterComponent } from './passport/register/register.component';
import { RouteRoutingModule } from './routes-routing.module';

import { AgGridModule } from 'ag-grid-angular';

import {
  BtnCellRenderComponent,
  BtnSwitchRenderComponent,
  ChangeStateCellRenderComponent,
  StatusCellRenderComponent,
  StatusDeleteCellRenderComponent,
  StatusImportCellRenderComponent,
  StatusNameCellRenderComponent,
  StatusSignResponseCellRenderComponent,
  StatusUserCellRenderComponent,
  EformStatusCellRenderComponent,
  DocumentCellRenderComponent,
} from '@shared';

import { LayoutModule } from '../layout/layout.module';
import { AgGridComponent } from './ag-grid/demo/ag-grid.component';
import { HomeComponent } from './home/home.component';
import { ConfirmComponent } from './passport/confirm/confirm.component';
import { LogoutComponent } from './passport/logout/logout.component';
import { SystemModule } from './system/system.module';

const COMPONENTS: Type<void>[] = [
  //DashboardComponent,
  // passport pages
  UserLoginComponent,
  UserRegisterComponent,
  UserRegisterResultComponent,
  UserLockComponent,
  // single pages
  CallbackComponent,
  // Ag-grid
  AgGridComponent,
  StatusCellRenderComponent,
  StatusNameCellRenderComponent,
  StatusUserCellRenderComponent,
  StatusDeleteCellRenderComponent,
  ChangeStateCellRenderComponent,
  StatusImportCellRenderComponent,
  StatusSignResponseCellRenderComponent,
  EformStatusCellRenderComponent,
  BtnCellRenderComponent,
  BtnSwitchRenderComponent,
  DocumentCellRenderComponent,
];
const COMPONENTS_NOROUNT: Type<void>[] = [];

@NgModule({
  imports: [LayoutModule, SharedModule, RouteRoutingModule, AgGridModule.withComponents([]), SystemModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT, HomeComponent, ConfirmComponent, LogoutComponent],
  entryComponents: COMPONENTS_NOROUNT,
})
export class RoutesModule {}
