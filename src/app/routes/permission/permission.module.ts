import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { PermissionRoutingModule } from './permission-routing.module';
import { AgGridModule } from 'ag-grid-angular';
import { RoleComponent } from './role/role/role.component';
import { RoleItemComponent } from './role/role-item/role-item.component';
import { RoleDataPermissionComponent } from './role/role-data-permission/role-data-permission.component';
import { RoleUserComponent } from './role/role-user/role-user.component';
import { MenuComponent } from './menu/menu/menu.component';
import { RightComponent } from './right/right/right.component';
import { RoleRightComponent } from './role/role-right/role-right.component';
import { RoleMenuComponent } from './role/role-menu/role-menu.component';

@NgModule({
  declarations: [
    RoleComponent,
    RoleItemComponent,
    RoleDataPermissionComponent,
    RoleUserComponent,
    MenuComponent,
    RightComponent,
    RoleRightComponent,
    RoleMenuComponent,
  ],
  imports: [SharedModule, PermissionRoutingModule, AgGridModule.withComponents([])],
})
export class PermissionModule {}
