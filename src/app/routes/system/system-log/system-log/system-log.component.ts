import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { ACLService } from '@delon/acl';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';

import * as moment from 'moment';
import PerfectScrollbar from 'perfect-scrollbar';

import { ButtonModel, GridModel, QueryFilerModel } from '@model';
import { OrganizationApiService, SystemLogApiService, UserApiService } from '@service';
import {
  EXCEL_STYLES_DEFAULT,
  LIST_DEVICE,
  LIST_STATUS,
  OVERLAY_LOADING_TEMPLATE,
  OVERLAY_NOROW_TEMPLATE,
  PAGE_SIZE_OPTION_DEFAULT,
  QUERY_FILTER_DEFAULT,
  ROLE_SYS_ADMIN,
} from '@util';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ArrayService } from '@delon/util';
import { BtnCellRenderComponent, DateCellRenderComponent, StatusNameCellRenderComponent } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';

import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';

@Component({
  selector: 'app-system-log',
  templateUrl: './system-log.component.html',
  styleUrls: ['./system-log.component.less'],
})
export class SystemLogComponent implements OnInit {
  constructor(
    private positionApiService: SystemLogApiService,
    private aclService: ACLService,
    private notification: NzNotificationService,
    private organizationApiService: OrganizationApiService,
    private elementRef: ElementRef,
    private messageService: NzMessageService,
    private arrayService: ArrayService,
    private userApiService: UserApiService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {
    //#region ag-grid
    this.columnDefs = [
      {
        field: 'index',
        headerName: `${this.i18n.fanyi('layout.grid.index')}`,
        cellRenderer: 'agGroupCellRenderer',
        width: 110,
      },
      {
        field: 'createdDate',
        headerName: `${this.i18n.fanyi('function.system-log.grid.createddate')}`,
        cellRenderer: 'dateCellRender',
        sortable: true,
        filter: true,
        minWidth: 180,
        flex: 1,
      },
      { field: 'actionName', headerName: `${this.i18n.fanyi('function.system-log.grid.actionname')}`, minWidth: 300, flex: 1 },
      { field: 'description', headerName: `${this.i18n.fanyi('function.system-log.grid.description')}`, minWidth: 250 },
      {
        field: 'traceId',
        headerName: `${this.i18n.fanyi('function.system-log.grid.traceid')}`,
        sortable: true,
        filter: true,
        minWidth: 180,
        flex: 1,
      },
      {
        field: 'userName',
        headerName: `${this.i18n.fanyi('function.system-log.grid.username')}`,
        sortable: true,
        filter: true,
        minWidth: 180,
        flex: 1,
      },
      {
        field: 'organizationName',
        headerName: `${this.i18n.fanyi('function.system-log.grid.organizationname')}`,
        sortable: true,
        filter: true,
        minWidth: 180,
        flex: 1,
      },
      {
        field: 'device',
        headerName: `${this.i18n.fanyi('function.system-log.grid.device')}`,
        sortable: true,
        filter: true,
        minWidth: 180,
        flex: 1,
      },
      {
        field: 'ip',
        headerName: `${this.i18n.fanyi('function.system-log.grid.ip')}`,
        sortable: true,
        filter: true,
        minWidth: 180,
        flex: 1,
      },
    ];

    // provide Detail Cell Renderer Params
    this.detailCellRendererParams = {
      // provide the Grid Options to use on the Detail Grid
      detailGridOptions: {
        columnDefs: [
          { field: 'name', headerName: 'Thông tin', width: 300, resizable: true },
          { field: 'value', headerName: 'Giá trị', flex: 1, resizable: true },
        ],
      },
      // get the rows for each Detail Grid
      getDetailRowData: (params: any) => {
        const dt = [];
        const object = params.data.operatingSystem;
        // tslint:disable-next-line:forin
        for (const property in object) {
          dt.push({
            name: property,
            value: object[property],
          });
        }
        const objectLocation = params.data.location;
        if (objectLocation && objectLocation.latitude) {
          dt.push({
            name: 'latitude',
            value: objectLocation.latitude,
          });
          dt.push({
            name: 'longitude',
            value: objectLocation.longitude,
          });
        }
        params.successCallback(dt);
      },
    };

    this.defaultColDef = {
      // flex: 1,
      minWidth: 100,
      resizable: true,
    };
    this.frameworkComponents = {
      btnCellRender: BtnCellRenderComponent,
      statusNameCellRender: StatusNameCellRenderComponent,
      dateCellRender: DateCellRenderComponent,
    };
    this.excelStyles = [...EXCEL_STYLES_DEFAULT];
    //#endregion ag-grid

    //#region Init button
    this.btnSearch = {
      title: 'Tìm kiếm',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-search.label')}`,
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
  masterDetail = true;
  detailCellRendererParams: any;

  btnResetSearch: ButtonModel;
  btnSearch: ButtonModel;
  btnReload: ButtonModel;

  isLoadingDelete = false;
  isShowDelete = false;
  isShowImport = false;

  tittle = `${this.i18n.fanyi('function.system-log.title')}`;
  moduleName = 'Nhật ký hệ thống';

  listOrg: any = [];
  arrOrg: any = [];
  listUser: any = [];
  listAction: any = [];
  listDevice: any = LIST_DEVICE;

  checkSysAdmin = false;

  modal: any = {
    type: '',
    item: {},
    isShow: false,
    option: {},
  };

  dateFormat = 'dd/MM/yyyy';
  listActionCode: any[] = [];
  selectedDate: any = new Date();

  ngOnInit(): void {
    this.initRightOfUser();
    this.isRenderComplete = true;
    this.checkSysAdmin = this.aclService.can(ROLE_SYS_ADMIN);
    if (!this.checkSysAdmin) {
      const tokenData = this.tokenService.get();
      this.filter.organizationId = tokenData?.organizationId;
    }
    this.initListOrg();
    this.initListUsers();
    this.initListActionCode();
  }

  initListActionCode() {
    this.positionApiService.getAllActionCodeForCombobox().subscribe(
      (res) => {
        if (res.data) this.listActionCode = res.data;
      },
      (err) => console.log('err: ', err),
    );
  }

  onChangeDate(result: any): void {
    if (result) {
      this.filter.startDate = moment(result).format('YYYY-MM-DDTHH:mm:ss');
      this.filter.endDate = moment(result).format('YYYY-MM-DDTHH:mm:ss');
    } else {
      this.filter.startDate = null;
      this.filter.endDate = null;
    }
  }

  initRightOfUser(): void {
    // this.btnAdd.grandAccess = this.aclService.canAbility('UNIT-ADD');
    // this.btnDelete.grandAccess = this.aclService.canAbility('UNIT-DELETE');
    // this.btnExportExcel.grandAccess = this.aclService.canAbility('UNIT-EXPORT-EXCEL');
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
    // const selectedRows = this.gridApi.getSelectedRows();
  }

  onCellDoubleClicked($event: any): void {}
  //#endregion Ag-grid

  //#region Search

  //#endregion Search

  //#region Event
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
    this.filter.userId = null;
    this.filter.device = null;
    this.filter.startDate = null;
    this.filter.endDate = null;
    this.selectedDate = null;
    this.filter.actionCode = null;
    if (this.checkSysAdmin) {
      this.filter.organizationId = null;
    }
    if (reloadData) {
      this.initGridData();
    }
  }

  //#endregion Event

  //#region Modal

  onModalEventEmmit(event: any): void {
    this.modal.isShow = false;
    if (event.type === 'success') {
      this.initGridData();
    }
  }

  //#endregion Modal

  //#region API Event

  initListOrg(): any {
    const rs = this.organizationApiService.getListCombobox().subscribe(
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
        this.arrOrg = res.data;
        // console.log(dataResult);

        const arrayTreeResult = dataResult.map((item: any, i: number, arr: any[]) => {
          const checkIsLeft = arr.some((c) => c.parentId === item.id);

          return {
            id: item.id,
            parent_id: item.parentId,
            title: item.name,
            isLeaf: !checkIsLeft,
            expanded: false,
            selected: false,
          };
        });

        this.listOrg = this.arrayService.arrToTreeNode(arrayTreeResult, {
          cb: (item, parent, deep) => {
            // item.expanded = deep <= 1;
            item.selected = item.id === 0;
          },
        });
      },
      (err: any) => {
        // console.log(err);
      },
    );
    return rs;
  }

  initListUsers(): Subscription | undefined {
    let orgId = this.tokenService.get()?.organizationId;
    if (this.checkSysAdmin) {
      orgId = undefined;
    }
    const promise = this.userApiService.getListCombobox(orgId).subscribe(
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
        this.listUser = dataResult;
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

  initGridData(): Subscription {
    this.gridApi.showLoadingOverlay();
    const rs = this.positionApiService.getFilter(this.filter).subscribe(
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
