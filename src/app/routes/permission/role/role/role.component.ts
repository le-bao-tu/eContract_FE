import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { I18NService } from '@core';
import { ACLService } from '@delon/acl';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ButtonModel, GridModel, QueryFilerModel } from '@model';
import { CertifyTypeApiService, MenuApiService, OrganizationApiService, RightApiService, UserApiService } from '@service';
import { BtnCellRenderComponent, DateCellRenderComponent, DeleteModalComponent, StatusNameCellRenderComponent } from '@shared';
import {
  EXCEL_STYLES_DEFAULT,
  LIST_STATUS,
  OVERLAY_LOADING_TEMPLATE,
  OVERLAY_NOROW_TEMPLATE,
  PAGE_SIZE_OPTION_DEFAULT,
  QUERY_FILTER_DEFAULT,
} from '@util';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';
import { RoleApiService } from 'src/app/services/api/role-api.service';
import { RoleDataPermissionComponent } from '../role-data-permission/role-data-permission.component';
import { RoleItemComponent } from '../role-item/role-item.component';
import { RoleMenuComponent } from '../role-menu/role-menu.component';
import { RoleRightComponent } from '../role-right/role-right.component';
import { RoleUserComponent } from '../role-user/role-user.component';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.less'],
})
export class RoleComponent implements OnInit {
  tittle = `${this.i18n.fanyi('function.country.title')}`;

  btnReload: ButtonModel;
  btnDelete: ButtonModel;
  btnAdd: ButtonModel;
  btnSearch: ButtonModel;
  btnResetSearch: ButtonModel;

  filter: QueryFilerModel = { ...QUERY_FILTER_DEFAULT };

  modules = [ClientSideRowModelModule];
  columnDefs: any[] = [];
  defaultColDef: any;
  rowSelection = 'multiple';
  grid: GridModel = {
    dataCount: 0,
    rowData: [],
    totalData: 0,
  };
  private gridApi: any;
  private gridColumnApi: any;
  overlayLoadingTemplate = OVERLAY_LOADING_TEMPLATE;
  overlayNoRowsTemplate = OVERLAY_NOROW_TEMPLATE;
  frameworkComponents: any;
  excelStyles: any;
  pageSizeOptions: any[] = [];
  paginationMessage = '';
  listStatus = LIST_STATUS;

  modal: any = {
    type: '',
    item: {},
    isShow: false,
    option: {},
  };

  isShowDelete = false;
  isLoadingDelete = false;

  listOrg: any[] = [];
  listDocType: any[] = [];
  listUser: any[] = [];

  listRight: any[] = [];
  listMenu: any[] = [];

  @ViewChild(RoleMenuComponent, { static: false }) itemMenuModal!: {
    initData: (arg0: {}, listMenu: any[]) => void;
  };
  @ViewChild(RoleRightComponent, { static: false }) itemRightModal!: {
    initData: (arg0: {}, listRight: any[]) => void;
  };
  @ViewChild(RoleItemComponent, { static: false }) itemModal!: { initData: (arg0: {}, arg1: string) => void };
  @ViewChild(RoleDataPermissionComponent, { static: false }) itemPermissionModal!: {
    initData: (arg0: {}, listDocumentType: any[], listOrganization: any[]) => void;
  };
  @ViewChild(DeleteModalComponent, { static: false }) deleteModal!: {
    initData: (arg0: any, arg1: string) => void;
    updateIsLoading: (arg0: boolean) => void;
    updateData: (arg0: undefined) => void;
  };
  @ViewChild(RoleUserComponent, { static: false }) itemRoleUserModal!: {
    initData: (arg0: {}, listUser: any[], listOrg: any[]) => void;
  };

