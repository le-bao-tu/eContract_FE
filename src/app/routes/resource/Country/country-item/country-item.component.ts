import { DOCUMENT } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { I18NService } from '@core';
import { ACLService } from '@delon/acl';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { ButtonModel } from '@model';
import { CountryApiService } from '@service';
import { cleanForm, REGEX_CODE, REGEX_NAME } from '@util';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-country-item',
  templateUrl: './country-item.component.html',
  styleUrls: ['./country-item.component.less'],
})
export class CountryItemComponent implements OnInit {
  @Input() type = 'add';
  @Input() item: any;
  @Input() isVisible = false;
  @Input() option: any;
  @Output() eventEmmit = new EventEmitter<any>();

  form: FormGroup;
  moduleName = 'quốc gia';

  isInfo = false;
  isEdit = false;
  isAdd = false;
  tittle = '';

  isLoading = false;
  isReloadGrid = false;

  btnSave: ButtonModel;
  btnSaveAndCreate: ButtonModel;
  btnCancel: ButtonModel;
  btnEdit: ButtonModel;

  regexCode = REGEX_CODE;
  regexName = REGEX_NAME;

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private countryApiService: CountryApiService,
    private aclService: ACLService,
    public settings: SettingsService,
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
    this.form = this.fb.group({
      code: [{ value: null }, [Validators.required, Validators.pattern(REGEX_CODE)]],
      name: [null, [Validators.required, Validators.pattern(REGEX_NAME)]],
      order: [null],
      status: [{ value: true }],
      description: [null],
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
    this.btnSave.grandAccess = this.aclService.canAbility('COUNTRY-ADD') || this.aclService.canAbility('COUNTRY-EDIT');
    this.btnEdit.grandAccess = this.aclService.canAbility('COUNTRY-EDIT');
    this.btnSaveAndCreate.grandAccess = this.aclService.canAbility('COUNTRY-ADD') || this.aclService.canAbility('COUNTRY-EDIT');
  }

  updateFormToEdit(): void {
    this.updateFormType('edit');
    this.form.get('name')?.enable();
    this.form.get('order')?.enable();
    this.form.get('status')?.enable();
    this.form.get('description')?.enable();
  }

  updateFormType(type: string): void {
    switch (type) {
      case 'add':
        this.isInfo = false;
        this.isEdit = false;
        this.isAdd = true;
        // this.tittle = `Thêm mới ${this.moduleName}`;
        this.tittle = `${this.i18n.fanyi('function.country.modal-item.header-add')}`;
        break;
      case 'info':
        this.isInfo = true;
        this.isEdit = false;
        this.isAdd = false;
        // this.tittle = `Chi tiết ${this.moduleName}`;
        this.tittle = `${this.i18n.fanyi('function.country.modal-item.header-info')}`;
        break;
      case 'edit':
        this.isInfo = false;
        this.isEdit = true;
        this.isAdd = false;
        // this.tittle = `Cập nhật ${this.moduleName}`;
        this.tittle = `${this.i18n.fanyi('function.country.modal-item.header-edit')}`;
        break;
      default:
        this.isInfo = false;
        this.isEdit = false;
        this.isAdd = true;
        this.tittle = `${this.i18n.fanyi('function.country.modal-item.header-add')}`;
        break;
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
    }
    if (this.isEdit) {
      this.form.get('code')?.disable();
      this.form.get('name')?.enable();
      this.form.get('status')?.enable();
      this.form.get('description')?.enable();
      this.form.get('status')?.setValue(data?.status);
    }
    if (this.isInfo) {
      this.form = this.fb.group({
        code: [{ value: null, disabled: this.isInfo }, [Validators.required, Validators.pattern(REGEX_CODE)]],
        name: [{ value: null, disabled: this.isInfo }, [Validators.required, Validators.pattern(REGEX_NAME)]],
        order: [{ value: 0, disabled: this.isInfo }],
        status: [{ value: data?.status, disabled: this.isInfo }],
        description: [{ value: null, disabled: this.isInfo }],
      });
    }
    this.form.get('code')?.setValue(data?.code);
    this.form.get('name')?.setValue(data?.name);
    // this.form.get('status')?.setValue(data?.status);
    this.form.get('description')?.setValue(data?.description);
  }

  resetForm(): void {
    this.form.reset();
    this.form.get('status')?.setValue(true);
    this.form.get('order')?.setValue(0);
    this.form.get('code')?.setValue('');
    this.form.get('name')?.setValue('');
  }

  closeModalReloadData(): void {
    this.resetForm();
    this.isVisible = false;
    this.eventEmmit.emit({ type: 'success' });
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
      this.messageService.error(`${this.i18n.fanyi('function.country.modal-item.error.message.form-invalid')}`);
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
      this.messageService.error(`Tên loại hợp đồng không được để trống!`);
      return;
    }

    if (this.isAdd) {
      const promise = this.countryApiService.create(data).subscribe(
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
      const promise = this.countryApiService.update(data).subscribe(
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
}
