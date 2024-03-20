import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { I18NService } from '@core';
import { ACLService } from '@delon/acl';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { environment } from '@env/environment';
import { ButtonModel } from '@model';
import { MinIOApiService, OrgConfigService, UserApiService } from '@service';
import { LIST_EFORMCONFIG, LIST_SIGN_INFO } from '@util';
import { nodeUploadRouter, ROLE_SYS_ADMIN } from '@util';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Subscription } from 'rxjs';
import { EmaillAccountService } from 'src/app/services/api/email-account.service';

@Component({
  selector: 'app-organization-config',
  templateUrl: './organization-config.component.html',
  styleUrls: ['./organization-config.component.less'],
})
export class OrganizationConfigComponent implements OnInit {
  fileUploadUrl = environment.API_URL + nodeUploadRouter.uploadFileUnsave;
  backgroundImageUrl = '';

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private userApiService: UserApiService,
    private orgConfigService: OrgConfigService,
    private emailAccountService: EmaillAccountService,
    private minioService: MinIOApiService,
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
    this.formAdmin = this.fb.group({
      userName: ['', [Validators.required]],
    });

    this.form = this.fb.group({
      organizationTitle: [null, [Validators.required]],
      consumerKey: [null],
      userStoreIDP: [null],
      notifySendType: ['1'],
      isCallbackAuthorization: [true],
      eFormConfig: [''],
      logoFileBase64: [null],
      callbackAuthorizationUrl: [null],
      callbackUrl: [null],
      smsSendType: ['1'],
      smsotpTemplate: [null],
      adssProfileSignConfirm: [null],
      maxDocumentType: [null],
      templatePerDocumentType: [null],
      isApproveLTV: [true],
      isApproveTSA: [true],
      isApproveCertify: [false],
      isUseUI: [true],
      isApproveSignDynamicPosition: [true],
      useImagePreview: [false],
      smsAuthorizationUrl: [''],
      smsUrl: [''],
      isSMSAuthorization: [true],
      moreInfo: [''],
      isUseEverify: [false],
    });
  }
  @Input() type = 'add';
  @Input() item: any;
  @Input() isVisible = false;
  @Input() option: any;
  @Output() eventEmmit = new EventEmitter<any>();
  switchValue = false;
  form: FormGroup;
  formAdmin: FormGroup;
  moduleName = 'cấu hình thông tin kết nối';
  checkSysAdmin = false;
  isInfo = false;
  isEdit = false;
  isAdd = false;
  tittle = '';
  orgId = '';
  loading = false;
  isLoading = false;
  isReloadGrid = false;
  logoUrl = '';
  listEmailAccount: any[] = [];
  listEFormConfig: any[] = LIST_EFORMCONFIG;
  btnSave: ButtonModel;
  btnCancel: ButtonModel;
  bucketName = '';
  objectName = '';
  fileName = '';
  organizationCode = '';
  userName = '';
  initUserAdminOrgModel: any;
  isOkLoading = false;
  isVisibleModel = false;
  uploadUrl = environment.API_URL + nodeUploadRouter.uploadFileUnsave;

  listSignInfo: any[] = LIST_SIGN_INFO;

  defaultRequestCallBackAuthorizationHeaders: any = [
    {
      key: null,
      value: null,
    },
  ];
  defaultRequestCallbackHeaders: any = [
    {
      key: null,
      value: null,
    },
  ];
  defaultRequestSMSAuthorizationHeaders: any = [
    {
      key: null,
      value: null,
    },
  ];
  defaultRequestSMSHeaders: any = [
    {
      key: null,
      value: null,
    },
  ];
  emailConfig: any = {
    type: null,
    from: null,
    smtp: null,
    port: null,
    user: null,
    sendType: null,
    password: null,
    ssl: null,
  };
  smsConfig: any = {
    service: 0,
    username: '',
    password: '',
    brandname: '',
  };
  current = 0;

  isVisibleDeleteBackgroundImg: boolean = false;

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
    this.getListAccountEmaill();
    this.checkSysAdmin = this.aclService.can(ROLE_SYS_ADMIN);
  }
  addrow(item: any): void {
    if (item === 1) {
      this.defaultRequestCallBackAuthorizationHeaders.push({
        key: null,
        value: null,
      });
    } else if (item === 2) {
      this.defaultRequestCallbackHeaders.push({
        key: null,
        value: null,
      });
    } else if (item === 3) {
      this.defaultRequestSMSAuthorizationHeaders.push({
        key: null,
        value: null,
      });
    } else if (item === 4) {
      this.defaultRequestSMSHeaders.push({
        key: null,
        value: null,
      });
    }
  }
  removerow(lenght: any, index: any, item: any): void {
    if (lenght === 1) {
      return;
    } else {
      if (item === 1) {
        this.defaultRequestCallBackAuthorizationHeaders.splice(index, 1);
      } else if (item === 2) {
        this.defaultRequestCallbackHeaders.splice(index, 1);
      } else if (item === 3) {
        this.defaultRequestSMSAuthorizationHeaders.splice(index, 1);
      } else if (item === 4) {
        this.defaultRequestSMSHeaders.splice(index, 1);
      }
    }
  }
  initRightOfUser(): void {
    // this.btnSave.grandAccess = this.aclService.canAbility('UNIT-CREATE');
    // this.btnEdit.grandAccess = this.aclService.canAbility('UNIT-EDIT');
    // this.btnSaveAndCreate.grandAccess = this.aclService.canAbility('UNIT-CREATE');
  }
  updateFormToEdit(data: any): void {
    this.resetForm();
    this.isInfo = false;
    this.isEdit = true;
    this.isAdd = false;
    // this.tittle = `Cập nhật ${this.moduleName}`;
    this.tittle = `${this.i18n.fanyi('function.organization.organization-config.modal-item.header-edit')}`;

    this.form.get('organizationTitle')?.setValue(data?.organizationTitle);
    this.form.get('consumerKey')?.setValue(data?.consumerKey);
    this.form.get('userStoreIDP')?.setValue(data?.userStoreIDP);
    this.form.get('notifySendType')?.setValue(data?.notifySendType ? '' + data?.notifySendType : '1');
    this.form.get('isCallbackAuthorization')?.setValue(data?.isCallbackAuthorization);
    this.form.get('eFormConfig')?.setValue(data?.eFormConfig);
    this.form.get('logoFileBase64')?.setValue(data?.logoFileBase64);
    this.form.get('callbackAuthorizationUrl')?.setValue(data?.callbackAuthorizationUrl);
    this.form.get('callbackUrl')?.setValue(data?.callbackUrl);
    this.form.get('smsSendType')?.setValue(data?.smsSendType ? '' + data?.smsSendType : '1');
    this.form.get('smsotpTemplate')?.setValue(data?.smsotpTemplate);
    this.form.get('adssProfileSignConfirm')?.setValue(data?.adssProfileSignConfirm);
    this.form.get('maxDocumentType')?.setValue(data?.maxDocumentType);
    this.form.get('templatePerDocumentType')?.setValue(data?.templatePerDocumentType);
    this.form.get('isApproveLTV')?.setValue(data?.isApproveLTV);
    this.form.get('isApproveTSA')?.setValue(data?.isApproveTSA);
    this.form.get('isApproveCertify')?.setValue(data?.isApproveCertify);
    this.form.get('isUseUI')?.setValue(data?.isUseUI);
    this.form.get('isApproveSignDynamicPosition')?.setValue(data?.isApproveSignDynamicPosition);
    this.form.get('useImagePreview')?.setValue(data?.useImagePreview);
    this.form.get('smsAuthorizationUrl')?.setValue(data?.smsAuthorizationUrl);
    this.form.get('smsUrl')?.setValue(data?.smsUrl);
    this.form.get('isSMSAuthorization')?.setValue(data?.isSMSAuthorization);
    this.form.get('isUseEverify')?.setValue(data?.isUseEverify);
    this.defaultRequestCallBackAuthorizationHeaders =
      data?.defaultRequestCallBackAuthorizationHeaders ?? this.defaultRequestCallBackAuthorizationHeaders;
    this.defaultRequestCallbackHeaders = data?.defaultRequestCallbackHeaders ?? this.defaultRequestCallbackHeaders;
    this.defaultRequestSMSAuthorizationHeaders = data?.defaultRequestSMSAuthorizationHeaders ?? this.defaultRequestSMSAuthorizationHeaders;
    this.defaultRequestSMSHeaders = data?.defaultRequestSMSHeaders ?? this.defaultRequestSMSHeaders;
    this.emailConfig = data?.emailConfig ?? this.emailConfig;
    this.smsConfig = data?.smsConfig ?? this.smsConfig;
    this.logoUrl = data?.logoFileBase64;

    if (data.signInfoDefault) {
      this.updateListSignInfoByCode(data.signInfoDefault);
    } else {
      this.listSignInfo.forEach((x) => (x.value = false));
    }
  }

  updateListSignInfoByCode(listSignInfo: any) {
    this.listSignInfo.forEach((x) => {
      if (x.code === 'signedBy') {
        x.value = listSignInfo.isSignBy;
      }
      if (x.code === 'organization') {
        x.value = listSignInfo.isOrganization;
      }
      if (x.code === 'position') {
        x.value = listSignInfo.isPosition;
      }
      if (x.code === 'email') {
        x.value = listSignInfo.isEmail;
      }
      if (x.code === 'phoneNumber') {
        x.value = listSignInfo.isPhoneNumber;
      }
      if (x.code === 'timestamp') {
        x.value = listSignInfo.isTimestemp;
      }
      if (x.code === 'reasonSign') {
        x.value = listSignInfo.isReason;
      }
      if (x.code === 'SignedAt') {
        x.value = listSignInfo.isLocation;
      }
      if (x.code === 'contact') {
        x.value = listSignInfo.isContact;
      }
    });

    this.form.get('moreInfo')?.setValue(listSignInfo.moreInfo);
    this.backgroundImageUrl = listSignInfo.backgroundImageBase64;

    if (this.backgroundImageUrl) this.isVisibleDeleteBackgroundImg = true;
    else this.isVisibleDeleteBackgroundImg = false;
  }

  updateFormType(type: string, data: any = {}): void {
    this.updateFormToEdit(data);
  }
  async getOrgConfigById(id: string): Promise<any> {
    const res = await this.orgConfigService.getById(id).toPromise();
    if (res.code !== 200) {
      this.messageService.error(`Có lỗi xảy ra ${res.message}`);
      return;
    }
    this.item = res.data;

    this.updateFormType(this.type, this.item);
    return res.data;
  }
  public initData(data: any, type: any = null, organizationCode: any, option: any = {}): void {
    this.isLoading = false;
    this.isReloadGrid = false;
    this.type = type;
    this.organizationCode = organizationCode;
    this.initUserAdminOrgModel = [];
    this.option = option;
    if (data.id) {
      this.orgId = data.id;
      this.getOrgConfigById(this.orgId);
    }
  }
  private getBase64(img: File, callback: (img: string) => void): void {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result!.toString()));
    reader.readAsDataURL(img);
  }

  handleChange(info: { file: NzUploadFile }): void {
    switch (info.file.status) {
      case 'uploading':
        this.loading = true;
        break;
      case 'done':
        this.loading = false;
        this.getBase64(info.file!.originFileObj!, (img: string) => {
          this.loading = false;
          this.form.controls.logoFileBase64.setValue(img);
          this.logoUrl = img;
        });
        break;
      case 'error':
        this.messageService.error('Network error');
        this.loading = false;
        break;
    }
  }

  closeSaveUserConfig(): void {
    this.isVisibleModel = false;
    this.eventEmmit.emit({ type: 'success' });
  }

  showUserConfig(): void {
    this.isVisibleModel = true;
  }

  handleSaveUserConfig(): void {
    this.userName = this.formAdmin.value.userName;
    this.organizationCode = this.organizationCode;

    for (const i in this.formAdmin.controls) {
      this.formAdmin.controls[i].markAsDirty();
      this.formAdmin.controls[i].updateValueAndValidity();
    }

    if (this.userName === null || this.userName === undefined || this.userName === '') {
      this.isOkLoading = false;
      this.messageService.error(`Kiểm tra lại các trường thông tin đã nhập!`);
      return;
    }

    this.userApiService.userConfig({ userName: this.userName, organizationCode: this.organizationCode }).subscribe(
      (res: any) => {
        this.isOkLoading = false;
        if (res.code !== 200) {
          this.messageService.error(`${res.message}`);
          return;
        }
        this.messageService.success(`${res.message}`);
        this.closeSaveUserConfig();
      },
      (err: any) => {
        this.isOkLoading = false;
        if (err.error) {
          this.messageService.error(`${err.error.message}`);
        } else {
          this.messageService.error(`${err.status}`);
        }
      },
    );
  }

  cancel(): void {
    this.isVisibleModel = false;
  }

  resetForm(): void {
    this.form.reset();
    this.logoUrl = '';
  }

  closeModalReloadData(): void {
    this.isVisible = false;
    this.eventEmmit.emit({ type: 'success' });
  }
  getListAccountEmaill(): void {
    this.emailAccountService.getListCombobox().subscribe(
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
        this.listEmailAccount = res.data;
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
  save(isCreateAfter: boolean = false): Subscription | undefined {
    // cleanForm(this.form);
    // tslint:disable-next-line:forin
    for (const i in this.form.controls) {
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity();
    }
    if (!this.form.valid) {
      this.isLoading = false;
      this.messageService.error(`${this.i18n.fanyi('function.organization.organization-config.modal-item.error.message.form-invalid')}`);
      return;
    }
    this.form.controls.smsSendType.setValue(+this.form.value.smsSendType);
    this.form.controls.notifySendType.setValue(+this.form.value.notifySendType);

    if (this.emailConfig) {
      Object.keys(this.emailConfig).forEach(
        (x) => (this.emailConfig[x] === null || this.emailConfig[x] === 'undefined') && delete this.emailConfig[x],
      );
    }

    if (this.smsConfig) {
      Object.keys(this.smsConfig).forEach(
        (x) => (this.smsConfig[x] === null || this.smsConfig[x] === 'undefined') && delete this.smsConfig[x],
      );
    }

    const data = {
      organizationId: this.orgId,
      ...this.form.value,
    };

    let signInfo = {
      isSignBy: this.listSignInfo.find((x) => x.code === 'signedBy').value,
      isOrganization: this.listSignInfo.find((x) => x.code === 'organization').value,
      isPosition: this.listSignInfo.find((x) => x.code === 'position').value,
      isEmail: this.listSignInfo.find((x) => x.code === 'email').value,
      isPhoneNumber: this.listSignInfo.find((x) => x.code === 'phoneNumber').value,
      isTimestemp: this.listSignInfo.find((x) => x.code === 'timestamp').value,
      isReason: this.listSignInfo.find((x) => x.code === 'reasonSign').value,
      isLocation: this.listSignInfo.find((x) => x.code === 'SignedAt').value,
      isContact: this.listSignInfo.find((x) => x.code === 'contact').value,
      moreInfo: this.form.controls.moreInfo.value,
      backgroundImageBase64: this.backgroundImageUrl,
    };

    data.signInfoDefault = signInfo;

    console.log('data: ', data);
    this.isLoading = true;
    const promise = this.orgConfigService.createOrUpdate(data).subscribe(
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
  }
  onIndexChange(event: number): void {
    // tslint:disable-next-line:forin
    for (const i in this.form.controls) {
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity();
    }
    if (!this.form.valid) {
      this.isLoading = false;
      this.messageService.error(`${this.i18n.fanyi('function.organization.organization-config.modal-item.error.message.form-invalid')}`);
      return;
    }
    this.current = event;
  }
  pre(): void {
    this.current -= 1;
    this.changeContent();
  }

  next(): void {
    this.current += 1;
    this.changeContent();
  }

  done(): void {
    console.log('done');
  }

  changeContent(): void {
    switch (this.current) {
      case 0: {
        this.current = 0;
        break;
      }
      case 1: {
        this.current = 1;
        break;
      }
      case 2: {
        this.current = 2;
        break;
      }
      default: {
        this.current = 3;
      }
    }
  }
  log(value: object[]): void {
    console.log(value);
  }

  signInfoChange($event: any, code: string) {
    if (code === 'backgroundImage' && !$event) {
      this.backgroundImageUrl = '';
    }
  }

  handleFileChange(info: { file: NzUploadFile }, type: any): void {
    if (info.file.status === 'error' || info.file.status === 'done') {
      const originFileObj = info.file?.originFileObj as Blob;
      const reader = new FileReader();
      reader.readAsDataURL(originFileObj);
      reader.onload = () => {
        const imgBase64 = reader.result as string;
        const image = new Image();
        image.src = imgBase64;

        this.getBase64(info.file!.originFileObj!, (img: string) => {
          this.backgroundImageUrl = img;
        });
        this.isVisibleDeleteBackgroundImg = true;
      };
    }
  }

  deleteBackgroundImage($event: any) {
    this.backgroundImageUrl = "";
    this.isVisibleDeleteBackgroundImg = false;
  }
}
