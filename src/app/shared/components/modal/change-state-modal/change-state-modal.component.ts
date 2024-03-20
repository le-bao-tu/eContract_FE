import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { GridModel } from '@model';

import { DOCUMENT } from '@angular/common';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { OVERLAY_LOADING_TEMPLATE, OVERLAY_NOROW_TEMPLATE } from '@util';
import { ChangeStateCellRenderComponent, ChangeStatusCellRenderComponent, StatusCellRenderComponent } from 'src/app/shared/ag-grid';
import { StatusDeleteCellRenderComponent } from '../../../ag-grid/cell-render/status-delete-cell-render/status-delete-cell-render.component';
@Component({
  selector: 'app-change-state-modal',
  templateUrl: './change-state-modal.component.html',
  styleUrls: ['./change-state-modal.component.less'],
})
export class ChangeStateModalComponent implements OnInit {
  @Input() isVisible = false;
  @Output() eventEmmit = new EventEmitter<any>();

  message = '';
  header = '';
  btnLockLabel = '';
  btnUnLockLabel = '';
  btnCancelLabel = '';

  type = true;

  isLoading = false;
  confirm = false;
  listItem: any[] = [];

  gridApi: any = {};
  gridColumnApi: any = {};
  columnDefs: any = {};
  defaultColDef: any = {};
  frameworkComponents: any = {};
  overlayLoadingTemplate = OVERLAY_LOADING_TEMPLATE;
  overlayNoRowsTemplate = OVERLAY_NOROW_TEMPLATE;

  grid: GridModel = {
    dataCount: 0,
    rowData: [],
    totalData: 0,
  };

  constructor(public settings: SettingsService, @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, @Inject(DOCUMENT) private doc: any) {
    this.columnDefs = [
      { field: 'index', headerName: `${this.i18n.fanyi('layout.grid.index')}`, width: 100 },
      { field: 'name', headerName: `${this.i18n.fanyi('lock-modal.grid.name')}`, sortable: true, minWidth: 150, flex: 1 },
      { field: 'result', headerName: `${this.i18n.fanyi('lock-modal.grid.result')}`, cellRenderer: 'statusChangeCellRender', width: 180 },
      { field: 'message', headerName: `${this.i18n.fanyi('lock-modal.grid.message')}`, minWidth: 150, flex: 1 },
    ];
    this.defaultColDef = {
      // flex: 1,
      minWidth: 20,
      resizable: true,
    };
    this.frameworkComponents = {
      statusChangeCellRender: ChangeStateCellRenderComponent,
    };
    this.header = `${this.i18n.fanyi('change-state-modal.header')}`;
    this.btnLockLabel = `${this.i18n.fanyi('change-state-modal.button.btn-lock')}`;
    this.btnUnLockLabel = `${this.i18n.fanyi('change-state-modal.button.btn-unlock')}`;
    this.btnCancelLabel = `${this.i18n.fanyi('layout.button.btn-cancel.label')}`;
  }

  handleCancel($event: any): void {
    this.isVisible = false;
    if (this.confirm) {
      this.eventEmmit.emit({ type: 'success' });
    } else {
      this.eventEmmit.emit({ type: 'close' });
    }
  }

  ngOnInit(): void { }

  public updateIsLoading(isLoading: boolean): void {
    this.isLoading = isLoading;
  }

  public initData(data: any[], message: string = '', type: boolean): void {
    this.isVisible = true;
    this.confirm = false;
    this.message = message;
    this.listItem = [];
    this.type = type;
    let i = 0;
    for (const item of data) {
      this.listItem.push({
        index: ++i,
        id: item.id,
        name: item.name,
        result: null,
        message: '',
      });
    }
    this.grid.rowData = [];
    this.grid.rowData = [...this.listItem];
  }

  public updateData(data: any[] = []): void {
    if (data === null || data === undefined || data.length === 0) {
      this.confirm = true;
      this.isLoading = false;
      for (const item of this.listItem) {
        item.result = false;
        item.message = 'Có lỗi xảy ra!';
      }
      this.grid.rowData = [];
      this.grid.rowData = [...this.listItem];
    } else {
      this.confirm = true;
      this.isLoading = false;
      for (const item of this.listItem) {
        const dt = data.find((x) => x.id === item.id);
        if (dt) {
          item.result = dt.result;
          item.message = dt.message;
        }
      }
      this.grid.rowData = [];
      this.grid.rowData = [...this.listItem];
    }
  }

  confirmFunction($event: any): void {
    this.eventEmmit.emit({ type: 'confirm', listId: this.listItem.map(({ id }) => id) });
  }

  closeModalReloadData($event: any): void {
    this.isVisible = false;
    this.eventEmmit.emit({ type: 'success' });
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.grid.rowData = this.listItem;
  }
}
