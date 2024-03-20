import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ACLService } from '@delon/acl';
import { ButtonModel } from '@model';
import { OrganizationApiService, PositionApiService } from '@service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';

import { cleanForm, REGEX_CODE, REGEX_EMAIL, REGEX_NAME, REGEX_PHONE } from '@util';

@Component({
  selector: 'app-contact-item',
  templateUrl: './contact-item.component.html',
  styleUrls: ['./contact-item.component.less'],
})
export class ContactItemComponent implements OnInit {
  type = 'add';
  item: any;
  @Input() isVisible = false;
  option: any;
  @Output() eventEmmit = new EventEmitter<any>();

  form: FormGroup;
  moduleName = 'liên hệ';

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

  listOfOrgs: any[] = [];
  listOfPositions: any[] = [];

  regexCode = REGEX_CODE;
  regexName = REGEX_NAME;

  regexVietNamese = REGEX_NAME;
  regextMail = REGEX_EMAIL;
  regexPhone = REGEX_PHONE;

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private aclService: ACLService,
    private organizationApiService: OrganizationApiService,
    private positionApiService: PositionApiService,
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
        this.updateFormToEdit();
      },
    };
    this.form = this.fb.group({
      name: [null, [Validators.required]],
      email: [null],
      phoneNumber: [true],
      organizationName: [null],
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
    this.initListOrgs();
    this.initListPositions();
  }

  initRightOfUser(): void {
    // this.btnSave.grandAccess = this.aclService.canAbility('UNIT-CREATE');
    // this.btnEdit.grandAccess = this.aclService.canAbility('UNIT-EDIT');
    // this.btnSaveAndCreate.grandAccess = this.aclService.canAbility('UNIT-CREATE');
  }

  initListOrgs(): Subscription | undefined {
    const promise = this.organizationApiService.getListCombobox().subscribe(
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
        this.listOfOrgs = dataResult;
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
  }

  initListPositions(): Subscription | undefined {
    const promise = this.positionApiService.getListCombobox().subscribe(
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
        this.listOfPositions = dataResult;
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
  }

  updateFormToEdit(): void {
    this.updateFormType('edit');
    this.form.get('name')?.enable();
    this.form.get('email')?.enable();
    this.form.get('phoneNumber')?.enable();
    this.form.get('organizationId')?.enable();
    this.form.get('positionId')?.enable();
    this.form.get('address')?.enable();
    this.form.get('status')?.enable();
  }

  updateFormType(type: string): void {
    switch (type) {
      case 'add':
        this.isInfo = false;
        this.isEdit = false;
        this.isAdd = true;
        this.tittle = `Thêm mới ${this.moduleName}`;
        break;
      case 'info':
        this.isInfo = true;
        this.isEdit = false;
        this.isAdd = false;
        this.tittle = `Chi tiết ${this.moduleName}`;
        break;
      case 'edit':
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
    this.isLoading = false;
    this.isReloadGrid = false;
    this.item = data;
    this.type = type;
    this.option = option;
    this.updateFormType(type);
    if (this.item.id === null || this.item.id === undefined) {
      this.form = this.fb.group({
        name: [{ value: null, disabled: this.isInfo }, [Validators.required, Validators.pattern(this.regexVietNamese)]],
        email: [{ value: null, disabled: this.isInfo }, [Validators.required, Validators.pattern(this.regextMail)]],
        phoneNumber: [{ value: null, disabled: this.isInfo }, [Validators.required, Validators.pattern(this.regexPhone)]],
        organizationId: [{ value: null, disabled: this.isInfo }],
        positionId: [{ value: null, disabled: this.isInfo }],
        address: [{ value: null, disabled: this.isInfo }],
        status: [{ value: true, disabled: this.isInfo }],
      });
    } else {
      this.form = this.fb.group({
        name: [{ value: this.item.name, disabled: this.isInfo }, [Validators.required, Validators.pattern(this.regexVietNamese)]],
        email: [{ value: this.item.email, disabled: this.isInfo }, [Validators.required, Validators.pattern(this.regextMail)]],
        phoneNumber: [{ value: this.item.phoneNumber, disabled: this.isInfo }, [Validators.required, Validators.pattern(this.regexPhone)]],
        organizationId: [{ value: this.item.organizationId, disabled: this.isInfo }],
        positionId: [{ value: this.item.positionId, disabled: this.isInfo }],
        address: [{ value: this.item.address, disabled: this.isInfo }],
        status: [{ value: this.item.status, disabled: this.isInfo }],
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

  save(isCreateAfter: boolean = false): Subscription | undefined | any {
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

    const data = {
      id: this.item.id,
      code: '',
      name: this.form.controls.name.value,
      email: this.form.controls.email.value,
      phoneNumber: this.form.controls.phoneNumber.value,
      organizationId: this.form.controls.organizationId?.value,
      organizationName: null,
      positionId: this.form.controls.positionId?.value,
      positionName: null,
      address: this.form.controls.address?.value,
      userId: null,
      status: this.form.controls.status.value,
    };

    if (data.name === null || data.name === undefined || data.name === '') {
      this.isLoading = false;
      this.messageService.error(`Họ và tên không được để trống!`);
      return;
    }
    if (data.email === null || data.email === undefined || data.email === '') {
      this.isLoading = false;
      this.messageService.error(`Email không được để trống!`);
      return;
    }
    if (data.phoneNumber === null || data.phoneNumber === undefined || data.phoneNumber === '') {
      this.isLoading = false;
      this.messageService.error(`Số điện thoại không được để trống!`);
      return;
    }

    // CHeck điềU kIện
    if (this.option.type === 'internal') {
      // Organization
      if (data.organizationId === null || data.organizationId === undefined || data.organizationId === '') {
        this.isLoading = false;
        this.messageService.error(`Bộ phận không được để trống!`);
        return;
      } else {
        data.organizationName = this.listOfOrgs.filter((item) => item.id === data.organizationId)[0].name;
      }

      // Position
      if (data.positionId === null || data.positionId === undefined || data.positionId === '') {
        this.isLoading = false;
        this.messageService.error(`Chức vụ không được để trống!`);
        return;
      } else {
        data.positionName = this.listOfPositions.filter((item) => item.id === data.positionId)[0].name;
      }
    }

    if (this.option.type !== 'internal') {
      data.userId = this.item.userId;
    }

    // console.log(data);
    // if (this.isAdd) {
    //   const promise = this.contactApiService.create(data).subscribe(
    //     (res: any) => {
    //       this.isLoading = false;
    //       if (res.code !== 200) {
    //         this.messageService.error(`${res.message}`);
    //         return;
    //       }
    //       if (res.data === null || res.data === undefined) {
    //         this.messageService.error(`${res.message}`);
    //         return;
    //       }
    //       const dataResult = res.data;
    //       this.messageService.success(`${res.message}`);
    //       this.isReloadGrid = true;
    //       if (isCreateAfter) {
    //         this.resetForm();
    //       } else {
    //         this.closeModalReloadData();
    //       }
    //     },
    //     (err: any) => {
    //       this.isLoading = false;
    //       if (err.error) {
    //         this.messageService.error(`${err.error.message}`);
    //       } else {
    //         this.messageService.error(`${err.status}`);
    //       }
    //     },
    //   );
    //   return promise;
    // } else if (this.isEdit) {
    //   const promise = this.contactApiService.update(data).subscribe(
    //     (res: any) => {
    //       this.isLoading = false;
    //       if (res.code !== 200) {
    //         this.messageService.error(`${res.message}`);
    //         return;
    //       }
    //       if (res.data === null || res.data === undefined) {
    //         this.messageService.error(`${res.message}`);
    //         return;
    //       }
    //       const dataResult = res.data;
    //       this.messageService.success(`${res.message}`);
    //       this.closeModalReloadData();
    //     },
    //     (err: any) => {
    //       this.isLoading = false;
    //       if (err.error) {
    //         this.messageService.error(`${err.error.message}`);
    //       } else {
    //         this.messageService.error(`${err.status}`);
    //       }
    //     },
    //   );
    //   return promise;
    // } else {
    //   return;
    // }
  }
}
