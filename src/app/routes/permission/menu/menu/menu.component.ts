import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { ACLService } from '@delon/acl';
import * as moment from 'moment';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import PerfectScrollbar from 'perfect-scrollbar';
import { Subscription } from 'rxjs';

import { DOCUMENT } from '@angular/common';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';

import { ButtonModel, GridModel, QueryFilerModel } from '@model';
import {
  cleanForm,
  EXCEL_STYLES_DEFAULT,
  LIST_STATUS,
  OVERLAY_LOADING_TEMPLATE,
  OVERLAY_NOROW_TEMPLATE,
  PAGE_SIZE_OPTION_DEFAULT,
  QUERY_FILTER_DEFAULT,
  REGEX_CODE,
  REGEX_NAME,
} from '@util';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ArrayService } from '@delon/util';
import { MenuApiService } from '@service';
import { BtnCellRenderComponent, DateCellRenderComponent, DeleteModalComponent, StatusNameCellRenderComponent } from '@shared';
import { NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzFormatEmitEvent, NzTreeNode } from 'ng-zorro-antd/tree';
import { RoleApiService } from 'src/app/services/api/role-api.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.less'],
})
export class MenuComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private aclService: ACLService,
    private notification: NzNotificationService,
    private elementRef: ElementRef,
    private roleService: RoleApiService,
    private menuService: MenuApiService,
    private arrayService: ArrayService,
    private messageService: NzMessageService,
    private modal: NzModalService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    @Inject(DOCUMENT) private doc: any,
  ) {
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
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.onDeleteItem();
      },
    };
    this.btnReload = {
      title: 'Tải lại',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-reload.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.initListMenu();
      },
    };
    this.btnSave = {
      title: 'Lưu',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-save.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.save();
      },
    };
    this.btnEdit = {
      title: 'Cập nhật',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-edit.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.onEditItem(this.item);
      },
    };
    //#endregion Init button

    this.form = this.fb.group({
      parentId: [null],
      code: [{ value: null, disabled: false }, [Validators.required, Validators.pattern(REGEX_CODE)]],
      name: [{ value: null, disabled: false }, [Validators.required, Validators.pattern(REGEX_NAME)]],
      i18n: [{ value: null, disabled: false }],
      url: [{ value: null, disabled: false }],
      icon: [{ value: null, disabled: false }],
      order: [{ value: 0, disabled: false }, [Validators.min(0)]],
      hideBreadcrumb: [{ value: true, disabled: false }],
      status: [{ value: true, disabled: false }],
    });
  }
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
  btnReload: ButtonModel;
  btnSave: ButtonModel;
  btnEdit: ButtonModel;

  isLoadingDelete = false;
  isShowDelete = false;
  isShowImport = false;

  tittle = `${this.i18n.fanyi('function.menu.title')}`;

  searchMenuValue: any;
  treeMenuData: NzTreeNode[] = [];
  form: FormGroup;

  menuParentList: any[] = [];
  rightList: any[] = [];

  isAdd = true;
  isEdit = false;
  isInfo = false;

  item: any;

  listRole: any[] = [];
  treeRoleData: any[] = [];
  roleIdsSelected: any[] = [];

  isLoading = false;

  delDisabled = false;
  expandAll = true;

  ngOnInit(): void {
    this.initRightOfUser();
    this.isRenderComplete = true;
    this.initListRole();
    this.initListMenu();
  }

  initRightOfUser(): void {
    this.btnAdd.grandAccess = this.aclService.canAbility('NAVIGATION-ADD');
    this.btnDelete.grandAccess = this.aclService.canAbility('NAVIGATION-DELETE');
    this.btnEdit.grandAccess = this.aclService.canAbility('NAVIGATION-EDIT');
  }

  initListRole(): any {
    this.roleService.getListCombobox().subscribe(
      (res) => {
        if (res.data) {
          res.data.forEach((x: any) => {
            x.parent_id = null;
          });

          this.listRole = res.data;

          this.convertListRoleToTreeData();
        }
      },
      (err) => console.log(err),
    );
  }

  initListMenu(): any {
    this.menuService.getAllListCombobox().subscribe(
      (res) => {
        if (res.code !== 200) {
          this.notification.error(`${this.i18n.fanyi('function.menu.message-error.title')}`, `${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.notification.error(`${this.i18n.fanyi('function.menu.message-error.title')}`, `${res.message}`);
          return;
        }

        const dataResult = res.data;

        const arrayTreeResult = dataResult.map((item: any, i: number, arr: any[]) => {
          const checkIsLeft = arr.some((c) => c.parentId === item.id);

          return {
            id: item.id,
            parent_id: item.parentId,
            title: item.name,
            isLeaf: !checkIsLeft,
            expanded: true,
            selected: false,
            checked: false,
          };
        });

        this.treeMenuData = this.arrayService.arrToTreeNode(arrayTreeResult, {
          cb: (item, parent, deep) => {
            // item.expanded = deep <= 1;
            item.selected = item.id === 0;
          },
        });
      },
      (err) => {},
    );
  }

  convertListRoleToTreeData(disabledNode: boolean = false): any {
    const arrayTreeResult = this.listRole.map((item: any, i: number, arr: any[]) => {
      const checkIsLeft = arr.some((c) => c.parentId === item.id);

      const checked = this.roleIdsSelected.some((x) => x === item.id);

      return {
        id: item.id,
        parent_id: item.parentId,
        title: item.name,
        isLeaf: !checkIsLeft,
        expanded: false,
        selected: false,
        checked,
        disabled: disabledNode,
        disableCheckbox: disabledNode,
      };
    });

    this.treeRoleData = this.arrayService.arrToTreeNode(arrayTreeResult, {
      cb: (item, parent, deep) => {
        // item.expanded = deep <= 1;
        item.selected = item.id === 0;
      },
    });
  }

  onAddItem(): void {
    this.isAdd = true;
    this.isEdit = false;
    this.isInfo = false;
    this.form.enable();
    this.resetForm();
    this.item = null;
  }

  onAddItemFromParent(item: any): void {
    this.isAdd = true;
    this.isEdit = false;
    this.isInfo = false;
    this.form.enable();
    this.resetForm();
    this.form.controls.parentId.setValue(item.id);
    this.item = null;
  }

  onEditItem(item: any = null): void {
    this.isAdd = false;
    this.isEdit = true;
    this.isInfo = false;
    this.item = item;
    this.form.enable();
    this.form.controls.code.disable();
    this.form.controls.i18n.disable();
    this.form.controls.url.disable();
    this.getById(item.id, false);
  }

  onViewItem(item: any = null): void {
    this.isAdd = false;
    this.isEdit = false;
    this.isInfo = true;
    this.item = item;
    this.form.disable();
    this.getById(item.id, true);
  }

  resetForm(): void {
    this.form.reset();
    this.form.get('status')?.setValue(true);
    this.form.get('hideBreadcrumb')?.setValue(true);
    this.form.get('order')?.setValue(0);
    this.form.get('code')?.enable();
    this.roleIdsSelected = [];
    this.convertListRoleToTreeData();
  }

  onDeleteItem(): any {
    this.modal.confirm({
      nzTitle: `${this.i18n.fanyi('function.menu.modal-delete.header')}`,
      nzContent: `${this.i18n.fanyi('function.menu.modal-delete.body')}`,
      nzOkText: `${this.i18n.fanyi('function.menu.modal-delete.button.yes')}`,
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => this.delete(),
      nzCancelText: `${this.i18n.fanyi('function.menu.modal-delete.button.no')}`,
      nzOnCancel: () => {},
    });
  }

  delete(): any {
    const ids = [this.item?.id];
    this.menuService.delete(ids).subscribe(
      (res) => {
        if (res.code !== 200) {
          this.notification.error(`${this.i18n.fanyi('function.menu.message-error.title')}`, `${res.message}`);
          return;
        }

        if (res.data === null || res.data === undefined) {
          this.notification.error(`${this.i18n.fanyi('function.menu.message-error.title')}`, `${res.message}`);
          return;
        }

        if (!res.data[0].result) {
          this.notification.error(`${this.i18n.fanyi('function.menu.message-error.title')}`, `${res.data[0].message}`);
          return;
        }

        this.messageService.success(`${res.message}`);
        cleanForm(this.form);
        this.resetForm();
        this.initListMenu();

        this.onAddItem();
      },
      (err) => {
        if (err.error) {
          this.notification.error(`${this.i18n.fanyi('function.menu.message-error.title')}`, `${err.error.message}`);
        } else {
          this.notification.error(`${this.i18n.fanyi('function.menu.message-error.title')}`, `${err.status}`);
        }
      },
    );
  }

  async getById(id: any, disableRoleTree: boolean = false): Promise<any> {
    this.menuService.getById(id).subscribe(
      (res: any) => {
        if (res.code !== 200) {
          this.notification.error(`${this.i18n.fanyi('function.menu.message-error.title')}`, `${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.notification.error(`${this.i18n.fanyi('function.menu.message-error.title')}`, `${res.message}`);
          return;
        }
        const dataResult = res.data;
        // console.log(dataResult);

        // Fill form
        this.fillForm(dataResult, disableRoleTree);
      },
      (err: any) => {
        if (err.error) {
          this.notification.error(`${this.i18n.fanyi('function.menu.message-error.title')}`, `${err.error.message}`);
        } else {
          this.notification.error(`${this.i18n.fanyi('function.menu.message-error.title')}`, `${err.status}`);
        }
      },
    );
  }

  fillForm(item: any, disableRoleTree: boolean = false): void {
    this.form.controls.parentId.setValue(item.parentId);
    this.form.controls.code.setValue(item.code);
    this.form.controls.name.setValue(item.name);
    this.form.controls.i18n.setValue(item.i18nName);
    this.form.controls.url.setValue(item.link);
    this.form.controls.icon.setValue(item.icon);
    this.form.controls.order.setValue(item.order);
    this.form.controls.hideBreadcrumb.setValue(item.hideInBreadcrumb);
    this.form.controls.status.setValue(item.status);

    this.roleIdsSelected = item.roleIds;
    this.convertListRoleToTreeData(disableRoleTree);
  }

  show(e: NzFormatEmitEvent): void {
    this.item = e.node!.origin;
    this.onViewItem(this.item);
  }

  save(): any {
    this.isLoading = true;
    cleanForm(this.form);

    // tslint:disable-next-line: forin
    for (const i in this.form.controls) {
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity();
    }
    if (!this.form.valid) {
      this.isLoading = false;
      this.messageService.error(`${this.i18n.fanyi('function.menu.message-error.form-invalid')}`);
      this.isLoading = false;
      return;
    }

    const model = {
      id: this.item?.id,
      name: this.form.controls.name.value,
      i18nName: this.form.controls.i18n.value,
      code: this.form.controls.code.value.toUpperCase(),
      parentId: this.form.controls.parentId.value,
      link: this.form.controls.url.value,
      icon: this.form.controls.icon.value,
      order: this.form.controls.order.value ? this.form.controls.order.value : 0,
      hideInBreadcrumb: this.form.controls.hideBreadcrumb.value ? this.form.controls.hideBreadcrumb.value : false,
      status: this.form.controls.status.value,
      roleIds: this.roleIdsSelected.filter((v, i, a) => a.indexOf(v) === i),
    };

    if (this.isAdd) {
      this.menuService.create(model).subscribe(
        (res) => {
          this.isLoading = false;
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
          this.resetForm();
          this.initListMenu();
          this.onAddItem();
        },
        (err) => {
          this.isLoading = false;
          if (err.error) {
            this.messageService.error(`${err.error.message}`);
          } else {
            this.messageService.error(`${err.status}`);
          }
        },
      );
    }

    if (this.isEdit) {
      this.menuService.update(model).subscribe(
        (res: any) => {
          this.isLoading = false;
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
          this.resetForm();
          this.initListMenu();
          this.onAddItem();
        },
        (err: any) => {
          this.isLoading = false;
          if (err.error) {
            this.messageService.error(`${err.error.message}`);
          } else {
            this.messageService.error(`${err.status}`);
          }
        },
      );
    }
  }

  nzEventRoleChange(event: NzFormatEmitEvent): void {
    if (event.checkedKeys && event.checkedKeys.length > 0) {
      this.roleIdsSelected = this.roleIdsSelected.concat(event.checkedKeys.map((x) => x.origin.id)).filter((v, i, a) => a.indexOf(v) === i);
    } else {
      this.roleIdsSelected = this.roleIdsSelected.filter((x) => x !== event.node?.key);
    }
  }
}
