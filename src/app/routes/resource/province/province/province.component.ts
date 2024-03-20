import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { ACLService } from '@delon/acl';
import { CountryApiService } from '@service';
import { ProvinceApiService } from '@service';
import * as moment from 'moment';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import PerfectScrollbar from 'perfect-scrollbar';
import { Subscription } from 'rxjs';

import { DOCUMENT } from '@angular/common';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
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
import { BtnCellRenderComponent, DateCellRenderComponent, DeleteModalComponent, StatusNameCellRenderComponent } from '@shared';
import { ProvinceItemComponent } from '../province-item/province-item.component';
@Component({
  selector: 'app-province',
  templateUrl: './province.component.html',
  styleUrls: ['./province.component.less'],
})
export class ProvinceComponent implements OnInit {
  constructor(
    private provinceApiService: ProvinceApiService,
    private aclService: ACLService,
    private notification: NzNotificationService,
    private elementRef: ElementRef,
    private countryApiService: CountryApiService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    @Inject(DOCUMENT) private doc: any,
  ) {
    //#region ag-grid
    this.columnDefs = [
      {
        field: 'index',
        headerName: `${this.i18n.fanyi('layout.grid.index')}`,
        width: 150,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
      },
      { field: 'code', headerName: `${this.i18n.fanyi('function.province.grid.code')}`, minWidth: 180, flex: 1 },
      { field: 'name', headerName: `${this.i18n.fanyi('function.province.grid.name')}`, sortable: true, filter: true, minWidth: 180, flex: 1 },
      { field: 'countryName', headerName: `${this.i18n.fanyi('function.province.grid.countryname')}`, sortable: true, filter: true, minWidth: 180, flex: 1 },
      { field: 'status', headerName: `${this.i18n.fanyi('function.province.grid.status')}`, minWidth: 150, cellRenderer: 'statusNameCellRender' },
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
  @ViewChild(ProvinceItemComponent, { static: false }) itemModal!: { initData: (arg0: {}, arg1: string, option: any) => void };
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
  // btnExportExcel: ButtonModel;
  btnResetSearch: ButtonModel;
  btnSearch: ButtonModel;
  btnReload: ButtonModel;

  isLoadingDelete = false;
  isShowDelete = false;
  isShowImport = false;

  tittle = `${this.i18n.fanyi('function.province.title')}`;

  modal: any = {
    type: '',
    item: {},
    isShow: false,
    option: {},
  };

  listCountryName: any[] = [];

  ngOnInit(): void {
    this.initRightOfUser();
    this.isRenderComplete = true;
    this.loadComboBoxData(); // gọi list danh sách quốc gia
  }

  initRightOfUser(): void {
    this.btnAdd.grandAccess = this.aclService.canAbility('PROVINCE-ADD');
    this.btnDelete.grandAccess = this.aclService.canAbility('PROVINCE-DELETE');
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


  onResetSearch(reloadData: boolean): void {
    this.filter.pageNumber = 1;
    this.filter.textSearch = undefined;
    this.filter.status = null;
    this.filter.countryId = null;
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
    this.itemModal.initData({}, 'add', {listCountryName: this.listCountryName});
  }

async  onEditItem(item: any = null): Promise<void> {
    const res = await this.getById(item.id);
    if (res.code !== 200) {
      this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
      return;
    }
    if (res.data === null || res.data === undefined) {
      this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
      return;
    }
    
    this.modal = {
      type: 'edit',
      item,
      isShow: true,
      option: {},
    };
    this.itemModal.initData(res.data, 'edit', {listCountryName: this.listCountryName});
  }

  async onViewItem(item: any = null): Promise<void>{
    // if (item === null) {
    //   const selectedRows = this.gridApi.getSelectedRows();
    //   item = selectedRows[0];
    // }
    const res = await this.getById(item.id);
    if (res.code !== 200) {
      this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
      return;
    }
    if (res.data === null || res.data === undefined) {
      this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
      return;
    }
    
    this.modal = {
      type: 'info',
      item,
      isShow: true,
      option: {},
    };
    this.itemModal.initData(res.data, 'info', {listCountryName: this.listCountryName});
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
  changeStatus(event: any) {
    this.filter.status = event;
    this.initGridData();
  }

  changeCountry(event: any){
    this.filter.countryId = event;
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

  onImportEventEmmit(event: any): void {
    if (event.type === 'success') {
      this.initGridData();
    }
  }

  //#endregion Modal

  //#region API Event
  deleteListItem(listId: [string]): Subscription {
    this.isLoadingDelete = true;
    const promise = this.provinceApiService.delete(listId).subscribe(
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
    this.countryApiService.getListCombobox().subscribe((data: any) => {
      this.listCountryName = data.data;
    });
  }

 async getById(id: any): Promise<any>{
    return this.provinceApiService.getById(id).toPromise();
  }

  initGridData(): Subscription {
    this.btnDelete.visible = false;
    this.gridApi.showLoadingOverlay();
    const rs = this.provinceApiService.getFilter(this.filter).subscribe(
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
          item.statusName = this.listStatus.find((x) => x.id === item.status)?.name;
          // item.countryName = this.listCountryName.find((x) => x.id === item.countryId)?.name;
          item.infoGrantAccess = true;
          item.editGrantAccess = this.aclService.canAbility('PROVINCE-EDIT');
          item.deleteGrantAccess = this.aclService.canAbility('PROVINCE-DELETE');
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