  constructor(
    private roleApiService: RoleApiService,
    private notification: NzNotificationService,
    private documentTypeApiService: CertifyTypeApiService,
    private organizationApiService: OrganizationApiService,
    private messageService: NzMessageService,
    private userService: UserApiService,
    private rightService: RightApiService,
    private menuService: MenuApiService,
    private aclService: ACLService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {
    this.columnDefs = [
      {
        field: 'index',
        headerName: `${this.i18n.fanyi('layout.grid.index')}`,
        width: 150,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
      },
      { field: 'code', headerName: `${this.i18n.fanyi('function.role.grid.code')}`, minWidth: 180, flex: 1 },
      {
        field: 'name',
        headerName: `${this.i18n.fanyi('function.role.grid.name')}`,
        sortable: true,
        filter: true,
        minWidth: 180,
        flex: 1,
      },
      {
        field: 'status',
        headerName: `${this.i18n.fanyi('function.role.grid.status')}`,
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
          addRoleClicked: (item: any) => this.onAddRoleItem(item),
          btnUpdateUserRole: (item: any) => this.btnUpdateUserRole(item),
          addRightClickedHandler: (item: any) => this.addRightClickedHandler(item),
          addMenuClickedHandler: (item: any) => this.addMenuClickedHandler(item),
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
      titlei18n: `${this.i18n.fanyi('layout.button.btn-reset.label')}`,
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
        this.onResetSearch(false);
      },
    };
    //#endregion Init button
  }

  ngOnInit() {
    this.initRightOfUser();
    this.initDocumentType();
    this.initOrganization();
    this.getListUserInternal();
    this.initListRight();
    this.initListMenu();
  }

  initRightOfUser() {
    this.btnAdd.grandAccess = this.aclService.canAbility('ROLE-ADD');
    this.btnDelete.grandAccess = this.aclService.canAbility('ROLE-DELETE');
  }

  btnUpdateUserRole(data: any) {
    this.itemRoleUserModal.initData(data, this.listUser, this.listOrg);
  }

  initDocumentType() {
    this.documentTypeApiService.getListComboboxAllStatus().subscribe(
      (res) => {
        if (res.data) {
          res.data.forEach((x: any) => {
            x.parent_id = null;
          });

          this.listDocType = res.data;
        }
      },
      (err) => {
        console.log('get document type combobox error: ', err);
      },
    );
  }

  initOrganization() {
    this.organizationApiService.getListComboboxCurrentOrgOfUser().subscribe(
      (res: any) => {
        if (res.code !== 200) {
          this.messageService.error(`${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.messageService.error(`${res.message}`);
          return;
        }

        this.listOrg = res.data;
      },
      (err: any) => {
        // console.log(err);
      },
    );
  }

  initGridData(): Subscription {
    this.btnDelete.visible = false;
    this.gridApi.showLoadingOverlay();
    const rs = this.roleApiService.getFilter(this.filter).subscribe(
      (res: any) => {
        this.gridApi.hideOverlay();
        if (res.code !== 200) {
          this.notification.error(`${this.i18n.fanyi('function.role.modal-item.name.message.error.title')}`, `${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.notification.error(`${this.i18n.fanyi('function.role.modal-item.name.message.error.title')}`, `${res.message}`);
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
          item.infoGrantAccess = true;
          item.editGrantAccess = this.aclService.canAbility('ROLE-EDIT');
          item.deleteGrantAccess = this.aclService.canAbility('ROLE-DELETE');
          item.addRoleGrantAccess = this.aclService.canAbility('ROLE-ADD-DATA');
          item.userGroupAddGrantAccess = this.aclService.canAbility('ROLE-ADD-USER');
          item.addRightGrantAccess = this.aclService.canAbility('ROLE-ADD-RIGHT');
          item.addMenuGrantAccess = this.aclService.canAbility('ROLE-ADD-NAVIGATION');
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
      },
    );

    return rs;
  }

  initListMenu() {
    this.menuService.getListCombobox().subscribe(
      (res) => {
        if (res.code !== 200) {
          this.messageService.error(`${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.messageService.error(`${res.message}`);
          return;
        }

        this.listMenu = res.data;
      },
      (err) => {
        console.log(err);
      },
    );
  }

  onResetSearch(reloadData: boolean): void {
    this.filter.pageNumber = 1;
    this.filter.textSearch = undefined;
    this.filter.status = null;
    if (reloadData) {
      this.initGridData();
    }
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    // this.approvePerfectScrollbar();
    this.initGridData();
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

  addRightClickedHandler(item: any) {
    this.itemRightModal.initData(item, this.listRight);
  }

  addMenuClickedHandler(item: any) {
    this.itemMenuModal.initData(item, this.listMenu);
  }

  initListRight() {
    this.rightService.getListCombobox().subscribe(
      (res) => {
        if (res.code !== 200) {
          this.notification.error(`${this.i18n.fanyi('function.right.message-error.title')}`, `${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.notification.error(`${this.i18n.fanyi('function.right.message-error.title')}`, `${res.message}`);
          return;
        }

        this.listRight = res.data;
      },
      (err) => { },
    );
  }

  async onEditItem(item: any = null): Promise<void> {
    // if (item === null) {
    //   const selectedRows = this.gridApi.getSelectedRows();
    //   item = selectedRows[0];
    // }
    const res = await this.roleApiService.getById(item.id).toPromise();
    if (res.code !== 200) {
      this.notification.error(`${this.i18n.fanyi('function.role.modal-item.name.message.error.title')}`, `${res.message}`);
      return;
    }
    if (res.data === null || res.data === undefined) {
      this.notification.error(`${this.i18n.fanyi('function.role.modal-item.name.message.error.title')}`, `${res.message}`);
      return;
    }

    this.modal = {
      type: 'edit',
      item,
      isShow: true,
      option: {},
    };
    this.itemModal.initData(res.data, 'edit');
  }

  async onViewItem(item: any = null): Promise<void> {
    const res = await this.roleApiService.getById(item.id).toPromise();
    if (res.code !== 200) {
      this.notification.error(`${this.i18n.fanyi('function.role.modal-item.name.message.error.title')}`, `${res.message}`);
      return;
    }
    if (res.data === null || res.data === undefined) {
      this.notification.error(`${this.i18n.fanyi('function.role.modal-item.name.message.error.title')}`, `${res.message}`);
      return;
    }

    this.modal = {
      type: 'info',
      item,
      isShow: true,
      option: {},
    };
    this.itemModal.initData(res.data, 'info');
  }

  onDeleteItem(item: any = null): void {
    let selectedRows = this.gridApi.getSelectedRows();
    if (item !== null) {
      selectedRows = [];
      selectedRows.push(item);
    }
    const tittle = `${this.i18n.fanyi('delete-modal.grid.header')}`;
    let content = '';
    if (selectedRows.length > 1) {
      content = `${this.i18n.fanyi('layout-modal.delete.message.many')}`;
    } else {
      content = `${this.i18n.fanyi('layout-modal.delete.message.one')}`;
    }
    this.isShowDelete = true;
    this.deleteModal.initData(selectedRows, content);
  }

  onAddRoleItem(item: any): void {
    this.itemPermissionModal.initData(item, this.listDocType, this.listOrg);
  }

  onPageNumberChange(): void {
    this.initGridData();
  }

  onPageSizeChange(): void {
    this.initGridData();
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

  onModalRoleUserEventEmmit(event: any): void { }

  onModalRightEventEmmit(event: any): void { }

  onModalMenuEventEmmit(event: any): void { }

  //#region API Event
  getListUserInternal() {
    this.userService.getListComboboxFilterInternalUser(true, null).subscribe(
      (res) => {
        this.listUser = res.data;
      },
      (err) => { },
    );
  }

  deleteListItem(listId: [string]): Subscription {
    this.isLoadingDelete = true;
    const promise = this.roleApiService.delete(listId).subscribe(
      (res: any) => {
        this.isLoadingDelete = false;
        if (res.code !== 200) {
          this.notification.error(`${this.i18n.fanyi('function.role.modal-item.name.message.error.title')}`, `${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.notification.error(`${this.i18n.fanyi('function.role.modal-item.name.message.error.title')}`, `${res.message}`);
          return;
        }
        const dataResult = res.data;
        this.deleteModal.updateData(dataResult);
      },
      (err: any) => {
        this.isLoadingDelete = false;
        this.deleteModal.updateData(undefined);
        if (err.error) {
          this.notification.error(`${this.i18n.fanyi('function.role.modal-item.name.message.error.title')}`, `${err.error.message}`);
        } else {
          this.notification.error(`${this.i18n.fanyi('function.role.modal-item.name.message.error.title')}`, `${err.status}`);
        }
      },
    );
    return promise;
  }

  changeStatus(event: any): any {
    this.filter.status = event;
    this.initGridData();
  }

  onModalPermissionEventEmmit($event: any) {
    this.initGridData();
  }
}
