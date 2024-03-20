import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ACLService } from '@delon/acl';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ButtonModel, GridModel, QueryFilerModel } from '@model';
import { OrganizationApiService, UserService } from '@service';
import {
  BtnCellRenderComponent,
  ChangeStateModalComponent,
  DeleteModalComponent,
  EformStatusCellRenderComponent,
  StatusCertCellRenderComponent,
  StatusUserCellRenderComponent,
} from '@shared';
import {
  LIST_STATUS_CERT,
  LIST_USER_STATUS,
  OVERLAY_LOADING_TEMPLATE,
  OVERLAY_NOROW_TEMPLATE,
  PAGE_SIZE_OPTION_DEFAULT,
  QUERY_FILTER_DEFAULT,
  ROLE_SYS_ADMIN,
} from '@util';
import moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import PerfectScrollbar from 'perfect-scrollbar';
import { Subscription } from 'rxjs';
import { AddRoleComponent } from '../add-role/add-role.component';
import { HsmAccountComponent } from '../hsm-account/hsm-account.component';
import { SignConfigComponent } from '../sign-config/sign-config.component';

import { DOCUMENT } from '@angular/common';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { DocumentItemComponent } from 'src/app/routes/certify/document/document-item/document-item.component';
import { UserV2ItemComponent } from 'src/app/routes/user/user-item/user-item-v2.component';
import { RoleApiService } from 'src/app/services/api/role-api.service';
import { UserDeviceComponent } from '../user-device/user-device.component';

