import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ACLService } from '@delon/acl';
import { ButtonModel } from '@model';
import { UnitApiService } from '@service';

import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { InfoInCertifyApiService } from '@service';
import { cleanForm, REGEX_CODE, REGEX_NAME } from '@util';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-info-in-certify-item',
  templateUrl: './info-in-certify-item.component.html',
  styleUrls: ['./info-in-certify-item.component.less'],
})
export class InfoInCertifyItemComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private infoInCertifyApiService: InfoInCertifyApiService,
    private aclService: ACLService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
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
    this.btnAddOption = {
      title: 'Thêm lựa chọn',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: false,
      click: ($event: any) => {
        this.addOption();
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
      code: [null, [Validators.required, Validators.pattern(this.regexCode)]],
      name: [null, [Validators.required, Validators.pattern(this.regexName)]],
      dataType: [null, [Validators.required]],
      isRequire: [true, [Validators.required]],
      status: [true],
      description: [null],
    });
  }
  @Input() type = 'add';
  @Input() item: any;
  @Input() isVisible = false;
  @Input() option: any;
  @Output() eventEmmit = new EventEmitter<any>();

  form: FormGroup;
  moduleName = 'thông tin trong hợp đồng';

  isInfo = false;
  isEdit = false;
  isAdd = false;
  tittle = '';

  isLoading = false;
  isReloadGrid = false;

  regexCode = REGEX_CODE;
  regexName = REGEX_NAME;

  btnSave: ButtonModel;
  btnSaveAndCreate: ButtonModel;
  btnCancel: ButtonModel;
  btnAddOption: ButtonModel;
  btnEdit: ButtonModel;
  DATA_TYPE_MULTIPLE_CHECKBOX = 5;
  listDataType: any[] = [
    {
      name: 'Number (kiểu số)',
      value: 1,
    },
    {
      name: 'Text (kiểu chữ)',
      value: 2,
    },
    {
      name: 'Date (kiểu ngày tháng)',
      value: 3,
    },
    {
      name: 'Radio (kiểu lựa chọn duy nhất)',
      value: 4,
    },
    {
      name: 'Checkbox (kiểu nhiều lựa chọn)',
      value: 5,
    },
  ];

  isMultipleOption = false;
  listOption: any[] = [];

  optionValue = 0;

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

  onDataTypeChange(): void {
    if (this.form.get('dataType')?.value === '5') {
      this.isMultipleOption = true;
    } else {
      this.isMultipleOption = false;
    }
  }

  initRightOfUser(): void {
    this.btnEdit.grandAccess = this.aclService.canAbility('META-DATA-EDIT');
    this.btnSave.grandAccess = this.aclService.canAbility('META-DATA-ADD') || this.aclService.canAbility('META-DATA-EDIT');
    this.btnSaveAndCreate.grandAccess = this.aclService.canAbility('META-DATA-ADD');
  }
  addOption(): void {
    this.optionValue++;
    const newOption = {
      value: this.optionValue.toString(),
      label: '',
    };
    this.listOption.push(newOption);
  }

  removeOption(item: any): void {
    this.listOption = this.listOption.filter((option) => option.value !== item.value);
  }

  updateFormToEdit(): void {
    this.updateFormType('edit');
    this.form.get('name')?.enable();
    // this.form.get('code')?.enable();
    this.form.get('dataType')?.enable();
    this.form.get('isRequire')?.enable();
    this.form.get('status')?.enable();
    this.form.get('description')?.enable();
  }

  updateFormToInfo(): void {
    this.form.get('name')?.disable();
    this.form.get('code')?.disable();
    this.form.get('dataType')?.disable();
    this.form.get('isRequire')?.disable();
    this.form.get('status')?.disable();
    this.form.get('description')?.disable();
  }

  updateFormType(type: string): void {
    switch (type) {
      case 'add':
        this.isInfo = false;
        this.isEdit = false;
        this.isAdd = true;
        // this.tittle = `Thêm mới ${this.moduleName}`;
        this.tittle = `${this.i18n.fanyi('function.info-in-certify.modal-item.header-add')}`;
        break;
      case 'info':
        this.isInfo = true;
        this.isEdit = false;
        this.isAdd = false;
        // this.tittle = `Chi tiết ${this.moduleName}`;
        this.tittle = `${this.i18n.fanyi('function.info-in-certify.modal-item.header-info')}`;
        break;
      case 'edit':
        this.isInfo = false;
        this.isEdit = true;
        this.isAdd = false;
        // this.tittle = `Cập nhật ${this.moduleName}`;
        this.tittle = `${this.i18n.fanyi('function.info-in-certify.modal-item.header-edit')}`;
        this.form.get('code')?.disable();
        break;
      default:
        this.isInfo = false;
        this.isEdit = false;
        this.isAdd = true;
        // this.tittle = `Thêm mới ${this.moduleName}`;
        this.tittle = `${this.i18n.fanyi('function.info-in-certify.modal-item.header-add')}`;
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

    if (this.item.id === null || this.item.id === undefined) {
      this.form = this.fb.group({
        code: [{ value: null, disabled: this.isInfo }, [Validators.required, Validators.pattern(this.regexCode)]],
        name: [{ value: null, disabled: this.isInfo }, [Validators.required, Validators.pattern(this.regexName)]],
        status: [{ value: true, disabled: this.isInfo }],
        dataType: [{ value: this.listDataType[1].value, disabled: this.isInfo }, [Validators.required]],
        isRequire: [{ value: true, disabled: this.isInfo }],
        description: [{ value: null, disabled: this.isInfo }],
      });
      this.listOption = [];
      this.isMultipleOption = false;
    } else {
      // tslint:disable-next-line:no-shadowed-variable
      this.infoInCertifyApiService.getById(this.item.id).subscribe((data: any) => {
        const item = data.data;
        console.log(item);
        this.listOption = item.listData != null ? item.listData : [];
        if (item.dataType === this.DATA_TYPE_MULTIPLE_CHECKBOX) {
          this.isMultipleOption = true;
        } else {
          this.isMultipleOption = false;
        }
        this.form.get('name')?.setValue(item.name);
        this.form.get('code')?.setValue(item.code);
        this.form.get('status')?.setValue(item.status);
        this.form.get('dataType')?.setValue(item.dataType);
        this.form.get('isRequire')?.setValue(item.isRequire);
        this.form.get('description')?.setValue(item.description);

        if (this.isInfo) {
          this.updateFormToInfo();
        } else {
          this.updateFormToEdit();
        }
      });
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
      this.messageService.error(`${this.i18n.fanyi('function.info-in-certify.modal-item.error.message.form-invalid')}`);
      return;
    }

    const data = {
      id: this.item.id,
      name: this.form.controls.name.value,
      code: this.form.controls.code.value,
      isRequire: true,
      dataType: 2,
      status: this.form.controls.status.value,
      description: this.form.controls.description.value,
      listData: this.listOption,
    };
    if (data.name === null || data.name === undefined || data.name === '') {
      this.isLoading = false;
      this.messageService.error(`Tên thông tin không được để trống!`);
      return;
    }
    if (data.dataType === null || data.dataType === undefined) {
      this.isLoading = false;
      this.messageService.error(`Kiểu dữ liệu không được để trống!`);
      return;
    }
    data.code = data.code.toUpperCase();
    if (this.isAdd) {
      const promise = this.infoInCertifyApiService.create(data).subscribe(
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
      const promise = this.infoInCertifyApiService.update(data).subscribe(
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
