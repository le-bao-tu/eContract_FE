import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { AgGridModule } from 'ag-grid-angular';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DocumentInfoSignComponent } from './document-info-sign/document-info-sign.component';
import { DocumentListCertComponent } from './document-list-cert/document-list-cert.component';
import { DocumentOtpSignComponent } from './document-otp-sign/document-otp-sign.component';

import { DocumentSignDetailComponent } from './document-sign-detail/document-sign-detail.component';
import { DocumentSignRoutingModule } from './document-sign-routing.module';

@NgModule({
  declarations: [DocumentSignDetailComponent, DocumentListCertComponent, DocumentOtpSignComponent, DocumentInfoSignComponent],
  imports: [CommonModule, PdfViewerModule, SharedModule, DocumentSignRoutingModule, AgGridModule.withComponents([])],
  exports: [DocumentSignDetailComponent, DocumentListCertComponent, DocumentOtpSignComponent, DocumentInfoSignComponent],
})
export class DocumentSignModule {}
