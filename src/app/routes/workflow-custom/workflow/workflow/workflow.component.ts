import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

import { Inject, Injectable, Injector } from '@angular/core';

import { ACLService } from '@delon/acl';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';

import * as moment from 'moment';
import PerfectScrollbar from 'perfect-scrollbar';

import { ButtonModel, GridModel, QueryFilerModel } from '@model';
import { OrganizationApiService, WorkflowApiService } from '@service';
import {
  EXCEL_STYLES_DEFAULT,
  LIST_STATUS,
  OVERLAY_LOADING_TEMPLATE,
  OVERLAY_NOROW_TEMPLATE,
  PAGE_SIZE_OPTION_DEFAULT,
  QUERY_FILTER_DEFAULT,
  ROLE_SYS_ADMIN,
} from '@util';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { BtnCellRenderComponent, DateCellRenderComponent, DeleteModalComponent, StatusNameCellRenderComponent } from '@shared';

import { WorkflowImportItemComponent } from '../workflow-import-item/workflow-import-item.component';
import { WorkflowItemComponent } from '../workflow-item/workflow-item.component';

import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { ArrayService } from '@delon/util';
import { NzMessageService } from 'ng-zorro-antd/message';
import { promise } from 'selenium-webdriver';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.less'],
})
@Injectable()
export class WorkflowComponent implements OnInit {
  constructor(
    private workflowApiService: WorkflowApiService,
    private aclService: ACLService,
    private notification: NzNotificationService,
    private elementRef: ElementRef,
    private activatedRoute: ActivatedRoute,
    private organizationApiService: OrganizationApiService,
    private messageService: NzMessageService,
    private arrayService: ArrayService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
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
      {
        field: 'code',
        headerName: `${this.i18n.fanyi('function.workflow.grid.code')}`,
        sortable: true,
        filter: true,
        minWidth: 150,
        flex: 1,
      },
      {
        field: 'name',
        headerName: `${this.i18n.fanyi('function.workflow.grid.name')}`,
        sortable: true,
        filter: true,
        minWidth: 150,
        flex: 1,
      },
      {
        field: 'organizationName',
        headerName: `${this.i18n.fanyi('function.workflow.grid.organizationname')}`,
        sortable: true,
        filter: true,
        minWidth: 150,
        flex: 1,
      },
      {
        field: 'createdDate',
        headerName: `${this.i18n.fanyi('function.workflow.grid.createddate')}`,
        minWidth: 150,
        cellRenderer: 'dateCellRender',
      },
      {
        field: 'createdUserName',
        headerName: `${this.i18n.fanyi('function.workflow.grid.createdby')}`,
        minWidth: 150,
      },
      {
        field: 'status',
        headerName: `${this.i18n.fanyi('function.workflow.grid.status')}`,
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

    // provide Detail Cell Renderer Params
    this.detailCellRendererParams = {
      // provide the Grid Options to use on the Detail Grid
      detailGridOptions: {
        columnDefs: [
          {
            field: 'index',
            headerName: `${this.i18n.fanyi('layout.grid.index')}`,
            width: 110,
          },
          {
            field: 'code',
            headerName: `${this.i18n.fanyi('function.workflow.grid.code')}`,
            minWidth: 150,
            flex: 1,
            onCellDoubleClicked: (item: any) => this.onViewItem(item.data, true),
          },
          {
            field: 'name',
            headerName: `${this.i18n.fanyi('function.workflow.grid.name')}`,
            minWidth: 150,
            flex: 1,
            onCellDoubleClicked: (item: any) => this.onViewItem(item.data, true),
          },
          {
            field: 'organizationName',
            headerName: `${this.i18n.fanyi('function.workflow.grid.organizationname')}`,
            minWidth: 150,
            flex: 1,
            onCellDoubleClicked: (item: any) => this.onViewItem(item.data, true),
          },
          {
            field: 'createdDate',
            headerName: `${this.i18n.fanyi('function.workflow.grid.createddate')}`,
            minWidth: 150,
            onCellDoubleClicked: (item: any) => this.onViewItem(item.data, true),
          },
          {
            field: 'createdUserName',
            headerName: `${this.i18n.fanyi('function.workflow.grid.createdby')}`,
            minWidth: 150,
            onCellDoubleClicked: (item: any) => this.onViewItem(item.data, true),
          },
        ],
      },
      // get the rows for each Detail Grid
      getDetailRowData: (params: any) => {
        const dataResult = params.data.listWorkflowHistory;

        let i = 0;
        for (const item of dataResult) {
          item.index = ++i;
          item.createdDate = moment(item.createdDate, 'DD/MM/YYYY HH:mm:ss', true).isValid()
            ? item.createdDate
            : moment(item.createdDate).format('DD/MM/YYYY HH:mm:ss');
          item.organizationName = this.listOfOrgs.find((x) => x.id === item.organizationId)?.name;
          item.statusName = this.listStatus.find((x) => x.id === item.status)?.name;
        }

        params.successCallback(dataResult);
      },
    };

    this.defaultColDef = {
      // flex: 1,
      minWidth: 100,
      resizable: true,
    };
    this.frameworkComponents = {
      btnCellRender: BtnCellRenderComponent,
      dateCellRender: DateCellRenderComponent,
      statusNameCellRender: StatusNameCellRenderComponent,
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
    this.btnImportExcel = {
      title: 'Import excel',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.onImportExcel();
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

    //#region get root param id && userId in token
    this.sub = this.activatedRoute.paramMap.subscribe((params) => {
      // console.log(params);
      this.id_route_param = params.get('id');
    });

    if (this.tokenService.get()?.token) {
      this.user_id = this.tokenService.get()?.id;
    }
    //#endregion
  }
  @ViewChild(WorkflowItemComponent, { static: false }) itemModal!: { initData: (arg0: {}, arg1: string, arg2: {}) => void };
  @ViewChild(DeleteModalComponent, { static: false }) deleteModal!: {
    initData: (arg0: any, arg1: string) => void;
    updateIsLoading: (arg0: boolean) => void;
    updateData: (arg0: undefined) => void;
  };
  @ViewChild(WorkflowImportItemComponent, { static: false }) importModal!: { initData: () => void };
  headerName = '';
  linkWorkFlow = '';
  sub: any;
  id_route_param: string | null = '0';
  user_id: any = null;
  isRenderComplete = false;
  listOfOrgs: any[] = [];

  listStatus = LIST_STATUS;
  listOrganization: any[] = [];
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
  btnImportExcel: ButtonModel;
  btnResetSearch: ButtonModel;
  btnSearch: ButtonModel;
  btnReload: ButtonModel;

  isLoadingDelete = false;
  isShowDelete = false;
  isShowImport = false;

  tittle = 'Danh bạ';
  moduleName = 'Danh bạ';

  modal: any = {
    type: '',
    item: {},
    isShow: false,
    option: {},
  };

  checkSysAdmin = false;

  masterDetail = true;
  detailCellRendererParams: any;

  ngOnInit(): void {
    this.checkSysAdmin = this.aclService.can(ROLE_SYS_ADMIN);
    if (!this.checkSysAdmin) {
      const tokenData = this.tokenService.get();
      this.filter.organizationId = tokenData?.organizationId;
    }
    this.initRightOfUser();
    this.initListOrgs();
    this.initListOrganization();

    this.isRenderComplete = true;

    if (this.id_route_param === 'default') {
      this.headerName = `${this.i18n.fanyi('layout.breadcum.workflow-internal')}`;
      this.linkWorkFlow = `/workflow/management/default`;
      // this.tittle = 'Quy trình mẫu';
      this.tittle = `${this.i18n.fanyi('function.workflow.management-default.title')}`;
    } else {
      this.headerName = `${this.i18n.fanyi('layout.breadcum.workflow-custom')}`;
      this.linkWorkFlow = `/workflow/management/custom`;
      // this.tittle = 'Quy trình của tôi';
      this.tittle = `${this.i18n.fanyi('function.workflow.management-custom.title')}`;
      this.filter.userId = this.user_id;
    }
  }

  initRightOfUser(): void {
    this.btnAdd.grandAccess = this.aclService.canAbility('WORKFLOW-ADD');
    this.btnDelete.grandAccess = this.aclService.canAbility('WORKFLOW-DELETE');
  }

  changeOrganization(event: any): void {
    this.filter.organizationId = event;
    this.initGridData();
  }

  initListOrgs(): Subscription | undefined {
    const promise = this.organizationApiService.getListCombobox().subscribe(
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
        this.listOfOrgs = dataResult;
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

  onImportExcel(): void {
    this.isShowImport = true;
    this.importModal.initData();
  }

  onResetSearch(reloadData: boolean): void {
    this.filter.pageNumber = 1;
    this.filter.textSearch = undefined;
    this.filter.status = null;
    if (this.checkSysAdmin) {
      this.filter.organizationId = null;
    }
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

    this.itemModal.initData({ userId: this.user_id }, 'add', { type: this.id_route_param });
  }

  async onEditItem(item: any = null): Promise<void> {
    this.modal = {
      type: 'edit',
      item,
      isShow: true,
      option: {},
    };

    const response = await this.getById(item.id);
    this.itemModal.initData(response.data, 'edit', {});
  }

  async onViewItem(item: any = null, isHistory: boolean = false): Promise<void> {
    this.modal = {
      type: 'info',
      item,
      isShow: true,
      option: {},
    };

    const response = await this.getById(item.id);
    this.itemModal.initData(response.data, 'info', { isHistory });
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

  initListOrganization(): Subscription {
    const rs = this.organizationApiService.getListCombobox().subscribe(
      (res: any) => {
        if (res.code !== 200) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        const dataResult = res.data;
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

        this.listOrganization = this.arrayService.arrToTreeNode(arrayTreeResult, {
          cb: (item, parent, deep) => {
            // item.expanded = deep <= 1;
            item.selected = item.id === 0;
          },
        });
      },
      (err: any) => {
        this.gridApi.hideOverlay();
        this.notification.error(`Có lỗi xảy ra`, `${err.message}`);
      },
    );
    return rs;
  }

  getById(id: any): Promise<any> {
    this.isLoadingDelete = true;
    return this.workflowApiService.getById(id).toPromise();
  }

  deleteListItem(listId: [string]): Subscription {
    this.isLoadingDelete = true;
    const promise = this.workflowApiService.delete(listId).subscribe(
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
    const rs = this.workflowApiService.getFilter(this.filter).subscribe(
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
          item.organizationName = this.listOfOrgs.find((x) => x.id === item.organizationId)?.name;
          item.statusName = this.listStatus.find((x) => x.id === item.status)?.name;
          item.infoGrantAccess = true;
          item.editGrantAccess = this.aclService.canAbility('WORKFLOW-EDIT');
          item.deleteGrantAccess = this.aclService.canAbility('WORKFLOW-DELETE');
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

  statusChange($event: any) {
    this.filter.status = $event;
    this.initGridData();
  }
}
