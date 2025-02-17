import { Component, OnDestroy, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { IAfterGuiAttachedParams } from 'ag-grid-community';

@Component({
  selector: 'app-status-user-cell-render',
  templateUrl: './status-user-cell-render.component.html',
  styleUrls: [],
})
export class StatusUserCellRenderComponent implements ICellRendererAngularComp, OnInit, OnDestroy {
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
    // console.log(params);
    this.params = params;
  }

  ngOnDestroy(): any {
    // no need to remove the button click handler
    // https://stackoverflow.com/questions/49083993/does-angular-automatically-remove-template-event-listeners
  }
}
