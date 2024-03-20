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
import { OrganizationApiService, PositionApiService } from '@service';
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

import { ArrayService } from '@delon/util';
import { ContactItemComponent } from '../contact-item/contact-item.component';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.less'],
})
@Injectable()
export class ContactComponent implements OnInit {
  constructor(
    private aclService: ACLService,
    private notification: NzNotificationService,
    private elementRef: ElementRef,
    private activatedRoute: ActivatedRoute,
    private arrayService: ArrayService,
    private organizationApiService: OrganizationApiService,
    private positionApiService: PositionApiService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
  ) {
    //#region ag-grid
    this.columnDefs = [
      {
        field: 'index',
        headerName: 'STT',
        width: 110,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
      },
      { field: 'name', headerName: 'Họ và tên', sortable: true, filter: true, minWidth: 180, flex: 1 },
      { field: 'email', headerName: 'Email', sortable: true, filter: true, minWidth: 180, flex: 1 },
      { field: 'phoneNumber', headerName: 'Số điện thoại', sortable: true, filter: true, minWidth: 180, flex: 1 },
      { field: 'createdDate', headerName: 'Ngày tạo', minWidth: 150, cellRenderer: 'dateCellRender' },
    ];
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
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.onAddItem();
      },
    };
    this.btnExportExcel = {
      title: 'Xuất danh bạ',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.onExportExcel();
      },
    };
    this.btnImportExcel = {
      title: 'Tải lên danh bạ',
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
      titlei18n: '',
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
      titlei18n: '',
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

      if (this.id_route_param === 'internal') {
        this.columnDefs.push(
          { field: 'organizationName', headerName: 'Bộ phận', sortable: true, filter: true, minWidth: 180, flex: 1 },
          { field: 'positionName', headerName: 'Chức vụ', sortable: true, filter: true, minWidth: 180, flex: 1 },
        );
      } else {
        this.columnDefs.push({ field: 'address', headerName: 'Nơi làm việc', sortable: true, filter: true, minWidth: 180, flex: 1 });
      }

      this.columnDefs.push(
        { field: 'statusName', headerName: 'Trạng thái', minWidth: 150, cellRenderer: 'statusNameCellRender' },
        {
          headerName: 'Thao tác',
          minWidth: 150,
          cellRenderer: 'btnCellRender',
          cellRendererParams: {
            infoClicked: (item: any) => this.onViewItem(item),
            editClicked: (item: any) => this.onEditItem(item),
            deleteClicked: (item: any) => this.onDeleteItem(item),
          },
        },
      );
    });

    if (this.tokenService.get()?.token) {
      this.user_id = this.tokenService.get()?.id;
    }
    //#endregion
  }
  @ViewChild(ContactItemComponent, { static: false }) itemModal!: { initData: (arg0: {}, arg1: string, arg2: {}) => void };
  @ViewChild(DeleteModalComponent, { static: false }) deleteModal!: {
    initData: (arg0: any, arg1: string) => void;
    updateIsLoading: (arg0: boolean) => void;
    updateData: (arg0: undefined) => void;
  };

  headerName = '';
  sub: any;
  id_route_param: string | null = '0';
  user_id: any = null;
  isRenderComplete = false;

  listStatus = LIST_STATUS;
  listOrganization: any[] = [];
  arrOrganization: any[] = [];
  arrPosition: any[] = [];
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

  ngOnInit(): void {
    this.checkSysAdmin = this.aclService.can(ROLE_SYS_ADMIN);
    if (!this.checkSysAdmin) {
      const tokenData = this.tokenService.get();
      this.filter.organizationId = tokenData?.organizationId;
    }
    this.initRightOfUser();
    this.isRenderComplete = true;
    this.initListOrganization();
    this.initListPosition();

    if (this.id_route_param === 'internal') {
      this.headerName = 'nội bộ';
      this.tittle = 'Danh Bạ Nội Bộ';
    } else {
      this.headerName = ' của tôi';
      this.tittle = 'Danh Bạ Của Tôi';
      this.filter.userId = this.user_id;
    }
  }

  initRightOfUser(): void {
    // this.btnAdd.grandAccess = this.aclService.canAbility('UNIT-ADD');
    // this.btnDelete.grandAccess = this.aclService.canAbility('UNIT-DELETE');
    // this.btnExportExcel.grandAccess = this.aclService.canAbility('UNIT-EXPORT-EXCEL');
  }

  changeOrganization(event: any): void {
    this.filter.organizationId = event;
    this.initGridData();
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
  }

  onResetSearch(reloadData: boolean): void {
    this.filter.textSearch = undefined;
    this.filter.status = null;
    this.filter.pageNumber = 1;
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
    this.itemModal.initData(item, 'edit', { type: this.id_route_param });
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
    this.itemModal.initData(item, 'info', { type: this.id_route_param });
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
      content = 'Bạn có chắc chắn muốn xóa các bản ghi này không?';
    } else {
      content = 'Bạn có chắc chắn muốn xóa bản ghi này không?';
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
        this.arrOrganization = res.data;

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

  initListPosition(): Subscription {
    const rs = this.positionApiService.getListCombobox().subscribe(
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
        this.arrPosition = res.data;
      },
      (err: any) => {
        this.gridApi.hideOverlay();
        this.notification.error(`Có lỗi xảy ra`, `${err.message}`);
      },
    );
    return rs;
  }

  initGridData(): any {
    this.btnDelete.visible = false;
    this.gridApi.showLoadingOverlay();
    // const rs = this.contactApiService.getFilter(this.filter).subscribe(
    //   (res: any) => {
    //     this.gridApi.hideOverlay();
    //     if (res.code !== 200) {
    //       this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
    //       return;
    //     }
    //     if (res.data === null || res.data === undefined) {
    //       this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
    //       return;
    //     }

    //     const dataResult = res.data;
    //     let i =
    //       (this.filter.pageSize === undefined ? 0 : this.filter.pageSize) *
    //       ((this.filter.pageNumber === undefined ? 0 : this.filter.pageNumber) - 1);

    //     this.paginationMessage = `Hiển thị <b>${i + 1} - ${i + dataResult.dataCount}</b> trên tổng số <b>${
    //       dataResult.totalCount
    //     }</b> kết quả`;
    //     for (const item of dataResult.data) {
    //       item.organizationName = '';
    //       item.positionName = '';
    //       if (this.arrOrganization.length > 0) {
    //         item.organizationName = this.arrOrganization.find((x) => x.id === item.organizationId)?.name;
    //       }
    //       if (this.arrPosition.length > 0) {
    //         item.positionName = this.arrPosition.find((x) => x.id === item.positionId)?.name;
    //       }
    //       item.index = ++i;
    //       item.statusName = this.listStatus.find((x) => x.id === item.status)?.name;
    //       item.infoGrantAccess = true;
    //       item.editGrantAccess = false;
    //       item.deleteGrantAccess = false;
    //     }
    //     this.grid.totalData = dataResult.totalCount;
    //     this.grid.dataCount = dataResult.dataCount;
    //     this.grid.rowData = dataResult.data;
    //     this.pageSizeOptions = [...PAGE_SIZE_OPTION_DEFAULT];
    //     // tslint:disable-next-line: variable-name
    //     this.pageSizeOptions = this.pageSizeOptions.filter((number) => {
    //       return number < dataResult.totalCount;
    //     });
    //     this.pageSizeOptions.push(dataResult.totalCount);
    //   },
    //   (err: any) => {
    //     this.gridApi.hideOverlay();
    //     // console.log(err);
    //   },
    // );
    // return rs;
  }
  //#endregion API Event
}
