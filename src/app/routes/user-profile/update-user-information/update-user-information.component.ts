import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { environment } from '@env/environment';
import { ButtonModel } from '@model';
import { I18NService } from '@core';
import { CountryApiService, DistrictApiService, ProvinceApiService, UserService } from '@service';
import { Constants, LIST_EFORMCONFIG, LIST_IDENTITY_NUMBER_TYPE, LIST_SEX, nodeUploadRouter, REGEX_PHONE, usersRouter } from '@util';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'app-update-user-information',
  templateUrl: './update-user-information.component.html',
  styleUrls: ['./update-user-information.component.less'],
})
export class UpdateUserInformationComponent implements OnInit {
  tittle = '';
  @Input() item: any;
  formInfoPerson: FormGroup;
  listCountry: any[] = [];
  listProvince: any[] = [];
  listDistrict: any[] = [];
  dateFomat = 'dd/mm/yyyy';
  listEFormConfig: any[] = LIST_EFORMCONFIG;
  listIdentityNumberType: Array<{ value: string; label: string; displayName: string }> = [];
  listSex = LIST_SEX;
  isLoading = false;
  moduleName = 'người dùng';
  identityName = 'chứng minh thư';
  isInfo = false;
  isEdit = false;
  isAdd = false;
  isReloadGrid = false;
  isCustomer = false;
  // CMT mặt trước
  frontImageBucketName: any;
  frontImageObjectName: any;
  // CMT mặt sau
  backImageBucketName: any;
  backImageObjectName: any;
  // Ảnh chính diện
  faceImageBucketName: any;
  faceImageObjectName: any;
  btnUpdate: ButtonModel;
  btnUpload_Straightface: ButtonModel;
  btnUploadCMT_Front: ButtonModel;
  btnUploadCMT_Backside: ButtonModel;
  fileListFront: any;
  fileListBack: any;
  fileListFace: any;
  listOfCountries: any[] = [];
  listOfProvinces: any[] = [];
  listOfDistricts: any[] = [];
  uploadFile: any = {
    id: undefined,
    uid: null,
    name: null,
    status: 'done',
    url: null,
    filename: null,
  };
  constructor(
    private fb: FormBuilder,
    private provinceService: ProvinceApiService,
    private districtService: DistrictApiService,
    private countryService: CountryApiService,
    private userService: UserService,
    private messageService: NzMessageService,
    private notification: NzNotificationService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {
    this.formInfoPerson = this.fb.group({
      name: ['', [Validators.required]],
      sex: [''],
      birthday: [''],
      email: [
        null,
        [Validators.pattern('^(?=.{1,64}@)[A-Za-z0-9_-]+(\\.[A-Za-z0-9_-]+)*@' + '[^-][A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*(\\.[A-Za-z]{2,})$')],
      ],
      issueDate: [''],
      identityNumber: [],
      identityType: ['CMT'],
      placeoforigin: [''],
      issueBy: [''],
      provinceId: [''],
      countryId: [''],
      address: [''],
      permanentaddress: [''],
      districtId: [''],
      eFormConfig: [''],
      phoneNumber: [''],
    });

    this.btnUpdate = {
      title: 'Cập nhật',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-edit.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.save();
      },
    };

    this.btnUpload_Straightface = {
      title: 'Tải lên',
      titlei18n: `${this.i18n.fanyi('function.organization.organization-config.modal-item.upload.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {},
    };

    this.btnUploadCMT_Front = {
      title: 'Tải lên',
      titlei18n: `${this.i18n.fanyi('function.organization.organization-config.modal-item.upload.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {},
    };

    this.btnUploadCMT_Backside = {
      title: 'Tải lên',
      titlei18n: `${this.i18n.fanyi('function.organization.organization-config.modal-item.upload.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {},
    };

    LIST_IDENTITY_NUMBER_TYPE.map((item) => {
      const model: { value: string; label: string; displayName: string } = {
        value: item.value,
        label: item.label,
        displayName: item.displayName,
      };
      this.listIdentityNumberType.push(model);
    });
  }

  //upload button file
  uploadUrl = environment.API_URL + nodeUploadRouter.uploadObject;

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
        this.getUserInfo(res.data);

        // xử lí hiển thị dữ liệu của CMT mặt trước
        this.fileListFront = [];
        var fileListFront = {
          uid: '1',
          name: res.data.ekycInfo.frontImageObjectName,
          status: 'done',
          response: 'Server Error 500', // custom error message to show
          url: res.data.frontImageCardUrl,
        };
        this.fileListFront.push(fileListFront);
        this.frontImageObjectName = res.data.ekycInfo.frontImageObjectName;
        this.frontImageBucketName = res.data.ekycInfo.frontImageBucketName;

        // xử lí hiển hiển thị dữ liệu của CMT mặt sau
        this.fileListBack = [];
        var fileListBack = {
          uid: '2',
          name: res.data.ekycInfo.backImageObjectName,
          status: 'done',
          response: 'Server Error 500', // custom error message to show
          url: res.data.backImageCardUrl,
        };
        this.fileListBack.push(fileListBack);
        this.backImageObjectName = res.data.ekycInfo.backImageObjectName;
        this.backImageBucketName = res.data.ekycInfo.backImageBucketName;

        // xử lí hiển thị dữ liệu của ảnh chính diện
        this.fileListFace = [];
        var fileListFace = {
          uid: '3',
          name: res.data.ekycInfo.faceImageObjectName,
          status: 'done',
          response: 'Server Error 500', // custom error message to show
          url: res.data.faceImageCardUrl,
        };
        this.fileListFace.push(fileListFace);
        this.faceImageObjectName = res.data.ekycInfo.faceImageObjectName;
        this.faceImageBucketName = res.data.ekycInfo.faceImageBucketName;
      },
      (err: any) => {
        console.log(err);
      },
    );
    return rs;
  }

  getUserInfo(data: any): any {
    this.formInfoPerson.get('identityType')?.setValue(data?.identityType);
    this.formInfoPerson.get('identityNumber')?.setValue(data?.identityNumber);
    this.formInfoPerson.get('issueDate')?.setValue(data?.issueDate);
    this.formInfoPerson.get('issueBy')?.setValue(data?.issueBy);
    this.formInfoPerson.get('countryId')?.setValue(data?.countryId);
    this.formInfoPerson.get('address')?.setValue(data?.address);
    this.formInfoPerson.get('name')?.setValue(data?.name);
    this.formInfoPerson.get('birthday')?.setValue(data?.birthday);
    this.formInfoPerson.get('sex')?.setValue(data?.sex);
    this.formInfoPerson.get('phoneNumber')?.setValue(data?.phoneNumber);
    this.formInfoPerson.get('email')?.setValue(data?.email);
    this.formInfoPerson.get('provinceId')?.setValue(data?.provinceId);
    this.formInfoPerson.get('districtId')?.setValue(data?.districtId);
    this.formInfoPerson.get('eFormConfig')?.setValue(data?.eFormConfig);
    this.formInfoPerson.get('placeoforigin')?.setValue(data?.placeoforigin);
    this.formInfoPerson.get('permanentaddress')?.setValue(data?.permanentaddress);
  }

  changeIdentity(event: any): any {
    this.identityName = this.listIdentityNumberType.find((r) => r.value === event)?.displayName ?? this.identityName;
  }

  changeGttt(event: any): any {
    // this.formInfoAccount.controls.userName.setValue(event);
  }

  ngOnInit(): void {
    if (this.listCountry.length === 0) {
      this.initListCountry();
    }
    if (this.listProvince.length === 0) {
      this.initListProvince();
    }
    if (this.listDistrict.length === 0) {
      this.initListDistrict();
    }
    this.getUserByAccount();
  }

  // lấy ra danh sách Country
  initListCountry(): any {
    const rs = this.countryService.getListCombobox().subscribe(
      (res: any) => {
        if (res.code !== 200) {
          this.messageService.error(`Có lỗi xảy ra ${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.messageService.error(`Có lỗi xảy ra ${res.message}`);
          return;
        }
        this.listCountry = res.data.map((item: any) => {
          return {
            value: item.id,
            label: item.name,
          };
        });
        this.listOfCountries = res.data;
      },
      (err: any) => {
        console.log(err);
      },
    );
  }
  // lấy ra danh sách Tỉnh thành
  initListProvince(): any {
    const rs = this.provinceService.getListCombobox().subscribe(
      (res: any) => {
        if (res.code !== 200) {
          this.messageService.error(`Có lỗi xảy ra ${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.messageService.error(`Có lỗi xảy ra ${res.message}`);
          return;
        }
        this.listProvince = res.data.map((item: any) => {
          return {
            value: item.id,
            label: `${item.name}-${item.zipCode}`,
            name: item.name,
            zipCode: item.zipCode,
          };
        });
        this.listOfProvinces = res.data;
      },
      (err: any) => {
        console.log(err);
      },
    );
  }

  // lấy ra danh sách quận huyện
  initListDistrict(): any {
    const rs = this.districtService.getListCombobox().subscribe(
      (res: any) => {
        if (res.code !== 200) {
          this.messageService.error(`Có lỗi xảy ra ${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.messageService.error(`Có lỗi xảy ra ${res.message}`);
          return;
        }
        this.listDistrict = res.data.map((item: any) => {
          return {
            value: item.id,
            label: item.name,
          };
        });
        this.listOfDistricts = res.data;
      },
      (err: any) => {
        console.log(err);
      },
    );
  }
  // lưu dữ liệu của file fileBucketName và fileObjectName CMT mặt trước
  handleFileChangeFront(info: any): void {
    if (info.type === 'success') {
      this.frontImageBucketName = info.file.response.data.bucketName;
      this.frontImageObjectName = info.file.response.data.objectName;
      this.fileListFront = [info.file];
    }
  }
  // lưu dữ liệu của file fileBucketName và fileObjectName CMT mặt sau
  handleFileChangeBack(info: any): void {
    if (info.type === 'success') {
      this.backImageBucketName = info.file.response.data.bucketName;
      this.backImageObjectName = info.file.response.data.objectName;
      this.fileListBack = [info.file];
    }
  }
  // lưu dữ  liệu của file fileBucketName và fileObjectName ảnh chính diện
  handleFileChangeFace(info: any): void {
    if (info.type === 'success') {
      this.faceImageBucketName = info.file.response.data.bucketName;
      this.faceImageObjectName = info.file.response.data.objectName;
      this.fileListFace = [info.file];
    }
  }
  save(): any {
    this.isLoading = true;
    const data = {
      id: this.item?.id,
      identityType: this.formInfoPerson.controls.identityType?.value,
      identityNumber: this.formInfoPerson.controls.identityNumber?.value,
      issueDate: this.formInfoPerson.controls.issueDate?.value,
      issueBy: this.formInfoPerson.controls.issueBy?.value,
      address: this.formInfoPerson.controls.address?.value,
      permanentAddress: this.formInfoPerson.controls.permanentaddress?.value,
      name: this.formInfoPerson.controls.name?.value,
      birthday: this.formInfoPerson.controls.birthday?.value,
      sex: this.formInfoPerson.controls.sex?.value,
      phoneNumber: this.formInfoPerson.controls.phoneNumber?.value,
      email: this.formInfoPerson.controls.email?.value,
      countryId: this.formInfoPerson.controls.countryId?.value,
      countryName: this.listOfCountries.find((x: any) => x.id === this.formInfoPerson.controls.countryId?.value)?.name,
      provinceId: this.formInfoPerson.controls.provinceId?.value,
      provinceName: this.listOfProvinces.find((x: any) => x.id === this.formInfoPerson.controls.provinceId.value)?.name,
      districtId: this.formInfoPerson.controls.districtId?.value,
      districtName: this.listOfDistricts.find((x: any) => x.id === this.formInfoPerson.controls.districtId.value)?.name,
      eFormConfig: !this.formInfoPerson.controls.eFormConfig?.value
        ? Constants.SIGN_TYPE_DIG
        : this.formInfoPerson.controls.eFormConfig?.value,
      placeoforigin: this.formInfoPerson.controls.placeoforigin?.value,
      frontImageBucketName: this.frontImageBucketName,
      frontImageObjectName: this.frontImageObjectName,
      backImageBucketName: this.backImageBucketName,
      backImageObjectName: this.backImageObjectName,
      faceImageBucketName: this.faceImageBucketName,
      faceImageObjectName: this.faceImageObjectName,
    };

    if (!data.name) {
      this.isLoading = false;
      this.messageService.error(`Tên người dùng không được để trống!`);
      return;
    }

    this.userService.updateUserProfile(data).subscribe((res: any) => {
      this.isLoading = false;
      if (res.code === 200) {
        this.notification.success('Success', 'Cập nhật thông tin thành công');
      } else {
        this.messageService.error(`${res.message}`);
      }
    });
  }
}
