import { Component, OnDestroy, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { IAfterGuiAttachedParams } from 'ag-grid-community';

@Component({
  selector: 'app-status-import-cell-render',
  templateUrl: './is-required-cell-render.component.html',
  styleUrls: [],
})
export class IsRequiredCellRenderComponent implements ICellRendererAngularComp, OnInit, OnDestroy {
  constructor() {}

  params: any;

  checked = true;
  unChecked = false;
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

  ngOnDestroy() {
    // no need to remove the button click handler
    // https://stackoverflow.com/questions/49083993/does-angular-automatically-remove-template-event-listeners
  }
}
