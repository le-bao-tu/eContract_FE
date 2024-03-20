import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GridModel } from '@model';

import { OVERLAY_LOADING_TEMPLATE, OVERLAY_NOROW_TEMPLATE } from '@util';
import { StatusSignResponseCellRenderComponent } from '../../../ag-grid/cell-render/status-sign-response-cell-render/status-sign-response-cell-render.component';

@Component({
  selector: 'sign-response-modal',
  templateUrl: './sign-response-modal.component.html',
  styleUrls: ['./sign-response-modal.component.less'],
})
export class SignResponseModalComponent implements OnInit {
  @Input() isVisible = false;
  @Output() eventEmmit = new EventEmitter<any>();

  message = '';

  isLoading = false;
  completeDelete = false;
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

  constructor() {
    this.columnDefs = [
      { headerName: 'STT', field: 'index', width: 50 },
      { field: 'documentName', headerName: 'Tên tài liệu', sortable: true, minWidth: 150, flex: 1 },
      { field: 'isSuccess', headerName: 'Trạng thái', cellRenderer: 'statusSignResponseCellRender', width: 150 },
      { field: 'message', headerName: 'Mô tả', minWidth: 150, flex: 1 },
    ];
    this.defaultColDef = {
      // flex: 1,
      minWidth: 20,
      resizable: true,
    };
    this.frameworkComponents = {
      statusSignResponseCellRender: StatusSignResponseCellRenderComponent,
    };
  }

  handleCancel($event: any): void {
    this.isVisible = false;
    if (this.completeDelete) {
      this.eventEmmit.emit({ type: 'success' });
    } else {
      this.eventEmmit.emit({ type: 'close' });
    }
  }

  ngOnInit(): void {}

  public updateIsLoading(isLoading: boolean): void {
    this.isLoading = isLoading;
  }

  public initData(data: any, message: string = ''): void {
    this.isVisible = true;
    this.completeDelete = false;
    this.message = message;
    this.listItem = [];
    let i = 0;
    for (const item of data.dataResult) {
      this.listItem.push({
        index: ++i,
        documentName: item.documentName,
        isSuccess: item.isSuccess,
        message: item.message,
      });
    }
    this.grid.rowData = [];
    this.grid.rowData = [...this.listItem];
  }

  confirmDelete($event: any): void {
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
