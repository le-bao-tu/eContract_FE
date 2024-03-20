import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuComponent } from './menu/menu/menu.component';
import { RightComponent } from './right/right/right.component';
import { RoleComponent } from './role/role/role.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'user', pathMatch: 'full' },
      { path: 'role', component: RoleComponent },
      { path: 'menu', component: MenuComponent },
      { path: 'right', component: RightComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PermissionRoutingModule {}
