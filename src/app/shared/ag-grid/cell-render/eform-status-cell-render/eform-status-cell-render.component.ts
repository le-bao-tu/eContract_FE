import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { IAfterGuiAttachedParams } from 'ag-grid-community';

@Component({
  selector: 'app-eform-status-cell-render',
  templateUrl: './eform-status-cell-render.component.html',
})
export class EformStatusCellRenderComponent implements ICellRendererAngularComp, OnInit, OnDestroy {
  constructor(@Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,) { }

  params: any;
  isConfirmDigitalSignature = false;
  isConfirmRequestCertificate = false;
  isNotConfirmDigitalSignature = false;
  isNotConfirmRequestCertificate = false;

  refresh(params: any): boolean {
    throw new Error('Method not implemented.');
  }
  afterGuiAttached?(params?: IAfterGuiAttachedParams): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void { }

  agInit(params: any): void {
    //console.log(params);
    this.params = params;
    this.isConfirmRequestCertificate = params.value !== `${this.i18n.fanyi('function.customer.eform-not-found.label')}` && params.value && params.value !== '' && params.value.includes(`${this.i18n.fanyi('function.customer.eform-confirm-request-certificate.label')}`);
    this.isConfirmDigitalSignature = params.value !== `${this.i18n.fanyi('function.customer.eform-not-found.label')}` && params.value && params.value !== '' && params.value.includes(`${this.i18n.fanyi('function.customer.eform-confirm-digital-signature.label')}`);
    this.isNotConfirmDigitalSignature = params.value !== `${this.i18n.fanyi('function.customer.eform-not-found.label')}` && params.data.userEFormInfo.confirmDigitalSignatureDocumentId && !params.data.userEFormInfo.isConfirmDigitalSignature && params.value !== `${this.i18n.fanyi('function.customer.eform-confirm-digital-signature.label')}`
    this.isNotConfirmRequestCertificate = params.value !== `${this.i18n.fanyi('function.customer.eform-not-found.label')}` && params.data.userEFormInfo.requestCertificateDocumentId && !params.data.userEFormInfo.isConfirmRequestCertificate && params.value !== `${this.i18n.fanyi('function.customer.eform-confirm-request-certificate.label')}`
  }

  ngOnDestroy(): any {
    // no need to remove the button click handler
    // https://stackoverflow.com/questions/49083993/does-angular-automatically-remove-template-event-listeners
  }

  btnDaKyCTS($event: any): any {
    this.params.btnDaKyCTS(this.params.data);
  }

  btnDaKyGDDTAT($event: any): any {
    this.params.btnDaKyGDDTAT(this.params.data);
  }

  btnChuaKyCTS($event: any): any {
    this.params.chuaKyCTSClick(this.params.data);
  }

  btnChuaKyGDDT($event: any): any {
    this.params.chuaKyGDDTClick(this.params.data);
  }
}
