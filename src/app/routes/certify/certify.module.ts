import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { AgGridModule } from 'ag-grid-angular';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DocumentSignModule } from '../document-sign/document-sign.module';

import { DocumentMetaDataConfigModule } from './../../document-meta-data-config/document-meta-data-config.module';

import { CertifyRoutingModule } from './certify-routing.module';
import { CertifyTypeImportItemComponent } from './certify-types/certify-type-import-item/certify-type-import-item.component';
import { CertifyTypeItemComponent } from './certify-types/certify-type-item/certify-type-item.component';
import { CertifyTypeComponent } from './certify-types/certify-type/certify-type.component';
import { DocumentTemplateConfigComponent } from './document-template/document-template-config/document-template-config.component';
import { DocumentTemplateItemComponent } from './document-template/document-template-item/document-template-item.component';
import { DocumentTemplateComponent } from './document-template/document-template/document-template.component';
import { DocumentCreateComponent } from './document/document-create/document-create.component';
import { DocumentItemComponent } from './document/document-item/document-item.component';
import { DocumentSendMailComponent } from './document/document-send-mail/document-send-mail.component';
import { DocumentSignComponent } from './document/document-sign/document-sign.component';
import { DocumentComponent } from './document/document/document.component';
import { InfoInCertifyImportItemComponent } from './info-in-certify/info-in-certify-import-item/info-in-certify-import-item.component';
import { InfoInCertifyItemComponent } from './info-in-certify/info-in-certify-item/info-in-certify-item.component';
import { InfoInCertifyComponent } from './info-in-certify/info-in-certify/info-in-certify.component';
import { DocumentRenewComponent } from './document/document-renew/document-renew.component';
import { UserModule } from '../user/user.module';
import { WorkflowCustomModule } from '../workflow-custom/workflow-custom.module';

@NgModule({
  declarations: [
    CertifyTypeComponent,
    CertifyTypeItemComponent,
    CertifyTypeImportItemComponent,
    InfoInCertifyComponent,
    InfoInCertifyItemComponent,
    InfoInCertifyImportItemComponent,
    DocumentTemplateComponent,
    DocumentTemplateItemComponent,
    DocumentTemplateConfigComponent,
    DocumentCreateComponent,
    DocumentComponent,
    DocumentItemComponent,
    DocumentSendMailComponent,
    DocumentSignComponent,
    DocumentRenewComponent,
  ],
  imports: [
    CommonModule,
    DocumentMetaDataConfigModule,
    PdfViewerModule,
    CertifyRoutingModule,
    SharedModule,
    AgGridModule.withComponents([]),
    DocumentSignModule,
    UserModule,
    WorkflowCustomModule
  ],
  exports: [DocumentItemComponent],
})
export class CertifyModule { }
