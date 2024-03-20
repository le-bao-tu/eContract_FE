import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ACLService } from '@delon/acl';
import { ButtonModel } from '@model';
import { UserApiService, UserRoleService, UserService } from '@service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';

import { DOCUMENT } from '@angular/common';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { ArrayService } from '@delon/util';
import { cleanForm, ROLE_SYS_ADMIN } from '@util';
import { NzFormatEmitEvent } from 'ng-zorro-antd/tree';
import { RoleApiService } from 'src/app/services/api/role-api.service';

@Component({
  selector: 'app-add-role',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.less'],
})
export class AddRoleComponent implements OnInit {
  @Input() type = 'add';
  @Input() item: any;
  @Input() isVisible = false;
  @Input() option: any;
  @Output() eventEmmit = new EventEmitter<any>();

  form: FormGroup;
  moduleName = 'phân quyền người dùng';
  checkSysAdmin = false;
  isInfo = false;
  isEdit = false;
  isAdd = false;
  tittle = '';
  userId = '';
  isLoading = false;
  isReloadGrid = false;

  btnSave: ButtonModel;
  btnCancel: ButtonModel;

  listRole: any[] = [];
  roleIds: any[] = [];

  listRoleOrigin: any[] = [];

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private userRoleService: UserRoleService,
    private roleService: RoleApiService,
    private aclService: ACLService,
    private arrayService: ArrayService,
    private userService: UserApiService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    @Inject(DOCUMENT) private doc: any,
  ) {
    this.btnSave = {
      title: 'Lưu',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-save.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.save();
        this.updateUserRole();
      },
    };
    this.btnCancel = {
      title: 'Đóng',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-cancel.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.handleCancel();
      },
    };
    this.form = this.fb.group({
      isSystemAdmin: [false],
      isOrgAdmin: [false],
      isUser: [false],
    });
  }

  handleCancel(): void {
    this.isVisible = false;
    if (this.isReloadGrid) {
      this.eventEmmit.emit({ type: 'success' });
    } else {
      this.eventEmmit.emit({ type: 'close' });
    }
  }

  ngOnInit(): void {
    this.initRightOfUser();
    this.checkSysAdmin = this.aclService.can(ROLE_SYS_ADMIN);
  }

  initRightOfUser(): void {
    // this.btnSave.grandAccess = this.aclService.canAbility('UNIT-CREATE');
    // this.btnEdit.grandAccess = this.aclService.canAbility('UNIT-EDIT');
    // this.btnSaveAndCreate.grandAccess = this.aclService.canAbility('UNIT-CREATE');
  }

  updateFormToAdd(): void {
    this.resetForm();
    this.isInfo = false;
    this.isEdit = false;
    this.isAdd = true;
    this.tittle = `Thêm mới ${this.moduleName}`;
    this.form.get('isSystemAdmin')?.enable();
    this.form.get('isOrgAdmin')?.enable();
    this.form.get('isUser')?.enable();
  }

  updateFormToEdit(data: any): void {
    this.resetForm();
    this.isInfo = false;
    this.isEdit = true;
    this.isAdd = false;
    // this.tittle = `Cập nhật ${this.moduleName}`;
    this.tittle = `${this.i18n.fanyi('function.add-role.modal-item.header-edit')}`;
    this.form.get('isSystemAdmin')?.setValue(data?.isSystemAdmin ? data?.isSystemAdmin : false);
    this.form.get('isOrgAdmin')?.setValue(data?.isOrgAdmin ? data?.isOrgAdmin : false);
    this.form.get('isUser')?.setValue(data?.isUser ? data?.isUser : false);
    this.form.get('isSystemAdmin')?.enable();
    this.form.get('isOrgAdmin')?.enable();
    this.form.get('isUser')?.enable();
  }

  updateFormToInfo(data: any): void {
    this.resetForm();
    this.isInfo = true;
    this.isEdit = false;
    this.isAdd = false;
    this.tittle = `Chi tiết ${this.moduleName}`;

    this.form.get('isSystemAdmin')?.setValue(this.item?.isSystemAdmin ? this.item?.isSystemAdmin : false);
    this.form.get('isOrgAdmin')?.setValue(this.item?.isOrgAdmin ? this.item?.isOrgAdmin : false);
    this.form.get('isUser')?.setValue(this.item?.isUser ? this.item?.isUser : false);

    this.form.get('isSystemAdmin')?.disable();
    this.form.get('isOrgAdmin')?.disable();
    this.form.get('isUser')?.disable();
  }

  updateFormType(type: string, data: any = {}): void {
    switch (type) {
      case 'add':
        this.updateFormToAdd();
        break;
      case 'info':
        this.updateFormToInfo(data);
        break;
      case 'edit':
        this.updateFormToEdit(data);
        break;
      default:
        this.updateFormToAdd();
        break;
    }
  }
  async getUserRoleByUserId(id: string): Promise<any> {
    const res = await this.userRoleService.getById(id).toPromise();
    if (res.code !== 200) {
      this.messageService.error(`Có lỗi xảy ra ${res.message}`);
      return;
    }
    this.item = res.data;

    this.updateFormType(this.type, this.item);
    return res.data;
  }
  public initData(data: any, type: any = null, listRole: any[], option: any = {}): void {
    this.listRoleOrigin = listRole;
    this.resetForm();
    this.isVisible = true;
    this.isLoading = false;
    this.isReloadGrid = false;
    this.type = type;
    this.option = option;
    if (data.id) {
      this.userId = data.id;
      this.getUserRoleByUserId(this.userId);
      this.getRoleByUser(data.id);
    }
  }

  getListRolesForCombobox(userId: any) {
    const arrayTreeResult = this.listRoleOrigin.map((item: any, i: number, arr: any[]) => {
      const checkIsLeft = arr.some((c) => c.parentId === item.id);

      const checked = this.roleIds.some((x) => x === item.id);

      return {
        id: item.id,
        parent_id: item.parentId,
        title: item.name,
        isLeaf: !checkIsLeft,
        expanded: false,
        selected: false,
        checked,
      };
    });

    this.listRole = this.arrayService.arrToTreeNode(arrayTreeResult, {
      cb: (item, parent, deep) => {
        // item.expanded = deep <= 1;
        item.selected = item.id === 0;
      },
    });
  }

  getRoleByUser(userId: any) {
    const model = {
      id: userId,
    };
    this.userService.getUserRole(model).subscribe(
      (res) => {
        if (res.data && res.data.listRoleId) {
          this.roleIds = res.data.listRoleId;
        }

        this.getListRolesForCombobox(userId);
      },
      (err) => console.log(err),
    );
  }

  updateUserRole() {
    const model = {
      id: this.userId,
      listRoleId: this.roleIds,
    };
    this.userService.updateUserRole(model).subscribe(
      (res) => {
        if (res.code !== 200) {
          this.messageService.error(`${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.messageService.error(`${res.message}`);
          return;
        }
        this.messageService.success(`${res.message}`);
        this.isVisible = false;
      },
      (err) => console.log(err),
    );
  }

  nzEventRoleChange(event: NzFormatEmitEvent): void {
    if (event.checkedKeys && event.checkedKeys.length > 0) {
      this.roleIds = this.roleIds.concat(event.checkedKeys.map((x) => x.origin.id)).filter((v, i, a) => a.indexOf(v) === i);
    } else {
      this.roleIds = this.roleIds.filter((x) => x !== event.node?.key);
    }
  }

  resetForm(): void {
    this.form.reset();
  }

  closeModalReloadData(): void {
    this.isVisible = false;
    this.eventEmmit.emit({ type: 'success' });
  }

  save(isCreateAfter: boolean = false): Subscription | undefined {
    return;
    // this.isLoading = true;

    // cleanForm(this.form);
    // // tslint:disable-next-line:forin
    // for (const i in this.form.controls) {
    //   this.form.controls[i].markAsDirty();
    //   this.form.controls[i].updateValueAndValidity();
    // }
    // if (!this.form.valid) {
    //   this.isLoading = false;
    //   this.messageService.error(`Kiểm tra lại thông tin các trường đã nhập!`);
    //   return;
    // }
    // const data = {
    //   userId: this.userId,
    //   isSystemAdmin: this.form.controls.isSystemAdmin.value,
    //   isOrgAdmin: this.form.controls.isOrgAdmin.value,
    //   isUser: this.form.controls.isUser.value,
    // };
    // const promise = this.userRoleService.createOrUpdate(data).subscribe(
    //   (res: any) => {
    //     this.isLoading = false;
    //     if (res.code !== 200) {
    //       this.messageService.error(`${res.message}`);
    //       return;
    //     }
    //     if (res.data === null || res.data === undefined) {
    //       this.messageService.error(`${res.message}`);
    //       return;
    //     }
    //     const dataResult = res.data;
    //     this.messageService.success(`${res.message}`);
    //     this.closeModalReloadData();
    //   },
    //   (err: any) => {
    //     this.isLoading = false;
    //     if (err.error) {
    //       this.messageService.error(`${err.error.message}`);
    //     } else {
    //       this.messageService.error(`${err.status}`);
    //     }
    //   },
    // );
    // return promise;
  }
}