@Component({
  selector: 'app-user',
  templateUrl: './user-v2.component.html',
  styleUrls: ['./user-v2.component.less'],
})
export class UserV2Component implements OnInit {
  constructor(
    private notification: NzNotificationService,
    private messageService: NzMessageService,
    private aclService: ACLService,
    private orgService: OrganizationApiService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private elementRef: ElementRef,
    private userService: UserService,
    private roleService: RoleApiService,
    private route: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    @Inject(DOCUMENT) private doc: any,
  ) {
    //#region ag-grid
    this.columnDefs = [
      {
        field: 'userName',
        headerName: `${this.i18n.fanyi('function.user.grid.username')}`,
        minWidth: 100,
        flex: 1,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
      },
      { field: 'name', headerName: `${this.i18n.fanyi('function.user.grid.name')}`, sortable: true, filter: true, minWidth: 100, flex: 1 },
      {
        field: 'subjectDN',
        headerName: `${this.i18n.fanyi('function.user.grid.subjectdn')}`,
        sortable: true,
        filter: true,
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'organizationName',
        headerName: `${this.i18n.fanyi('function.user.grid.organizationname')}`,
        sortable: true,
        filter: true,
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'status',
        // cellRendererParams: {
        //   changeStatus: (item: any, id: any) => this.onChangeStatus(item, id),
        // },
        headerName: `${this.i18n.fanyi('function.user.grid.statusname')}`,
        minWidth: 50,
        cellRenderer: 'statusNameCellRender',
        flex: 1,
      },
      // {
      //   field: 'eformStatus',
      //   headerName: `Trạng thái EForm`,
      //   minWidth: 250,
      //   cellRenderer: 'eformStatusCellRender',
      //   cellRendererParams: {
      //     daKyClick: (item: any) => this.daKyClick(item),
      //     chuaKyCTSClick: (item: any) => this.chuaKyCTSClick(item),
      //     chuaKyGDDTClick: (item: any) => this.chuaKyGDDTClick(item),
      //   },
      //   flex: 1,
      // },
      // { field: 'certType', headerName: 'Chứng thư số', minWidth: 150, cellRenderer: 'statusCertCellRender', flex: 1 },
      {
        headerName: `${this.i18n.fanyi('layout.grid.action')}`,
        minWidth: 150,
        cellRenderer: 'btnCellRenderer',
        cellRendererParams: {
          infoClicked: (item: any) => this.onViewItem(item),
          addUserRoleClicked: (item: any) => this.addRoleItem(item),
          addSignConfigClicked: (item: any) => this.signConfigItem(item),
          addHsmAccountClicked: (item: any) => this.hsmAccountItem(item),
          infoListUserDeviceClicked: (item: any) => this.onViewUserDeviceItem(item),
          editClicked: (item: any) => this.onEditItem(item),
          addCertClicked: (item: any) => this.addCert(item),
          deleteClicked: (item: any) => this.onDeleteItem(item),
          lockClicked: (item: any) => {
            this.type = true;
            this.onLockItem(item);
          },
          unlockClicked: (item: any) => {
            this.type = false;
            this.onLockItem(item);
          },
        },
      },
    ];
    this.defaultColDef = {
      // flex: 1,
      minWidth: 120,
      resizable: true,
    };
    this.frameworkComponents = {
      btnCellRenderer: BtnCellRenderComponent,
      statusNameCellRender: StatusUserCellRenderComponent,
      statusCertCellRender: StatusCertCellRenderComponent,
      eformStatusCellRender: EformStatusCellRenderComponent,
    };
    // this.excelStyles = [...EXCEL_STYLES_DEFAULT];
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
    this.btnActive = {
      title: 'Mở khóa',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-active.label')}`,
      visible: false,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.type = false;
        this.onLockItem();
      },
    };
    this.btnDeActive = {
      title: 'Khóa',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-deactive.label')}`,
      visible: false,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.type = true;
        this.onLockItem();
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

  @ViewChild(DocumentItemComponent, { static: false }) documentItemModal!: { initData: (arg0: any[], arg1: string) => void };
  @ViewChild(UserV2ItemComponent, { static: false }) itemModal!: { initData: (arg0: {}, arg1: string) => void };
  @ViewChild(AddRoleComponent, { static: false }) addRoleModal!: { initData: (arg0: {}, arg1: string, listRole: any[]) => void };
  @ViewChild(SignConfigComponent, { static: false }) signConfigModal!: { initData: (arg0: {}, arg1: string) => void };
  @ViewChild(UserDeviceComponent, { static: false }) infoUserDevice!: { initData: (arg0: any[], arg1: string) => void };
  @ViewChild(HsmAccountComponent, { static: false }) hsmAccountModal!: { initData: (arg0: {}, arg1: string) => void };
  @ViewChild(DeleteModalComponent, { static: false }) deleteModal!: {
    initData: (arg0: any, arg1: string) => void;
    updateIsLoading: (arg0: boolean) => void;
    updateData: (arg0: undefined) => void;
  };
  @ViewChild(ChangeStateModalComponent, { static: false }) changeStateModal!: {
    initData: (arg0: any, arg1: string, type: boolean) => void;
    updateIsLoading: (arg0: boolean) => void;
    updateData: (arg0: undefined) => void;
  };

  modalDevice: any = {
    typeDevice: '',
    itemDevice: {},
    isShowDevice: false,
    optionDevice: {},
  };
  checkSysAdmin = false;
  isShowAddRole = false;
  isShowSignConfig = false;
  isShowHsmAccount = false;
  type = false;
  isRenderComplete = false;
  listOrg: Array<{ value: string; label: string }> = [];
  listStatus = LIST_USER_STATUS;
  paginationMessage = '';
  filter: QueryFilerModel = { ...QUERY_FILTER_DEFAULT };
  pageSizeOptions: any[] = [];
  listStatusCert = LIST_STATUS_CERT;
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
  btnActive: ButtonModel;
  btnDeActive: ButtonModel;
  btnResetSearch: ButtonModel;
  btnSearch: ButtonModel;
  btnReload: ButtonModel;

  isLoadingDelete = false;
  isShowDelete = false;
  isShowImport = false;
  isShowChangeState = false;

  isShowDeviceModal = false;

  tittle = `${this.i18n.fanyi('function.user.title')}`;
  moduleName = 'Người dùng';

  modal: any = {
    type: '',
    item: {},
    isShow: false,
    option: {},
  };
  listRole: any[] = [];

  onChangeStatus(event: any, id: any): any {
    const data = {
      id,
      status: event,
    };
    const promise = this.userService.update(data).subscribe(
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
      },
      (err: any) => {
        if (err.error) {
          this.messageService.error(`${err.error.message}`);
        } else {
          this.messageService.error(`${err.status}`);
        }
      },
    );
  }
  onStatusChange(event: any): any {
    this.filter.status = event;
    this.initGridData();
  }
  addCert(item: any): void {
    console.log(item);
    if (item.organizationId !== null && item.organizationId !== undefined) {
      this.route.navigateByUrl('cert/' + item.id + '/2');
    } else {
      this.route.navigateByUrl('cert/' + item.id + '/1');
    }
  }
  onOrgChange(event: any): any {
    this.filter.organizationId = event;
    this.initGridData();
  }

  ngOnInit(): void {
    this.initRightOfUser();
    this.initListRole();
    if (this.listOrg.length === 0) {
      this.fecthlistOrg();
    }
    this.checkIsAdmin();
    this.isRenderComplete = true;
  }

