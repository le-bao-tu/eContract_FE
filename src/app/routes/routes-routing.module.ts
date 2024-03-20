import { JWTGuard } from '@delon/auth';
import { HomeComponent } from './home/home.component';

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// layout
import { LayoutProComponent } from '@brand';
import { environment } from '@env/environment';
// single pages
import { CallbackComponent } from './callback/callback.component';
// dashboard pages
import { DashboardComponent } from './dashboard/dashboard.component';
// passport pages
import { UserLoginComponent } from './passport/login/login.component';

import { AgGridComponent } from './ag-grid/demo/ag-grid.component';
import { ConfirmComponent } from './passport/confirm/confirm.component';
import { LogoutComponent } from './passport/logout/logout.component';
// import { AuthGuard } from '../init/app.guard';

const routes: Routes = [
  // { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: '',
    component: LayoutProComponent,
    canLoad: [JWTGuard],
    // canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'ag-grid', component: AgGridComponent },
      // Exception
      {
        path: 'exception',
        loadChildren: () => import('./exception/exception.module').then((m) => m.ExceptionModule),
      },
      {
        path: 'res',
        loadChildren: () => import('./resource/resource.module').then((m) => m.ResourceModule),
      },
      {
        path: 'certify',
        loadChildren: () => import('./certify/certify.module').then((m) => m.CertifyModule),
      },
      {
        path: 'workflow',
        loadChildren: () => import('./workflow-custom/workflow-custom.module').then((m) => m.WorkflowCustomModule),
      },
      {
        path: 'user-profile',
        loadChildren: () => import('./user-profile/user-profile.module').then((m) => m.UserProfileModule),
      },
      {
        path: 'system',
        loadChildren: () => import('./system/system.module').then((m) => m.SystemModule),
      },
      {
        path: 'resource',
        loadChildren: () => import('./resource/resource.module').then((m) => m.ResourceModule),
      },
      {
        path: 'permission',
        loadChildren: () => import('./permission/permission.module').then((m) => m.PermissionModule),
      },
    ],
  },
  {
    path: 'confirm',
    component: ConfirmComponent,
    // canActivate: [AuthGuard]
  },
  {
    path: 'logout',
    component: LogoutComponent,
  },
  {
    path: '',
    loadChildren: () => import('./document-sign/document-sign.module').then((m) => m.DocumentSignModule),
    // canActivate: [AuthGuard]
  },
  {
    path: 'passport',
    // component: LayoutPassportComponent,
    children: [
      {
        path: 'login',
        component: UserLoginComponent,
        data: { title: 'Đăng nhập', titleI18n: 'app.login.login' },
      },
    ],
  },
  {
    path: 'home',
    redirectTo: 'dashboard',
    // canActivate: [AuthGuard]
    // component: HomeComponent,
    // canLoad: [JWTGuard],
    // data: { title: 'Trang chủ' },
  },
  // Single page not wrapped Layout
  { path: 'callback/:type', component: CallbackComponent },
  { path: '**', redirectTo: 'exception/404' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: environment.useHash,
      scrollPositionRestoration: 'top',
    }),
  ],
  exports: [RouterModule],
})
export class RouteRoutingModule {}
