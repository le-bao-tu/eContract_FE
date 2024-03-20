import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ACLService } from '@delon/acl';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';
import { DocumentTemplateApiService } from './../../../../services/api/document-template-api.service';
import { DocumentTemplateItemComponent } from './../document-template-item/document-template-item.component';

import * as moment from 'moment';
import PerfectScrollbar from 'perfect-scrollbar';

import { NzModalService } from 'ng-zorro-antd/modal';

import { ButtonModel, GridModel, QueryFilerModel } from '@model';
import {
  EXCEL_STYLES_DEFAULT,
  LIST_STATUS,
  OVERLAY_LOADING_TEMPLATE,
  OVERLAY_NOROW_TEMPLATE,
  PAGE_SIZE_OPTION_DEFAULT,
  QUERY_FILTER_DEFAULT,
} from '@util';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { CertifyTypeApiService, InfoInCertifyApiService } from '@service';
import { BtnCellRenderComponent, DateCellRenderComponent, DeleteModalComponent, StatusNameCellRenderComponent } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-document-template',
  templateUrl: './document-template.component.html',
  styleUrls: ['./document-template.component.less'],
})
export class DocumentTemplateComponent implements OnInit {
  detailCellRenderer: any;

  constructor(
    private router: Router,
    private documentTemplateApiService: DocumentTemplateApiService,
    private aclService: ACLService,
    private notification: NzNotificationService,
    private elementRef: ElementRef,
    private infoInCertifyApiService: InfoInCertifyApiService,
    private certifyTypeApiService: CertifyTypeApiService,
    private modalService: NzModalService,
    private messageService: NzMessageService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {
    //#region ag-grid
    this.columnDefs = [
      {
        field: 'index',
        headerName: `${this.i18n.fanyi('layout.grid.index')}`,
        width: 110,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
        cellRenderer: 'agGroupCellRenderer',
      },
      { field: 'code', headerName: `${this.i18n.fanyi('function.document-template.grid.code')}`, minWidth: 180, flex: 1 },
      {
        field: 'name',
        headerName: `${this.i18n.fanyi('function.document-template.grid.name')}`,
        sortable: true,
        filter: true,
        minWidth: 180,
        flex: 1,
      },
      {
        field: 'documentTypeName',
        headerName: `${this.i18n.fanyi('function.document-template.grid.documenttypename')}`,
        sortable: true,
        filter: true,
        minWidth: 180,
        flex: 1,
      },
      {
        field: 'createdDate',
        headerName: `${this.i18n.fanyi('function.document-template.grid.createddate')}`,
        minWidth: 150,
        cellRenderer: 'dateCellRender',
      },
      {
        field: 'validDate',
        headerName: `${this.i18n.fanyi('function.document-template.grid.valid-date')}`,
        minWidth: 150,
      },
      {
        field: 'statusName',
        headerName: `${this.i18n.fanyi('function.document-template.grid.statusname')}`,
        minWidth: 150,
        cellRenderer: 'statusNameCellRenderComponent',
      },
      {
        headerName: `${this.i18n.fanyi('layout.grid.action')}`,
        minWidth: 200,
        cellRenderer: 'btnCellRender',
        cellRendererParams: {
          configClicked: (item: any) => this.onConfigItem(item),
          infoClicked: (item: any) => this.onViewItem(item),
          editClicked: (item: any) => this.onEditItem(item),
          duplicateClicked: (item: any) => this.onDuplicateItem(item),
          deleteClicked: (item: any) => this.onDeleteItem(item),
        },
      },
    ];
    this.defaultColDef = {
      // flex: 1,
      minWidth: 100,
      resizable: true,
    };
    this.frameworkComponents = {
      btnCellRender: BtnCellRenderComponent,
      dateCellRender: DateCellRenderComponent,
      statusNameCellRenderComponent: StatusNameCellRenderComponent,
    };
    this.excelStyles = [...EXCEL_STYLES_DEFAULT];

    this.detailCellRendererParams = {
      // provide the Grid Options to use on the Detail Grid
      detailGridOptions: {
        columnDefs: [
          {
            field: 'code',
            headerName: `${this.i18n.fanyi('function.document-template.grid.code')}`,
            minWidth: 180,
            flex: 1,
            onCellDoubleClicked: (item: any) => this.GetItem(item.data),
          },
          {
            field: 'name',
            headerName: `${this.i18n.fanyi('function.document-template.grid.name')}`,
            sortable: true,
            filter: true,
            minWidth: 180,
            flex: 1,
            onCellDoubleClicked: (item: any) => this.GetItem(item.data),
          },
          {
            field: 'documentTypeName',
            headerName: `${this.i18n.fanyi('function.document-template.grid.documenttypename')}`,
            sortable: true,
            filter: true,
            minWidth: 180,
            flex: 1,
            onCellDoubleClicked: (item: any) => this.GetItem(item.data),
          },
          {
            field: 'createdDate',
            headerName: `${this.i18n.fanyi('function.document-template.grid.createddate')}`,
            minWidth: 150,
            cellRenderer: 'dateCellRender',
            onCellDoubleClicked: (item: any) => this.GetItem(item.data),
          },
          {
            field: 'validDate',
            headerName: `${this.i18n.fanyi('function.document-template.grid.valid-date')}`,
            minWidth: 150,
            onCellDoubleClicked: (item: any) => this.GetItem(item.data),
          },
          {
            field: 'statusName',
            headerName: `${this.i18n.fanyi('function.document-template.grid.statusname')}`,
            minWidth: 150,
            cellRenderer: 'statusNameCellRenderComponent',
            onCellDoubleClicked: (item: any) => this.GetItem(item.data),
          },
        ],
      },
      // get the rows for each Detail Grid
      getDetailRowData: (params: any) => {
        let dataResult: any = [];

        let model = {
          groupCode: params.data.groupCode ? params.data.groupCode : params.data.code,
        };
        this.documentTemplateApiService.getListDocumentTemplateByGroupCode(model).subscribe(
          (res) => {
            dataResult = res.data;

            for (const item of dataResult) {
              item.statusName = !item.checkSignConfig ? 'Chưa có vùng ký' : item.status ? 'Đang áp dụng' : 'Ngừng áp dụng';
              item.createdDate = moment(item.createdDate).format('DD/MM/YYYY HH:mm:ss');
              if (item.fromDate) item.validDate = moment(item.fromDate).format('DD/MM/YYYY');
            }

            params.successCallback(dataResult);
          },
          (err) => console.log(err),
        );
      },
    };
    //#endregion ag-grid

    //#region Init button
    this.btnAdd = {
      title: 'Thêm mới',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-add.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.onAddItem();
      },
    };
    this.btnExportExcel = {
      title: 'Export excel',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.onExportExcel();
      },
    };
    this.btnDelete = {
      title: 'Xóa',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-delete.label')}`,
      visible: false,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.onDeleteItem();
      },
    };
    this.btnSearch = {
      title: 'Tìm kiếm',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.initGridData();
      },
    };
    this.btnResetSearch = {
      title: 'Đặt lại',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.onResetSearch(false);
      },
    };
    this.btnReload = {
      title: 'Tải lại',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-reload.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.onResetSearch(true);
      },
    };
    //#endregion Init button
  }
  @ViewChild(DocumentTemplateItemComponent, { static: false }) itemModal!: { initData: (arg0: {}, arg1: string, option: any) => void };
  @ViewChild(DeleteModalComponent, { static: false }) deleteModal!: {
    initData: (arg0: any, arg1: string) => void;
    updateIsLoading: (arg0: boolean) => void;
    updateData: (arg0: undefined) => void;
  };

  isRenderComplete = false;

  listStatus = LIST_STATUS;
  filter: QueryFilerModel = { ...QUERY_FILTER_DEFAULT };
  pageSizeOptions: any[] = [];
  paginationMessage = '';

  columnDefs: any[] = [];
  grid: GridModel = {
    dataCount: 0,
    rowData: [],
    totalData: 0,
  };
  private gridApi: any;
  private gridColumnApi: any;
  modules = [ClientSideRowModelModule];
  defaultColDef: any;
  rowSelection = 'multiple';
  overlayLoadingTemplate = OVERLAY_LOADING_TEMPLATE;
  overlayNoRowsTemplate = OVERLAY_NOROW_TEMPLATE;
  quickText = '';
  excelStyles: any;
  frameworkComponents: any;

  btnAdd: ButtonModel;
  btnDelete: ButtonModel;
  btnExportExcel: ButtonModel;
  btnResetSearch: ButtonModel;
  btnSearch: ButtonModel;
  btnReload: ButtonModel;

  isLoadingDelete = false;
  isShowDelete = false;
  isShowImport = false;

  tittle = `${this.i18n.fanyi('function.document-template.title')}`;
  moduleName = 'Biểu mẫu hợp đồng';

  modal: any = {
    type: '',
    item: {},
    isShow: false,
    option: {},
  };

  listMetaData: any[] = [];
  listDocumentType: any[] = [];
  //#endregion Ag-grid

  //#region Search

  //#endregion Search
  listCertifyType: any[] = [];

  masterDetail = true;
  detailCellRendererParams: any;

  ngOnInit(): void {
    this.initRightOfUser();
    this.fecthListCertifyType();
    this.loadComboBoxData();
    this.isRenderComplete = true;
  }

  initRightOfUser(): void {
    this.btnAdd.grandAccess = this.aclService.canAbility('DOCUMENT-TEMPLATE-ADD');
    this.btnDelete.grandAccess = this.aclService.canAbility('DOCUMENT-TEMPLATE-DELETE');
  }

  //#region Ag-grid
  onPageSizeChange(): void {
    this.initGridData();
  }

  onPageNumberChange(): void {
    this.initGridData();
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    // this.approvePerfectScrollbar();
    this.initGridData();
  }

  async GetItem(item: any = null) {
    this.modal = {
      type: 'info',
      item,
      isShow: true,
      option: {},
    };

    const response = await this.getById(item.id);
    this.itemModal.initData(response.data, 'info', {
      listMetaData: this.listMetaData,
      listDocumentType: this.listDocumentType,
      isFromGridDetail: true,
    });
  }

  getById(id: any): Promise<any> {
    return this.documentTemplateApiService.getById(id).toPromise();
  }

  approvePerfectScrollbar(): void {
    const agBodyViewport: HTMLElement = this.elementRef.nativeElement.querySelector('.ag-body-viewport');
    const agBodyHorizontalViewport: HTMLElement = this.elementRef.nativeElement.querySelector('.ag-body-horizontal-scroll-viewport');
    if (agBodyViewport) {
      const ps = new PerfectScrollbar(agBodyViewport);
      ps.update();
    }
    if (agBodyHorizontalViewport) {
      const ps = new PerfectScrollbar(agBodyHorizontalViewport);
      ps.update();
    }
  }

  onSelectionChanged($event: any): void {
    const selectedRows = this.gridApi.getSelectedRows();
    if (selectedRows.length > 0) {
      this.btnDelete.visible = true;
    } else {
      this.btnDelete.visible = false;
    }
  }

  onCellDoubleClicked($event: any): void {
    this.onViewItem($event.data);
  }
  //#region Event
  fecthListCertifyType(): Subscription {
    const rs = this.certifyTypeApiService.getListCombobox().subscribe(
      (res: any) => {
        // this.gridApi.hideOverlay();
        if (res.code !== 200) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        this.listCertifyType = res.data;
      },
      (err: any) => {
        // this.gridApi.hideOverlay();
        console.log(err);
      },
    );
    return rs;
  }
  changeCertifyType(event: any): any {
    this.filter.documentTypeId = event;
    this.initGridData();
  }
  onExportExcel(): void {
    const params = {
      columnWidth: 100,
      sheetName: this.moduleName,
      exportMode: undefined, // 'xml', // : undefined,
      suppressTextAsCDATA: true,
      rowHeight: undefined,
      fileName: `Danh sách ${this.moduleName} ${moment(new Date()).format('DD-MM-YYYY')}.xlsx`,
      headerRowHeight: undefined, // undefined,
      customHeader: [
        [],
        [
          {
            styleId: 'bigHeader',
            data: {
              type: 'String',
              value: `Danh sách ${this.moduleName} (${moment(new Date()).format('DD-MM-YYYY')})`,
            },
            mergeAcross: 3,
          },
        ],
        [],
      ],
      customFooter: [[]],
    };
    this.gridApi.exportDataAsExcel(params);
  }

  onResetSearch(reloadData: boolean): void {
    this.filter.pageNumber = 1;
    this.filter.textSearch = undefined;
    this.filter.status = null;
    this.filter.documentTypeId = null;
    if (reloadData) {
      this.initGridData();
    }
  }
  clearTextSearch(): any {
    this.onResetSearch(true);
  }
  onAddItem(): void {
    this.modal = {
      type: 'add',
      item: {},
      isShow: true,
      option: {},
    };
    this.itemModal.initData({}, 'add', { listMetaData: this.listMetaData, listDocumentType: this.listDocumentType });
  }

  onEditItem(item: any = null): void {
    if (item === null) {
      const selectedRows = this.gridApi.getSelectedRows();
      item = selectedRows[0];
    }
    this.modal = {
      type: 'edit',
      item,
      isShow: true,
      option: {},
    };
    this.itemModal.initData(item, 'edit', { listMetaData: this.listMetaData, listDocumentType: this.listDocumentType });
  }

  onDuplicateItem(item: any = null): void {
    this.modalService.confirm({
      nzTitle: `${this.i18n.fanyi('function.document-template.modal-confirm-duplicate.header')}`,
      nzContent: `<b>${this.i18n.fanyi('function.document-template.modal-confirm-duplicate.body')}` + item.code + `</b>`,
      nzOnOk: () => this.confirmDuplicateItem(item),
    });
  }

  confirmDuplicateItem(item: any): any {
    const data = {
      id: item.id,
    };

    const promise = this.documentTemplateApiService.duplicate(data).subscribe(
      (res: any) => {
        if (res.code !== 200) {
          this.messageService.error(`${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.messageService.error(`${res.message}`);
          return;
        }
        const dataResult = res.data;
        this.messageService.success(`${res.message}`);
        this.initGridData();
      },
      (err: any) => {
        if (err.error) {
          this.messageService.error(`${err.error.message}`);
        } else {
          this.messageService.error(`${err.status}`);
        }
      },
    );
    return promise;
  }

  onViewItem(item: any = null): void {
    if (item === null) {
      const selectedRows = this.gridApi.getSelectedRows();
      item = selectedRows[0];
    }
    this.modal = {
      type: 'info',
      item,
      isShow: true,
      option: {},
    };
    this.itemModal.initData(item, 'info', { listMetaData: this.listMetaData, listDocumentType: this.listDocumentType });
  }

  onConfigItem(item: any = null): void {
    this.router.navigate(['/certify/document-template-config', item.id]);
  }

  onDeleteItem(item: any = null): void {
    let selectedRows = this.gridApi.getSelectedRows();
    if (item !== null) {
      selectedRows = [];
      selectedRows.push(item);
    }
    const tittle = 'Xác nhận xóa';
    let content = '';
    if (selectedRows.length > 1) {
      // content = 'Bạn có chắc chắn muốn xóa các bản ghi này không?';
      content = `${this.i18n.fanyi('layout-modal.delete.message.many')}`;
    } else {
      // content = 'Bạn có chắc chắn muốn xóa bản ghi này không?';
      content = `${this.i18n.fanyi('layout-modal.delete.message.one')}`;
    }
    this.isShowDelete = true;
    this.deleteModal.initData(selectedRows, content);
  }

  //#endregion Event

  //#region Modal

  onModalEventEmmit(event: any): void {
    this.modal.isShow = false;
    if (event.type === 'success') {
      this.initGridData();
    }
  }

  onDeleteEventEmmit(event: any): void {
    if (event.type === 'success') {
      this.initGridData();
    } else if (event.type === 'confirm') {
      this.deleteModal.updateIsLoading(true);
      this.deleteListItem(event.listId);
    }
  }

  onImportEventEmmit(event: any): void {
    if (event.type === 'success') {
      this.initGridData();
    }
  }

  //#endregion Modal

  //#region API Event
  deleteListItem(listId: [string]): Subscription {
    this.isLoadingDelete = true;
    const promise = this.documentTemplateApiService.delete(listId).subscribe(
      (res: any) => {
        this.isLoadingDelete = false;
        if (res.code !== 200) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        const dataResult = res.data;
        this.deleteModal.updateData(dataResult);
      },
      (err: any) => {
        this.isLoadingDelete = false;
        this.deleteModal.updateData(undefined);
        if (err.error) {
          this.notification.error(`Có lỗi xảy ra`, `${err.error.message}`);
        } else {
          this.notification.error(`Có lỗi xảy ra`, `${err.status}`);
        }
      },
    );
    return promise;
  }

  loadComboBoxData(): void {
    this.infoInCertifyApiService.getListCombobox().subscribe((data: any) => {
      this.listMetaData = data.data;
      this.listMetaData.forEach((element) => {
        element.name = element.note + ' - ' + element.name;
      });
    });
    this.certifyTypeApiService.getAllListCombobox().subscribe((data: any) => {
      this.listDocumentType = data.data;
    });
  }

  onStatusChange(event: any): void {
    this.filter.status = event;
    this.initGridData();
  }
  changeStatus(event: any): any {
    this.filter.status = event;
    this.initGridData();
  }
  initGridData(): Subscription {
    this.btnDelete.visible = false;
    this.gridApi.showLoadingOverlay();
    const rs = this.documentTemplateApiService.getFilter(this.filter).subscribe(
      (res: any) => {
        this.gridApi.hideOverlay();
        if (res.code !== 200) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }

        const dataResult = res.data;

        let i =
          (this.filter.pageSize === undefined ? 0 : this.filter.pageSize) *
          ((this.filter.pageNumber === undefined ? 0 : this.filter.pageNumber) - 1);

        this.paginationMessage = `Hiển thị <b>${i + 1} - ${i + dataResult.dataCount}</b> trên tổng số <b>${
          dataResult.totalCount
        }</b> kết quả`;
        for (const item of dataResult.data) {
          item.index = ++i;
          item.statusName = !item.checkSignConfig ? 'Chưa có vùng ký' : item.status ? 'Đang áp dụng' : 'Ngừng áp dụng';
          if (item.fromDate) item.validDate = moment(item.fromDate).format('DD/MM/YYYY');
          item.metaDataConfigGrantAccess = this.aclService.canAbility('DOCUMENT-TEMPLATE-CONFIG-SIGN');
          item.infoGrantAccess = true;
          item.duplicateGrantAccess = this.aclService.canAbility('DOCUMENT-TEMPLATE-DUPLICATE');
          item.editGrantAccess = this.aclService.canAbility('DOCUMENT-TEMPLATE-EDIT');
          item.deleteGrantAccess = this.aclService.canAbility('DOCUMENT-TEMPLATE-DELETE');
        }
        this.grid.totalData = dataResult.totalCount;
        this.grid.dataCount = dataResult.dataCount;
        this.grid.rowData = dataResult.data;
        this.pageSizeOptions = [...PAGE_SIZE_OPTION_DEFAULT];
        // tslint:disable-next-line: variable-name
        this.pageSizeOptions = this.pageSizeOptions.filter((number) => {
          return number < dataResult.totalCount;
        });
        this.pageSizeOptions.push(dataResult.totalCount);
      },
      (err: any) => {
        this.gridApi.hideOverlay();
        // console.log(err);
      },
    );
    return rs;
  }
  //#endregion API Event
}
