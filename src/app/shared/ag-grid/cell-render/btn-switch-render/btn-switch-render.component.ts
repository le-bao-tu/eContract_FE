import { Component, OnDestroy, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { IAfterGuiAttachedParams } from 'ag-grid-community';

@Component({
  selector: 'app-btn-cell-render',
  templateUrl: './btn-switch-render.component.html',
})
export class BtnSwitchRenderComponent implements ICellRendererAngularComp, OnInit, OnDestroy {
  constructor() {}
  ngOnDestroy(): void {}
  params: any;
  HSM = 1;
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

  btnInfoClickedHandler($event: any): any {
    // console.log(this.params.data);
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
}
