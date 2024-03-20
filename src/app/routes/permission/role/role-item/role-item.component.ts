import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { I18NService } from '@core';
import { ACLService } from '@delon/acl';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ButtonModel } from '@model';
import { cleanForm, REGEX_CODE, REGEX_NAME } from '@util';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import { RoleApiService } from 'src/app/services/api/role-api.service';

@Component({
  selector: 'app-role-item',
  templateUrl: './role-item.component.html',
  styleUrls: ['./role-item.component.less'],
})
export class RoleItemComponent implements OnInit {
  @Input() isVisible = false;
  @Output() eventEmmit = new EventEmitter<any>();
  @Input() type = 'add';
  @Input() item: any;
  @Input() option: any;

  tittle = '';
  isReloadGrid = false;
  isLoading = false;

  regexCode = REGEX_CODE;
  regexName = REGEX_NAME;

  form: FormGroup;

  isInfo = false;
  isEdit = false;
  isAdd = false;

  btnSave: ButtonModel;
  btnCancel: ButtonModel;
  btnEdit: ButtonModel;

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private roleApiService: RoleApiService,
    private aclService: ACLService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {
    //#region init button
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
    this.btnEdit = {
      title: 'Cập nhật',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-edit.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.updateFormToEdit();
      },
    };
    //#endregion

    this.form = this.fb.group({
      code: [{ value: null }, [Validators.required, Validators.pattern(REGEX_CODE)]],
      name: [null, [Validators.required, Validators.pattern(REGEX_NAME)]],
      order: [null],
      status: [{ value: true }],
      description: [null],
    });
  }

  ngOnInit() {
    this.initRightOfUser();
  }

  initRightOfUser() {
    this.btnEdit.grandAccess = this.aclService.canAbility('ROLE-EDIT');
    this.btnSave.grandAccess = this.aclService.canAbility('ROLE-ADD') || this.aclService.canAbility('ROLE-EDIT');
  }

  handleCancel(): void {
    this.isVisible = false;
    if (this.isReloadGrid) {
      this.eventEmmit.emit({ type: 'success' });
    } else {
      this.eventEmmit.emit({ type: 'close' });
    }
  }

  public initData(data: any, type: any = null, option: any = {}): void {
    this.isLoading = false;
    this.isReloadGrid = false;
    this.item = data;
    this.type = type;
    this.option = option;
    this.updateFormType(type);
    if (this.isAdd) {
      this.form.get('code')?.enable();
      this.form.get('name')?.enable();
      this.form.get('status')?.enable();
      this.form.get('description')?.enable();
      this.resetForm();
      this.tittle = `${this.i18n.fanyi('function.role.modal-item.header-add')}`;
    }
    if (this.isEdit) {
      this.form.get('code')?.disable();
      this.form.get('name')?.enable();
      this.form.get('status')?.enable();
      this.form.get('description')?.enable();
      this.form.get('status')?.setValue(data?.status);
      this.tittle = `${this.i18n.fanyi('function.role.modal-item.header-edit')}: ${data.code}`;
    }
    if (this.isInfo) {
      this.form.get('code')?.disable();
      this.form.get('name')?.disable();
      this.form.get('description')?.disable();
      this.form.get('status')?.setValue(data?.status);
      //this.form.get('status')?.disable();
      this.tittle = `${this.i18n.fanyi('function.role.modal-item.header-info')}: ${data.code}`;
    }
    this.form.get('code')?.setValue(data?.code);
    this.form.get('name')?.setValue(data?.name);
    // this.form.get('status')?.setValue(data?.status);
    this.form.get('description')?.setValue(data?.description);
  }

  updateFormType(type: string): void {
    switch (type) {
      case 'add':
        this.isInfo = false;
        this.isEdit = false;
        this.isAdd = true;
        break;
      case 'info':
        this.isInfo = true;
        this.isEdit = false;
        this.isAdd = false;
        break;
      case 'edit':
        this.isInfo = false;
        this.isEdit = true;
        this.isAdd = false;
        break;
      default:
        this.isInfo = false;
        this.isEdit = false;
        this.isAdd = true;
        break;
    }
  }

  resetForm(): void {
    this.form.reset();
    this.form.get('status')?.setValue(true);
    this.form.get('order')?.setValue(0);
    this.form.get('code')?.setValue('');
    this.form.get('name')?.setValue('');
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
      this.messageService.error(`${this.i18n.fanyi('function.role.modal-item.error.message.form-invalid')}`);
      return;
    }

    const data = {
      id: this.item.id,
      name: this.form.controls.name.value,
      code: this.form.controls.code.value.toUpperCase(),
      status: this.form.controls.status.value,
      description: this.form.controls.description.value,
    };
    if (data.name === null || data.name === undefined || data.name === '') {
      this.isLoading = false;
      this.messageService.error(`${this.i18n.fanyi('function.role.modal-item.error.message.name')}`);
      return;
    }

    if (this.isAdd) {
      const promise = this.roleApiService.create(data).subscribe(
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
      const promise = this.roleApiService.update(data).subscribe(
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

  updateFormToEdit(): void {
    this.updateFormType('edit');
    this.form.get('name')?.enable();
    this.form.get('order')?.enable();
    this.form.get('status')?.enable();
    this.form.get('description')?.enable();
  }

  closeModalReloadData(): void {
    this.resetForm();
    this.isVisible = false;
    this.eventEmmit.emit({ type: 'success' });
  }
}
