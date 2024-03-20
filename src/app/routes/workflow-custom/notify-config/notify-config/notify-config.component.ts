import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { ACLService } from '@delon/acl';
import { ButtonModel, GridModel, QueryFilerModel } from '@model';
import {
  EXCEL_STYLES_DEFAULT,
  LIST_NOTIFY_TYPE,
  LIST_STATUS,
  OVERLAY_LOADING_TEMPLATE,
  OVERLAY_NOROW_TEMPLATE,
  PAGE_SIZE_OPTION_DEFAULT,
  QUERY_FILTER_DEFAULT,
} from '@util';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import PerfectScrollbar from 'perfect-scrollbar';
import { Subscription } from 'rxjs';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
  BtnCellRenderComponent,
  DateCellRenderComponent,
  DeleteModalComponent,
  StatusCellRenderComponent,
  StatusNameCellRenderComponent,
} from '@shared';
import { NotifyConfigApiService } from 'src/app/services/api/notify-config-api.service';
import { NotifyConfigItemComponent } from '../notify-config-item/notify-config-item.component';

import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';

@Component({
  selector: 'app-notify-config',
  templateUrl: './notify-config.component.html',
  styleUrls: ['./notify-config.component.less'],
})
export class NotifyConfigComponent implements OnInit {
  constructor(
    private notifyConfigApiService: NotifyConfigApiService,
    private aclService: ACLService,
    private notification: NzNotificationService,
    private elementRef: ElementRef,
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
      },
      { field: 'notifyTypeName', headerName: `${this.i18n.fanyi('function.notify-config.grid.notify-type')}`, minWidth: 180, flex: 1 },
      { field: 'code', headerName: `${this.i18n.fanyi('function.notify-config.grid.code')}`, minWidth: 180, flex: 1 },
      {
        field: 'sendSMSName',
        headerName: `${this.i18n.fanyi('function.notify-config.grid.sendsmsname')}`,
        sortable: false,
        filter: false,
        minWidth: 180,
        flex: 1,
        cellRenderer: 'statusNameCellRender',
      },
      {
        field: 'sendEmailName',
        headerName: `${this.i18n.fanyi('function.notify-config.grid.sendemailname')}`,
        sortable: false,
        filter: false,
        minWidth: 180,
        flex: 1,
        cellRenderer: 'statusNameCellRender',
      },
      {
        field: 'sendNotifyName',
        headerName: `${this.i18n.fanyi('function.notify-config.grid.sendnotifyname')}`,
        sortable: false,
        filter: false,
        minWidth: 180,
        flex: 1,
        cellRenderer: 'statusNameCellRender',
      },
      {
        field: 'repeatName',
        headerName: `${this.i18n.fanyi('function.notify-config.grid.repeatname')}`,
        minWidth: 180,
        cellRenderer: 'statusNameCellRender',
      },
      {
        field: 'daySendNotiBefore',
        headerName: `${this.i18n.fanyi('function.notify-config.grid.daysendnotibefore')}`,
        minWidth: 180,
        flex: 1,
      },
      { field: 'timeSendNotify', headerName: `${this.i18n.fanyi('function.notify-config.grid.timesendnotify')}`, minWidth: 150, flex: 1 },
      {
        field: 'createdDate',
        headerName: `${this.i18n.fanyi('function.notify-config.grid.createddate')}`,
        minWidth: 150,
        cellRenderer: 'dateCellRender',
      },
      {
        field: 'status',
        headerName: `${this.i18n.fanyi('function.notify-config.grid.status')}`,
        minWidth: 150,
        cellRenderer: 'statusNameCellRender',
      },
      {
        headerName: `${this.i18n.fanyi('layout.grid.action')}`,
        minWidth: 150,
        cellRenderer: 'btnCellRender',
        cellRendererParams: {
          infoClicked: (item: any) => this.onViewItem(item),
          editClicked: (item: any) => this.onEditItem(item),
          deleteClicked: (item: any) => this.onDeleteItem(item),
        },
      },
    ];
    this.defaultColDef = {
      minWidth: 100,
      resizable: true,
    };
    this.frameworkComponents = {
      btnCellRender: BtnCellRenderComponent,
      dateCellRender: DateCellRenderComponent,
      statusNameCellRender: StatusNameCellRenderComponent,
      statusCellRender: StatusCellRenderComponent,
    };
    this.excelStyles = [...EXCEL_STYLES_DEFAULT];
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
  @ViewChild(NotifyConfigItemComponent, { static: false }) itemModal!: { initData: (arg0: {}, arg1: string) => void };
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
  btnResetSearch: ButtonModel;
  btnSearch: ButtonModel;
  btnReload: ButtonModel;

  isLoadingDelete = false;
  isShowDelete = false;
  isShowImport = false;

  tittle = `${this.i18n.fanyi('function.notify-config.title')}`;
  moduleName = 'thông báo nhắc nhở';

  modal: any = {
    type: '',
    item: {},
    isShow: false,
    option: {},
  };

  listNotifyType: any[] = LIST_NOTIFY_TYPE;

  ngOnInit(): void {
    this.initRightOfUser();
    this.isRenderComplete = true;
  }

  initRightOfUser(): void {
    this.btnAdd.grandAccess = this.aclService.canAbility('NOTIFY-CONFIG-ADD');
    this.btnDelete.grandAccess = this.aclService.canAbility('NOTIFY-CONFIG-DELETE');
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
  //#endregion Ag-grid

  //#region Event
  onResetSearch(reloadData: boolean): void {
    this.filter.pageNumber = 1;
    this.filter.textSearch = undefined;
    this.filter.status = null;
    if (reloadData) {
      this.initGridData();
    }
  }

  onAddItem(): void {
    this.modal = {
      type: 'add',
      item: {},
      isShow: true,
      option: {},
    };
    this.itemModal.initData({}, 'add');
  }

  async onEditItem(item: any = null): Promise<void> {
    this.modal = {
      type: 'edit',
      item,
      isShow: true,
      option: {},
    };
    item = await this.getById(item);
    this.itemModal.initData(item, 'edit');
  }

  async onViewItem(item: any = null): Promise<void> {
    this.modal = {
      type: 'info',
      item,
      isShow: true,
      option: {},
    };
    item = await this.getById(item);
    this.itemModal.initData(item, 'info');
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

    selectedRows.forEach((x: any) => {
      x.name = x.code
    });
    this.deleteModal.initData(selectedRows, content);
  }
  changeStatus(event: any) {
    this.filter.status = event;
    this.initGridData();
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
  //#endregion Modal

  getById(item: any) {
    this.isLoadingDelete = true;
    return new Promise((resolve, reject) => {
      this.notifyConfigApiService.getById(item.id).subscribe(
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

          res.data;
          const dateNow = new Date();
          let hour, minute;
          if (res.data.timeSendNotify) {
            hour = res.data.timeSendNotify.split(':')[0];
          }
          if (res.data.timeSendNotify) {
            minute = res.data.timeSendNotify.split(':')[1];
          }
          const timeSendNotifyView = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate(), hour, minute, 0);
          res.data.timeSendNotifyView = timeSendNotifyView;
          resolve(res.data);
        },
        (err: any) => {
          this.isLoadingDelete = false;
          if (err.error) {
            this.notification.error(`Có lỗi xảy ra`, `${err.error.message}`);
          } else {
            this.notification.error(`Có lỗi xảy ra`, `${err.status}`);
          }
          reject(err);
        },
      );
    });
  }

  //#region API Event
  deleteListItem(listId: [string]): Subscription {
    this.isLoadingDelete = true;
    const promise = this.notifyConfigApiService.delete(listId).subscribe(
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

  initGridData(): Subscription {
    this.btnDelete.visible = false;
    this.gridApi.showLoadingOverlay();
    const rs = this.notifyConfigApiService.getFilter(this.filter).subscribe(
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

        this.paginationMessage = `Hiển thị <b>${i + 1} - ${i + dataResult.dataCount}</b> trên tổng số <b>${dataResult.totalCount
          }</b> kết quả`;

        for (const item of dataResult.data) {
          item.index = ++i;
          item.statusName = this.listStatus.find((x) => x.id === item.status)?.name;
          item.sendSMSName = this.listStatus.find((x) => x.id === item.isSendSMS)?.name;
          item.sendEmailName = this.listStatus.find((x) => x.id === item.isSendEmail)?.name;
          item.sendNotifyName = this.listStatus.find((x) => x.id === item.isSendNotification)?.name;
          item.repeatName = this.listStatus.find((x) => x.id === item.isRepeat)?.name;
          item.infoGrantAccess = true;
          item.editGrantAccess = this.aclService.canAbility('NOTIFY-CONFIG-EDIT');
          item.deleteGrantAccess = this.aclService.canAbility('NOTIFY-CONFIG-DELETE');
          item.notifyTypeName = LIST_NOTIFY_TYPE.find(x => x.value === item.notifyType)?.label;
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

  changeNotifyType($event: any) {
    this.filter.notifyType = $event;
    this.initGridData();
  }
}
