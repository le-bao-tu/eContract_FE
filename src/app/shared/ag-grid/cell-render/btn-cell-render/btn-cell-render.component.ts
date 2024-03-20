import { Component, OnDestroy, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { IAfterGuiAttachedParams } from 'ag-grid-community';

@Component({
  selector: 'app-btn-cell-render',
  templateUrl: './btn-cell-render.component.html',
})
export class BtnCellRenderComponent implements ICellRendererAngularComp, OnInit, OnDestroy {
  constructor() {}

  params: any;

  refresh(params: any): boolean {
    throw new Error('Method not implemented.');
  }

  afterGuiAttached?(params?: IAfterGuiAttachedParams): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {}

  agInit(params: any): void {
    this.params = params;
  }

  btnMetaDatConfigClickedHandler($event: any): any {
    // console.log(this.params.data);
    this.params.configClicked(this.params.data);
  }
  btnAddCertClickedHandler($event: any): any {
    // console.log(this.params.data);
    this.params.addCertClicked(this.params.data);
  }
  btnInfoCertClickedHandler($event: any): any {
    this.params.infoCertClicked(this.params.data);
  }
  btnListUserDeviceHandler($event: any): any {
    this.params.infoListUserDeviceClicked(this.params.data);
  }
  btnDownloadClickedHandler($event: any): any {
    this.params.downloadClicked(this.params.data);
  }
  btnAddUserRoleClickedHandler($event: any): any {
    // console.log(this.params.data);
    this.params.addUserRoleClicked(this.params.data);
  }
  btnAddRoleClickedHandler($event: any): any {
    // console.log(this.params.data);
    this.params.addRoleClicked(this.params.data);
  }
  btnSignConfigClickedHandler($event: any): any {
    // console.log(this.params.data);
    this.params.addSignConfigClicked(this.params.data);
  }
  // 22-9-2021
  btnHsmAccountClickedHandler($event: any): any {
    // button hsm-account
    this.params.addHsmAccountClicked(this.params.data);
  }
  // 22-9-2021
  btnLockClickedHandler($event: any): any {
    // console.log(this.params.data);
    this.params.lockClicked(this.params.data);
  }
  btnUnLockClickedHandler($event: any): any {
    // console.log(this.params.data);
    this.params.unlockClicked(this.params.data);
  }
  btnInfoClickedHandler($event: any): any {
    console.log(this.params.data);
    this.params.infoClicked(this.params.data);
  }
  btnDuplicateClickedHandler($event: any): any {
    // console.log(this.params.data);
    this.params.duplicateClicked(this.params.data);
  }

  btnEditClickedHandler($event: any): any {
    // console.log(this.params.data);
    this.params.editClicked(this.params.data);
  }

  btnDeleteClickedHandler($event: any): any {
    // console.log(this.params.data);
    this.params.deleteClicked(this.params.data);
  }
  btnEnterFormulaClickedHandler($event: any): any {
    // console.log(this.params.data);
    this.params.enterFormulaClicked(this.params.data);
  }

  btnAddClickedHandler($event: any): any {
    // console.log(this.params.data);
    this.params.addClicked(this.params.data);
  }

  ngOnDestroy(): any {
    // no need to remove the button click handler
    // https://stackoverflow.com/questions/49083993/does-angular-automatically-remove-template-event-listeners
  }

  btnUpdateUserRole($event: any): any {
    this.params.btnUpdateUserRole(this.params.data);
  }

  btnAddRightClickedHandler($event: any): any {
    this.params.addRightClickedHandler(this.params.data);
  }

  btnAddMenuClickedHandler($event: any): any {
    this.params.addMenuClickedHandler(this.params.data);
  }
}
