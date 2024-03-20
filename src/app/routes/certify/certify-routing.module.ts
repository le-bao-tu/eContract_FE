import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CertifyTypeComponent } from './certify-types/certify-type/certify-type.component';
import { DocumentTemplateConfigComponent } from './document-template/document-template-config/document-template-config.component';
import { DocumentTemplateComponent } from './document-template/document-template/document-template.component';
import { DocumentCreateComponent } from './document/document-create/document-create.component';
import { DocumentComponent } from './document/document/document.component';
import { InfoInCertifyComponent } from './info-in-certify/info-in-certify/info-in-certify.component';

const routes: Routes = [
  {
    path: '',
    // component: LayoutProComponent,
    children: [
      { path: '', redirectTo: 'certify-type', pathMatch: 'full' },
      { path: 'document', component: DocumentComponent },
      { path: 'certify-type', component: CertifyTypeComponent },
      { path: 'info-in-certify', component: InfoInCertifyComponent },
      { path: 'document-template', component: DocumentTemplateComponent },
      { path: 'document-template-config/:id', component: DocumentTemplateConfigComponent },
      { path: 'document-create', component: DocumentCreateComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CertifyRoutingModule {}
