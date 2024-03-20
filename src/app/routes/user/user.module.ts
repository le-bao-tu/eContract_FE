import { CertDetailComponent } from './cert-detail/cert-detail.component';
import { UserV2ItemComponent } from './user-item/user-item-v2.component';

import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { AgGridModule } from 'ag-grid-angular';

@NgModule({
  declarations: [UserV2ItemComponent, CertDetailComponent],
  imports: [SharedModule, AgGridModule.withComponents([])],
  exports: [UserV2ItemComponent, CertDetailComponent],
})
export class UserModule {}
