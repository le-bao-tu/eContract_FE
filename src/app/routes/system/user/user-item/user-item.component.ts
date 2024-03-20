import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ACLService } from '@delon/acl';
import { ButtonModel } from '@model';
import { UserApiService } from '@service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';

import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { cleanForm, ROLE_SYS_ADMIN } from '@util';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-user-item',
  templateUrl: './user-item.component.html',
  styleUrls: ['./user-item.component.less'],
})
export class UserItemComponent implements OnInit {
  @Input() type = 'add';
  @Input() item: any;
  @Input() isVisible = false;
  @Input() option: any;
  @Output() eventEmmit = new EventEmitter<any>();

  form: FormGroup;
  moduleName = 'người dùng';

  isInfo = false;
  isEdit = false;
  isAdd = false;
  tittle = '';

  isLoading = false;
  isReloadGrid = false;

  listOrganization: any[] = [];
  listPosition: any[] = [];

  isChangePass = false;

  btnSave: ButtonModel;
  btnSaveAndCreate: ButtonModel;
  btnCancel: ButtonModel;
  btnEdit: ButtonModel;

  checkSysAdmin = false;

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private userApiService: UserApiService,
    private notification: NzNotificationService,
    private aclService: ACLService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
  ) {
    this.btnSave = {
      title: 'Lưu',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.save();
      },
    };
    this.btnSaveAndCreate = {
      title: 'Lưu & Thêm mới',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.save(true);
      },
    };
    this.btnCancel = {
      title: 'Đóng',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.handleCancel();
      },
    };
    this.btnEdit = {
      title: 'Cập nhật',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.updateFormType('edit');
      },
    };
    this.form = this.fb.group({
      organizationId: [null, [Validators.required]],
      positionId: [null],
      name: [null, [Validators.required]],
      email: [null, [Validators.required]],
      phoneNumber: [null, [Validators.required]],
      userName: [null, [Validators.required]],
      newPassword: [null, [Validators.required]],
      confirmPassword: [null],
      certAlias: [null, [Validators.required]],
      certUserPin: [null, [Validators.required]],
      certSlotLabel: [null, [Validators.required]],
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
  }

  initRightOfUser(): void {
    // this.btnSave.grandAccess = this.aclService.canAbility('UNIT-CREATE');
    // this.btnEdit.grandAccess = this.aclService.canAbility('UNIT-EDIT');
    // this.btnSaveAndCreate.grandAccess = this.aclService.canAbility('UNIT-CREATE');
  }

  updateFormToEdit(): void {
    this.form.get('organizationId')?.enable();
    this.form.get('positionId')?.enable();
    this.form.get('name')?.enable();
    this.form.get('email')?.enable();
    this.form.get('phoneNumber')?.enable();
    this.form.get('userName')?.disable();
    this.form.get('newPassword')?.enable();
    this.form.get('confirmPassword')?.enable();
    this.form.get('certAlias')?.enable();
    this.form.get('certUserPin')?.enable();
    this.form.get('certSlotLabel')?.enable();
    this.form.get('isSystemAdmin')?.enable();
    this.form.get('isOrgAdmin')?.enable();
    this.form.get('isUser')?.enable();
  }

  updateFormToInfo(): void {
    this.form.get('organizationId')?.disable();
    this.form.get('positionId')?.disable();
    this.form.get('name')?.disable();
    this.form.get('email')?.disable();
    this.form.get('phoneNumber')?.disable();
    this.form.get('userName')?.disable();
    this.form.get('newPassword')?.disable();
    this.form.get('confirmPassword')?.disable();
    this.form.get('certAlias')?.disable();
    this.form.get('certUserPin')?.disable();
    this.form.get('certSlotLabel')?.disable();
    this.form.get('isSystemAdmin')?.disable();
    this.form.get('isOrgAdmin')?.disable();
    this.form.get('isUser')?.disable();
  }

  updateValueToForm(data: any): void {
    this.form.get('organizationId')?.setValue(data.organizationId);
    this.form.get('positionId')?.setValue(data.positionId);
    this.form.get('name')?.setValue(data.name);
    this.form.get('email')?.setValue(data.email);
    this.form.get('phoneNumber')?.setValue(data.phoneNumber);
    this.form.get('userName')?.setValue(data.userName);
    this.form.get('newPassword')?.setValue('**********');
    this.form.get('confirmPassword')?.setValue('**********');
    this.form.get('certAlias')?.setValue(data.certAlias);
    this.form.get('certUserPin')?.setValue(data.certUserPin);
    this.form.get('certSlotLabel')?.setValue(data.certSlotLabel);
    this.form.get('isSystemAdmin')?.setValue(data.isSystemAdmin);
    this.form.get('isOrgAdmin')?.setValue(data.isOrgAdmin);
    this.form.get('isUser')?.setValue(data.isUser);
  }

  updateFormType(type: string): void {
    switch (type) {
      case 'add':
        this.form.reset();
        this.isInfo = false;
        this.isEdit = false;
        this.isAdd = true;
        this.tittle = `Thêm mới ${this.moduleName}`;
        // Mặc định là đơn vị hiện tại
        const tokenData = this.tokenService.get();
        if (tokenData) {
          this.form.get('organizationId')?.setValue(tokenData.organizationId);
        }
        // Nếu người dùng không có quyền admin hệ thống thì disable thông tin đơn vị đi
        if (!this.checkSysAdmin) {
          this.form.get('organizationId')?.disable();
        }
        break;
      case 'info':
        this.updateFormToInfo();
        this.isInfo = true;
        this.isEdit = false;
        this.isAdd = false;
        this.tittle = `Chi tiết ${this.moduleName}`;
        break;
      case 'edit':
        this.updateFormToEdit();
        this.isInfo = false;
        this.isEdit = true;
        this.isAdd = false;
        this.tittle = `Cập nhật ${this.moduleName}`;
        break;
      default:
        this.isInfo = false;
        this.isEdit = false;
        this.isAdd = true;
        this.tittle = `Thêm mới ${this.moduleName}`;
        break;
    }
  }

  public initData(data: any, type: any = null, option: any = {}): void {
    this.checkSysAdmin = this.aclService.can(ROLE_SYS_ADMIN);
    this.isLoading = false;
    this.isChangePass = false;
    this.isReloadGrid = false;
    this.item = data;
    this.type = type;
    this.option = option;
    this.listOrganization = option.listOrganization;
    this.listPosition = option.listPosition;
    this.updateFormType(type);
    if (data.id) {
      this.getUserDetailById(data.id);
    }

    if (true) {
    }
  }

  resetForm(): void {
    this.form.reset();
    this.form.get('status')?.setValue(true);
    this.form.get('order')?.setValue(0);
  }

  closeModalReloadData(): void {
    this.isVisible = false;
    this.eventEmmit.emit({ type: 'success' });
  }

  onChangePassword(): void {
    this.isChangePass = true;
  }

  async getUserDetailById(id: string): Promise<any> {
    const res = await this.userApiService.getById(id).toPromise();
    if (res.code !== 200) {
      this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
      return;
    }
    if (res.data === null || res.data === undefined) {
      this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
      return;
    }
    this.item = res.data;
    this.updateValueToForm(this.item);
    return res.data;
  }

  save(isCreateAfter: boolean = false): Subscription | undefined {
    this.isLoading = true;

    cleanForm(this.form);
    // tslint:disable-next-line:forin
    for (const i in this.form.controls) {
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity();
    }
    if (!this.form.valid) {
      this.isLoading = false;
      this.messageService.error(`Kiểm tra lại thông tin các trường đã nhập!`);
      return;
    }

    const password = this.form.controls.newPassword.value;
    const confirmPassword = this.form.controls.confirmPassword.value;

    if (password !== confirmPassword) {
      this.isLoading = false;
      this.messageService.error(`Mật khẩu không trùng khớp!`);
      return;
    }

    const data = {
      id: this.item.id,
      organizationId: this.form.controls.organizationId.value,
      positionId: this.form.controls.positionId.value,
      name: this.form.controls.name.value,
      email: this.form.controls.email.value,
      phoneNumber: this.form.controls.phoneNumber.value,
      userName: this.form.controls.userName.value,
      password: this.isChangePass ? this.form.controls.newPassword.value : null,
      certAlias: this.form.controls.certAlias.value,
      certUserPin: this.form.controls.certUserPin.value,
      certSlotLabel: this.form.controls.certSlotLabel.value,
      isSystemAdmin: this.form.controls.isSystemAdmin.value ? true : false,
      isOrgAdmin: this.form.controls.isOrgAdmin.value ? true : false,
      isUser: this.form.controls.isUser.value ? true : false,
      status: true,
    };

    if (!data.isOrgAdmin && !data.isSystemAdmin && !data.isUser) {
      this.isLoading = false;
      this.messageService.error(`Bạn phải chọn ít nhất một quyền tài khoản!`);
      return;
    }

    if (this.isAdd) {
      const promise = this.userApiService.create(data).subscribe(
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
          this.messageService.success(`Thêm mới người dùng thành công`);
          this.isReloadGrid = true;
          if (isCreateAfter) {
            this.resetForm();
          } else {
            this.closeModalReloadData();
          }
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
      return promise;
    } else if (this.isEdit) {
      const promise = this.userApiService.update(data).subscribe(
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
          this.messageService.success(`Cập nhật thông tin người dùng thành công`);

          this.closeModalReloadData();
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
      return promise;
    } else {
      return;
    }
  }
}
