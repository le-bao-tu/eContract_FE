import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentSignDetailComponent } from './document-sign-detail/document-sign-detail.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'validate-otp', pathMatch: 'full' },
      { path: 'validate-otp', component: DocumentSignDetailComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentSignRoutingModule {}
