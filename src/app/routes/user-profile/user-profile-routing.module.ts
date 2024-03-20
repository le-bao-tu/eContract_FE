import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CertificateComponent } from './certificates/certificate/certificate.component';
import { UpdateUserInformationComponent } from './update-user-information/update-user-information.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'certificate', pathMatch: 'full' },
      { path: 'certificate', component: CertificateComponent },
      { path: 'update-user-info', component: UpdateUserInformationComponent },
    ],
  },
];
// /user-profile/certificate
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserProfileRoutingModule {}
