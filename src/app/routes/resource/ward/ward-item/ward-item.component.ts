import { DOCUMENT } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { I18NService } from '@core';
import { ACLService } from '@delon/acl';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { ButtonModel, QueryFilerModel } from '@model';
import { DistrictApiService, WardApiService } from '@service';
import { cleanForm, QUERY_FILTER_DEFAULT, REGEX_CODE, REGEX_NAME } from '@util';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-ward-item',
  templateUrl: './ward-item.component.html',
  styleUrls: ['./ward-item.component.less'],
})
export class WardItemComponent implements OnInit {
  @Input() type = 'add';
  @Input() item: any;
  @Input() isVisible = false;
  @Input() option: any;
  @Output() eventEmmit = new EventEmitter<any>();

  form: FormGroup;
  moduleName = 'phường xã';

  isInfo = false;
  isEdit = false;
  isAdd = false;
  tittle = '';
  listDistrictName: any[] = [];
  listProvinceName: any[] = [];
  headerUploadFile = {};
  isLoading = false;
  isReloadGrid = false;

  btnSave: ButtonModel;
  btnSaveAndCreate: ButtonModel;
  btnCancel: ButtonModel;
  btnEdit: ButtonModel;
  filter: QueryFilerModel = { ...QUERY_FILTER_DEFAULT };

  regexCode = REGEX_CODE;
  regexName = REGEX_NAME;

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private wardApiService: WardApiService,
    private aclService: ACLService,
    private districtApiService: DistrictApiService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    @Inject(DOCUMENT) private doc: any,
  ) {
    const token = tokenService.get()?.token;
    if (token) {
      this.headerUploadFile = {
        Authorization: 'Bearer ' + token,
      };
    }
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
      districtId: [null, [Validators.required]],
      provinceId: [null, [Validators.required]],
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
    this.btnSave.grandAccess = this.aclService.canAbility('WARD-ADD') || this.aclService.canAbility('WARD-EDIT');
    this.btnEdit.grandAccess = this.aclService.canAbility('WARD-EDIT');
    this.btnSaveAndCreate.grandAccess = this.aclService.canAbility('WARD-ADD') || this.aclService.canAbility('WARD-EDIT');
  }

  updateFormToEdit(): void {
    this.updateFormType('edit');
    this.form.get('name')?.enable();
    this.form.get('order')?.enable();
    this.form.get('status')?.enable();
    this.form.get('districtId')?.enable();
    this.form.get('provinceId')?.enable();
    this.form.get('provinceName')?.enable();
    this.form.get('description')?.enable();
    this.form.get('districtName')?.enable();
  }

  updateFormType(type: string): void {
    switch (type) {
      case 'add':
        this.isInfo = false;
        this.isEdit = false;
        this.isAdd = true;
        // this.tittle = `Thêm mới ${this.moduleName}`;
        this.tittle = `${this.i18n.fanyi('function.ward.modal-item.header-add')}`;
        break;
      case 'info':
        this.isInfo = true;
        this.isEdit = false;
        this.isAdd = false;
        // this.tittle = `Chi tiết ${this.moduleName}`;
        this.tittle = `${this.i18n.fanyi('function.ward.modal-item.header-info')}`;
        break;
      case 'edit':
        this.isInfo = false;
        this.isEdit = true;
        this.isAdd = false;
        // this.tittle = `Cập nhật ${this.moduleName}`;
        this.tittle = `${this.i18n.fanyi('function.ward.modal-item.header-edit')}`;
        break;
      default:
        this.isInfo = false;
        this.isEdit = false;
        this.isAdd = true;
        // this.tittle = `Thêm mới ${this.moduleName}`;
        this.tittle = `${this.i18n.fanyi('function.ward.modal-item.header-add')}`;
        break;
    }
  }
  changeProvince(event: any) {
    this.filter.provinceId = event;
    this.getlistDistrictByProviceId(event);
    // this.initGridData();
  }

  getlistDistrictByProviceId(provinceId: any): void {
    this.districtApiService.getListCombobox(provinceId).subscribe((data: any) => {
      this.listDistrictName = data.data;
    });
  }

  public initData(data: any, type: any = null, option: any = {}): void {
    this.isLoading = false;
    this.isReloadGrid = false;
    this.item = data;
    this.type = type;
    this.option = option;
    this.listDistrictName = option.listDistrictName;
    this.listProvinceName = option.listProvinceName;

    this.updateFormType(type);
    if (this.isAdd) {
      this.form.get('code')?.enable();
      this.form.get('name')?.enable();
      this.form.get('status')?.enable();
      this.form.get('description')?.enable();
      this.form.get('districtId')?.enable();
      this.form.get('provinceId')?.enable();
      this.resetForm();
    }
    if (this.isEdit) {
      this.form.get('code')?.disable();
      this.form.get('name')?.enable();
      this.form.get('status')?.enable();
      this.form.get('description')?.enable();
      this.form.get('districtId')?.enable();
      this.form.get('districtId')?.setValue(data?.districtId);
      this.form.get('provinceId')?.enable();
      this.form.get('provinceId')?.setValue(data?.provinceId);
      this.form.get('status')?.setValue(data?.status);
    }
    if (this.isInfo) {
      this.form = this.fb.group({
        code: [{ value: null, disabled: this.isInfo }, [Validators.required, Validators.pattern(REGEX_CODE)]],
        name: [{ value: null, disabled: this.isInfo }, [Validators.required, Validators.pattern(REGEX_NAME)]],
        provinceId: [{ value: data?.provinceId, disabled: this.isInfo }, [Validators.required]],
        districtId: [{ value: data?.districtId, disabled: this.isInfo }, [Validators.required]],
        status: [{ value: data?.status, disabled: this.isInfo }],
        description: [{ value: null, disabled: this.isInfo }],
      });
    }
    this.form.get('code')?.setValue(data?.code);
    this.form.get('name')?.setValue(data?.name);
    this.form.get('description')?.setValue(data?.description);
  }

  resetForm(): void {
    this.form.reset();
    this.form.get('status')?.setValue(true);
    this.form.get('order')?.setValue(0);
    this.form.get('code')?.setValue('');
    this.form.get('name')?.setValue('');
    this.form.get('provinceId')?.setValue('');
    this.form.get('districtId')?.setValue('');
    this.form.get('description')?.setValue('');
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
      this.messageService.error(`${this.i18n.fanyi('function.ward.modal-item.error.message.form-invalid')}`);
      return;
    }

    const data = {
      id: this.item.id,
      name: this.form.controls.name.value,
      code: this.form.controls.code.value.toUpperCase(),
      districtId: this.form.controls.districtId.value,
      provinceId: this.form.controls.provinceId.value,
      status: this.form.controls.status.value,
      description: this.form.controls.description.value,
    };

    if (this.isAdd) {
      const promise = this.wardApiService.create(data).subscribe(
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
      const promise = this.wardApiService.update(data).subscribe(
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
