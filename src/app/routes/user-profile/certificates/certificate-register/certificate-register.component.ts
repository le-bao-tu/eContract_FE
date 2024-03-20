import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { I18NService } from '@core';
import { ACLService } from '@delon/acl';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { environment } from '@env/environment';
import { ButtonModel } from '@model';
import { CertifyTypeApiService, MinIOApiService, UserHSMAccountApiService, UserService } from '@service';
import { SCHEMA_THIRDS_COMPONENTS } from '@shared';
import { cleanForm, Constants, LIST_IDENTITY_NUMBER_TYPE, nodeUploadRouter, ROLE_SYS_ADMIN } from '@util';
import moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-certificate-register',
  templateUrl: './certificate-register.component.html',
  styleUrls: ['./certificate-register.component.less'],
})
export class CertificateRegisterComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private userService: UserService,
    private userHSMAccountRouter: UserHSMAccountApiService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {
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
    this.btnSave = {
      title: 'Lưu',
      titlei18n: `${this.i18n.fanyi('function.user.button.user-register-HSM')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        // this.save();
      },
    };
    this.btnSaveAndCreate = {
      title: 'Lưu & Thêm mới',
      titlei18n: `${this.i18n.fanyi('function.user.button.user-update-HSM')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        // this.save(true);
      },
    };
    LIST_IDENTITY_NUMBER_TYPE.map((item) => {
      const model: { value: string; label: string; displayName: string } = {
        value: item.value,
        label: item.label,
        displayName: item.displayName,
      };
      this.listIdentityNumberType.push(model);
    });
    this.formInfoPerson = this.fb.group({
      organization: ['', [Validators.required]],
      identityType: ['CMT'],
      identityNumber: [],
      issueDate: [''],
      position: [''],
      issueBy: [''],
      countryName: [''],
      address: [''],
      name: ['', [Validators.required]],
      birthday: [''],
      sex: [''],
      phoneNumber: [''],
      email: [''],
      // phoneNumber: ['', [Validators.required, Validators.pattern(REGEX_PHONE)]],
      // email: ['', [Validators.required, Validators.pattern(EMAIL_VALIDATION)]],
      provinceName: [''],
      districtName: [''],
      connectId: [''],
      eFormConfig: [''],
      subjectDN: [''],
    });
  }
  listIdentityNumberType: Array<{ value: string; label: string; displayName: string }> = [];
  identityName = 'chứng minh thư';
  formInfoPerson: FormGroup;
  isInfo = false;
  isEdit = false;
  btnCancel!: ButtonModel;
  btnSave: ButtonModel;
  btnSaveAndCreate: ButtonModel;
  @Input() isVisible = false;
  isReloadGrid = false;
  @Output() eventEmmit = new EventEmitter<any>();
  @Input() type = 'add';
  @Input() item: any;
  dateFormat = 'dd/MM/yyyy';
  @Input() option: any;
  listProvince: any[] = [];
  tittle = '';
  backImage = '';
  faceImage = '';
  frontImage = '';
  data = {};
  isLoading = false;
  frontImageObjectName = '';
  backImageObjectName = '';
  faceImageObjectName = '';
  ngOnInit(): void {}

  public async initData(): Promise<any> {
    this.isVisible = true;
    this.isLoading = false;
    this.isReloadGrid = false;
    this.tittle = `${this.i18n.fanyi('function.user.modal-item.user-register-HSM')}`;
    const rs = this.getUserByAccount();
  }

  getUserByAccount(): any {
    const rs = this.userService.getCurrentUserInfo().subscribe(
      (res: any) => {
        if (res.code !== 200) {
          this.messageService.error(`Có lỗi xảy ra ${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.messageService.error(`Có lỗi xảy ra ${res.message}`);
          return;
        }
        this.item = res.data;
        this.setByAccount(res.data);
        console.log('res.data:', res.data);

        var urlFront = res.data.frontImageCardUrl;
        this.frontImage = urlFront;
        var urlBack = res.data.backImageCardUrl;
        this.backImage = urlBack;

        var urlFace = res.data.faceImageCardUrl;
        this.faceImage = urlFace;
      },
      (err: any) => {
        // console.log(err);
      },
    );
    return rs;
  }

  setByAccount(data: any): any {
    this.formInfoPerson.get('organization')?.setValue(data?.organizationId);
    this.formInfoPerson.get('identityType')?.setValue(data?.identityType);
    this.formInfoPerson.get('identityNumber')?.setValue(data?.identityNumber);
    this.formInfoPerson.get('issueDate')?.setValue(moment(new Date(data?.issueDate)).format('DD/MM/YYYY'));
    this.formInfoPerson.get('issueBy')?.setValue(data?.issueBy);
    this.formInfoPerson.get('countryName')?.setValue(data?.countryName);
    this.formInfoPerson.get('address')?.setValue(data?.address);
    this.formInfoPerson.get('name')?.setValue(data?.name);
    this.formInfoPerson.get('birthday')?.setValue(moment(new Date(data?.birthday)).format('DD/MM/YYYY'));
    this.formInfoPerson.get('sex')?.setValue(data?.sex === 1 ? 'Nam' : data?.sex === 2 ? 'Nu' : 'Không xác định');
    this.formInfoPerson.get('phoneNumber')?.setValue(data?.phoneNumber);
    this.formInfoPerson.get('email')?.setValue(data?.email);
    this.formInfoPerson.get('provinceName')?.setValue(data?.provinceName);
    this.formInfoPerson.get('districtName')?.setValue(data?.districtName);

    this.frontImageObjectName = data?.ekycInfo.frontImageObjectName;
    this.backImageObjectName = data?.ekycInfo.backImageObjectName;
    this.faceImageObjectName = data?.ekycInfo.faceImageObjectName;
    this.formInfoPerson.disable();
  }

  onModalEventEmmitt(event: any) {
    // console.log(event);
  }
  handleCancel(): void {
    this.isVisible = false;
    if (this.isReloadGrid) {
      this.eventEmmit.emit({ type: 'success' });
    } else {
      this.eventEmmit.emit({ type: 'close' });
    }
  }

  resetForm(): void {
    this.formInfoPerson.reset();
  }

  closeModalReloadData(): void {
    this.isVisible = false;
    this.eventEmmit.emit({ type: 'success' });
  }

  changeIdentity(event: any): any {
    this.identityName = this.listIdentityNumberType.find((r) => r.value === event)?.displayName ?? this.identityName;
  }

  changeGttt(event: any): any {
    // this.formInfoAccount.controls.userName.setValue(event);
  }
}