  initListRole() {
    this.roleService.getListCombobox().subscribe(
      (res) => {
        if (res.data) {
          res.data.forEach((x: any) => {
            x.parent_id = null;
          });

          this.listRole = res.data;
        }
      },
      (err) => console.log(err),
    );
  }

  initRightOfUser(): void {
    this.btnAdd.grandAccess = this.aclService.canAbility('USER-ADD');
    this.btnDelete.grandAccess = this.aclService.canAbility('USER-DELETE');
    this.btnActive.grandAccess = this.aclService.canAbility('USER-UNLOCK');
    this.btnDeActive.grandAccess = this.aclService.canAbility('USER-LOCK');
  }

  //#region Ag-grid
  onPageSizeChange(): void {
    this.initGridData();
  }
  fecthlistOrg(): void {
    this.orgService.getListCombobox().subscribe(
      (res: any) => {
        if (res.code === 200) {
          this.listOrg = res.data.map((item: any) => {
            return {
              value: item.id,
              label: item.name,
            };
          });
        }
      },
      (err: any) => {
        console.log(err);
      },
    );
  }
  onPageNumberChange(): void {
    this.initGridData();
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.approvePerfectScrollbar();
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
      this.btnActive.visible = true;
      this.btnDeActive.visible = true;
    } else {
      this.btnDelete.visible = false;
      this.btnActive.visible = false;
      this.btnDeActive.visible = false;
    }
  }

  onCellDoubleClicked($event: any): void {
    this.onViewItem($event.data);
  }
  //#endregion Ag-grid

  //#region Search

  //#endregion Search

  //#region Event
  checkIsAdmin(): any {
    this.checkSysAdmin = this.aclService.can(ROLE_SYS_ADMIN);
    if (!this.checkSysAdmin) {
      const tokenData = this.tokenService.get();
      this.filter.organizationId = tokenData?.organizationId;
    }
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
    this.filter.textSearch = undefined;
    this.filter.status = null;
    this.filter.parentId = null;
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
    this.itemModal.initData({}, 'add');
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
    this.itemModal.initData(item, 'edit');
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
    this.itemModal.initData(item, 'info');
  }
  onViewUserDeviceItem(item: any = null): void {
    this.isShowDeviceModal = true;
    this.infoUserDevice.initData(item, 'infoDevice');
  }
  addRoleItem(item: any = null): void {
    this.isShowAddRole = true;
    if (item === null) {
      const selectedRows = this.gridApi.getSelectedRows();
      item = selectedRows[0];
    }
    this.addRoleModal.initData(item, 'edit', this.listRole);
  }
  signConfigItem(item: any = null): void {
    this.isShowSignConfig = true;
    if (item === null) {
      const selectedRows = this.gridApi.getSelectedRows();
      item = selectedRows[0];
    }
    this.signConfigModal.initData(item, 'add');
  }
  // 22-9-2021
  hsmAccountItem(item: any = null): void {
    this.isShowHsmAccount = true;
    if (item === null) {
      const selectedRows = this.gridApi.getSelectedRows();
      item = selectedRows[0];
    }
    this.hsmAccountModal.initData(item, 'add');
  }
  // 22-9-2021
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

  onLockItem(item: any = null): void {
    let selectedRows = this.gridApi.getSelectedRows();
    if (item !== null) {
      selectedRows = [];
      selectedRows.push(item);
    }
    const tittle = 'Xác nhận thay đổi trạng thái';
    let content = '';
    if (this.type === true) {
      if (selectedRows.length > 1) {
        // content = 'Bạn có chắc chắn muốn thay đổi trạng thái các bản ghi này không?';
        content = `${this.i18n.fanyi('layout-modal.lock.message.many')}`;
      } else {
        // content = 'Bạn có chắc chắn muốn thay đổi trạng thái bản ghi này không?';
        content = `${this.i18n.fanyi('layout-modal.lock.message.one')}`;
      }
    } else {
      if (selectedRows.length > 1) {
        // content = 'Bạn có chắc chắn muốn thay đổi trạng thái các bản ghi này không?';
        content = `${this.i18n.fanyi('layout-modal.un-lock.message.many')}`;
      } else {
        // content = 'Bạn có chắc chắn muốn thay đổi trạng thái bản ghi này không?';
        content = `${this.i18n.fanyi('layout-modal.un-lock.message.one')}`;
      }
    }

    this.isShowChangeState = true;
    this.changeStateModal.initData(selectedRows, content, this.type);
  }

  //#endregion Event

  //#region Modal

  onModalEventEmmit(event: any): void {
    this.modal.isShow = false;
    if (event.type === 'success') {
      this.initGridData();
    }
  }
  onAddRoleModalEventEmmit(event: any): void {
    this.isShowAddRole = false;
    if (event.type === 'success') {
      this.initGridData();
    }
  }
  onSignConfigModalEventEmmit(event: any): void {
    this.isShowSignConfig = false;
    if (event.type === 'success') {
      this.initGridData();
    }
  }
  // 22-9-2021
  onHsmAcoutModalEventEmmit(event: any): void {
    this.isShowHsmAccount = false;
    if (event.type === 'success') {
      this.initGridData();
    }
  }
  // 22-9-2021
  onDeleteEventEmmit(event: any): void {
    if (event.type === 'success') {
      this.initGridData();
    } else if (event.type === 'confirm') {
      this.deleteModal.updateIsLoading(true);
      this.deleteListItem(event.listId);
    }
  }
  onchangeStateEventEmmit(event: any): void {
    if (event.type === 'success') {
      this.initGridData();
    } else if (event.type === 'confirm') {
      this.changeStateModal.updateIsLoading(true);
      this.changeStateListItem(event.listId);
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
    const promise = this.userService.delete(listId).subscribe(
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
  changeStateListItem(listId: [string]): Subscription {
    this.isShowChangeState = true;
    const model = {
      listId,
      isLock: this.type,
    };
    const promise = this.userService.lock(model).subscribe(
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
        this.changeStateModal.updateData(dataResult);
        this.btnActive.visible = false;
        this.btnDeActive.visible = false;
      },
      (err: any) => {
        this.changeStateModal.updateData(undefined);
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
    this.filter.isInternalUser = true;
    const rs = this.userService.getFilter(this.filter).subscribe(
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
          item.statusName = this.listStatus.find((x: any) => x.id === item.status)?.name;
          item.editGrantAccess = this.aclService.canAbility('USER-EDIT');
          item.infoGrantAccess = true;
          item.deleteGrantAccess = false;
          item.lockGrantAccess = !item.isLock && this.aclService.canAbility('USER-LOCK');
          item.unlockGrantAccess = item.isLock && this.aclService.canAbility('USER-UNLOCK');
          // item.addCertGrantAccess = true;
          item.addUserRoleGrantAccess = this.aclService.canAbility('USER-ADD-ROLE');
          item.signConfigGrantAccess = this.aclService.canAbility('USER-SIGN-CONFIG');

          // 22-9-2021
          item.hsmAccountGrantAccess = this.aclService.canAbility('USER-HSM-CONFIG');

          item.eformStatus = null;
          if (item.userEFormInfo) {
            const lstStatus = [];
            if (item.userEFormInfo.isConfirmDigitalSignature) {
              lstStatus.push('Đã ký eForm GDĐT');
            }
            if (item.userEFormInfo.isConfirmRequestCertificate) {
              lstStatus.push('Đã ký eForm CTS');
            }

            if (lstStatus.length > 0) {
              item.eformStatus = lstStatus.join(', ');
            }
          } else {
            item.eformStatus = 'Chưa có eForm';
          }
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

  daKyClick(item: any) {
    if (item.userEFormInfo) {
      const documentIds = [];
      if (item.userEFormInfo.confirmDigitalSignatureDocumentId && item.userEFormInfo.isConfirmDigitalSignature) {
        documentIds.push(item.userEFormInfo.confirmDigitalSignatureDocumentId);
      } else if (item.userEFormInfo.requestCertificateDocumentId && item.userEFormInfo.isConfirmRequestCertificate) {
        documentIds.push(item.userEFormInfo.requestCertificateDocumentId);
      }

      if (documentIds.length > 0) {
        this.documentItemModal.initData(documentIds, 'info');
      }
    }
  }

  chuaKyCTSClick(item: any) {
    if (item.userEFormInfo) {
      const documentIds = [];
      if (item.userEFormInfo.requestCertificateDocumentId) {
        documentIds.push(item.userEFormInfo.requestCertificateDocumentId);
      }

      if (documentIds.length > 0) {
        this.documentItemModal.initData(documentIds, 'info');
      }
    }
  }

  chuaKyGDDTClick(item: any) {
    if (item.userEFormInfo) {
      const documentIds = [];
      if (item.userEFormInfo.confirmDigitalSignatureDocumentId) {
        documentIds.push(item.userEFormInfo.confirmDigitalSignatureDocumentId);
      }

      if (documentIds.length > 0) {
        this.documentItemModal.initData(documentIds, 'info');
      }
    }
  }
}
