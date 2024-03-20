import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserProfileRoutingModule } from './user-profile-routing.module';
import { CertificateComponent } from './certificates/certificate/certificate.component';
import { SharedModule } from '@shared';
import { AgGridModule } from 'ag-grid-angular';
import { CertificateItemComponent } from './certificates/certificate-item/certificate-item.component';
import { CertificateRegisterComponent } from './certificates/certificate-register/certificate-register.component';
import { UpdateUserInformationComponent } from './update-user-information/update-user-information.component';

@NgModule({
  declarations: [
    CertificateComponent,
    CertificateItemComponent,
    CertificateRegisterComponent,
    UpdateUserInformationComponent
  ],
  imports: [
    CommonModule,
    UserProfileRoutingModule,
    SharedModule,
    AgGridModule.withComponents([])],
})
export class UserProfileModule {}
