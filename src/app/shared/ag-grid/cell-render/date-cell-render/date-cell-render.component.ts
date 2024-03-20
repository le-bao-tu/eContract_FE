import { Component, OnDestroy, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { IAfterGuiAttachedParams } from 'ag-grid-community';

import * as moment from 'moment';

@Component({
  selector: 'app-date-cell-render',
  templateUrl: './date-cell-render.component.html',
  styleUrls: [],
})
export class DateCellRenderComponent implements ICellRendererAngularComp, OnInit, OnDestroy {
  constructor() { }

  params: any;
  dateFormat = '';

  refresh(params: any): boolean {
    throw new Error('Method not implemented.');
  }
  afterGuiAttached?(params?: IAfterGuiAttachedParams): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void { }

  agInit(params: any): void {
    this.params = params;

    if (params.value)
      this.dateFormat = moment(params.value).format('DD/MM/YYYY HH:mm:ss');
    else
      this.dateFormat = '';
  }

  ngOnDestroy() {
    // no need to remove the button click handler
    // https://stackoverflow.com/questions/49083993/does-angular-automatically-remove-template-event-listeners
  }
}
