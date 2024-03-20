import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ACLService } from '@delon/acl';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { ArrayService } from '@delon/util';
import { environment } from '@env/environment';
import { ButtonModel } from '@model';
import { CountryApiService, OrganizationApiService, ProvinceApiService } from '@service';
import { DeleteModalComponent } from '@shared';
import { cleanForm, LIST_STATUS, nodeUploadRouter, REGEX_PHONE } from '@util';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzFormatEmitEvent, NzTreeNode } from 'ng-zorro-antd/tree';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Subscription } from 'rxjs';
import { DistrictApiService } from 'src/app/services/api/district-api.service';
import { OrganizationTypeApiService } from 'src/app/services/api/organization-type-api.service';
import { OrganizationConfigComponent } from './organization-config/organization-config.component';
import { OrganizationReportComponent } from './organization-report/organization-report.component';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.less'],
})
export class OrganizationComponent implements OnInit {
  private menuEvent!: NzFormatEmitEvent;

  isDistrictChange = false;
  isRenderComplete = false;
  isLoading = false;
  isAdd = true;
  isEdit = false;
  isInfo = false;
  dateFormat = 'dd/MM/yyyy';
  btnSave: ButtonModel;
  btnAdd: ButtonModel;
  btnEdit: ButtonModel;
  btnDelete: ButtonModel;
  btnResetSearch: ButtonModel;
  btnSearch: ButtonModel;
  btnReload: ButtonModel;
  btnCreateCert: ButtonModel;

  isLoadingDelete = false;
  isShowDelete = false;
  isShowImport = false;
  isShowOrgConfig = false;
  isShowOrgReport = false;
  item: any;
  data: NzTreeNode[] = [];
  delDisabled = false;
  searchValue = '';

  listOfOrgs: any[] = [];
  listOfCountries: any[] = [];
  listOfProvinces: any[] = [];
  listOfDistricts: any[] = [];
  listOfDistrictsTemp: any[] = [];
  listOfOrgTypes: any[] = [];
  organizationCode: any;

  tittle = `${this.i18n.fanyi('function.organization.title')}`;

  form: FormGroup;

  modal: any = {
    type: '',
    item: {},
    isShow: false,
    option: {},
  };

  headerUploadFile = {};
  uploadUrlDKKD = environment.API_URL + nodeUploadRouter.uploadFileBinary;
  fileListDKKD: NzUploadFile[] = [];
  uploadFileDKKDDisabled = false;
  uploadFileDKKD: any = {
    id: undefined,
    uid: null,
    name: null,
    status: 'done',
    url: null,
    filename: null,
  };

  uploadUrlIdentityBefore = environment.API_URL + nodeUploadRouter.uploadFileBinary;
  fileListIdentityBefore: NzUploadFile[] = [];
  uploadFileIdentityBeforeDisabled = false;
  uploadFileIdentityBefore: any = {
    id: undefined,
    uid: null,
    name: null,
    status: 'done',
    url: null,
    filename: null,
  };

  uploadUrlIdentityAfter = environment.API_URL + nodeUploadRouter.uploadFileBinary;
  fileListIdentityAfter: NzUploadFile[] = [];
  uploadFileIdentityAfterDisabled = false;
  uploadFileIdentityAfter: any = {
    id: undefined,
    uid: null,
    name: null,
    status: 'done',
    url: null,
    filename: null,
  };

  reportGrantAccess = false;
  configConnectGrantAccess = false;
  filterStatus: boolean | null = null;
  listStatus = LIST_STATUS;
  dataActive: NzTreeNode[] = [];

  constructor(
    private organizationTypeApiService: OrganizationTypeApiService,
    private organizationApiService: OrganizationApiService,
    private countryApiService: CountryApiService,
    private provinceApiService: ProvinceApiService,
    private districtApiService: DistrictApiService,
    private aclService: ACLService,
    private notification: NzNotificationService,
    private elementRef: ElementRef,
    private arrayService: ArrayService,
    private ccSrv: NzContextMenuService,
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private route: Router,
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

    //#region Init button
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

    this.btnAdd = {
      title: 'Thêm mới',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-add.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.onAddItem();
      },
    };

    this.btnDelete = {
      title: 'Xóa',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-delete.label')}`,
      visible: false,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.onDeleteItem();
      },
    };
    this.btnSearch = {
      title: 'Tìm kiếm',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.initTreeData();
      },
    };
    this.btnResetSearch = {
      title: 'Đặt lại',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.initTreeData();
      },
    };
    this.btnReload = {
      title: 'Tải lại',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-reload.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.resetForm();
        this.initTreeData();
      },
    };

    this.btnEdit = {
      title: 'Cập nhật',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-edit.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.onEditItem(this.item);
      },
    };

    this.btnCreateCert = {
      title: 'Tạo chứng thư số',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.onCreateCert();
      },
    };

    //#endregion Init button

    this.form = this.fb.group({
      // thông tin đơn vị
      parentId: [null],
      code: [{ value: null, disabled: false }, [Validators.required]],
      name: [{ value: null, disabled: false }, [Validators.required]],
      taxCode: [{ value: null, disabled: false }],
      address: [{ value: null, disabled: false }],
      countryId: [{ value: null, disabled: false }],
      provinceId: [{ value: null, disabled: false }],
      districtId: [{ value: null, disabled: false }],
      email: [{ value: null, disabled: false }, [Validators.email]],
      phoneNumber: [{ value: null, disabled: false }, [Validators.pattern(REGEX_PHONE)]],
      issuerDate: [{ value: null, disabled: false }],
      issuerBy: [{ value: null, disabled: false }],
      identifyNumber: [{ value: null, disabled: false }],
      shortName: [{ value: null, disabled: false }],
      organizationTypeId: [{ value: null, disabled: false }],
      status: [true],
      // thông tin người đại diện
      fullName: [{ value: null, disabled: false }],
      representationPositionLine1: [{ value: null, disabled: false }],
      representationPositionLine2: [{ value: null, disabled: false }],
      userIdentity: [{ value: null, disabled: false }],
      gender: [{ value: null, disabled: false }],
      userIssuerDate: [{ value: null, disabled: false }],
      userBirthdate: [{ value: null, disabled: false }],
      userIssuerBy: [{ value: null, disabled: false }],
      userAddress: [{ value: null, disabled: false }],
      userAddressCurrent: [{ value: null, disabled: false }],
      userCountryId: [{ value: null, disabled: false }],
      userProvinceId: [{ value: null, disabled: false }],
      userEmail: [{ value: null, disabled: false }, [Validators.email]],
      userPhoneNumber: [{ value: null, disabled: false }, [Validators.pattern(REGEX_PHONE)]],
    });
  }
  @ViewChild(OrganizationConfigComponent, { static: false }) orgConfigModal!: {
    initData: (arg0: {}, arg1: string, organizationCode: any) => void;
  };
  @ViewChild(OrganizationReportComponent, { static: false }) orgReportModal!: { initData: (arg0: {}) => void };
  @ViewChild(DeleteModalComponent, { static: false })
  deleteModal!: {
    initData: (arg0: any, arg1: string) => void;
    updateIsLoading: (arg0: boolean) => void;
    updateData: (arg0: undefined) => void;
  };

  ngOnInit(): void {
    this.initRightOfUser();
    this.initListOrgs();
    this.initListCountries();
    this.initListProvinces();
    this.initListDistricts();
    this.initTreeData();
    this.initTreeDataActive();
    this.initListOrganizationType();
    this.isRenderComplete = true;
  }

  initListOrganizationType(): void {
    this.organizationTypeApiService.getListCombobox().subscribe(
      (res: any) => {
        if (res.code !== 200) {
          this.messageService.error(`${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.messageService.error(`${res.message}`);
          return;
        }
        const dataResult = res.data;
        this.listOfOrgTypes = dataResult;
      },
      (err: any) => {
        if (err.error) {
          this.messageService.error(`${err.error.message}`);
        } else {
          this.messageService.error(`${err.status}`);
        }
      },
    );
  }

  initRightOfUser(): void {
    this.btnAdd.grandAccess = this.aclService.canAbility('ORGANIZATION-ADD');
    this.btnDelete.grandAccess = this.aclService.canAbility('ORGANIZATION-DELETE');
    this.btnEdit.grandAccess = this.aclService.canAbility('ORGANIZATION-EDIT');
    this.btnSave.grandAccess = this.btnAdd.grandAccess || this.btnEdit.grandAccess;
    this.reportGrantAccess = this.aclService.canAbility('ORGANIZATION-REPORT');
    this.configConnectGrantAccess = this.aclService.canAbility('ORGANIZATION-CONFIG-CONNECT');
  }

  initListOrgs(): Subscription | undefined {
    const promise = this.organizationApiService.getListCombobox().subscribe(
      (res: any) => {
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
        if (err.error) {
          this.messageService.error(`${err.error.message}`);
        } else {
          this.messageService.error(`${err.status}`);
        }
      },
    );
    return promise;
  }
  initListCountries(): Subscription | undefined {
    const promise = this.countryApiService.getListCombobox().subscribe(
      (res: any) => {
        if (res.code !== 200) {
          this.messageService.error(`${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.messageService.error(`${res.message}`);
          return;
        }
        const dataResult = res.data;
        this.listOfCountries = dataResult;
      },
      (err: any) => {
        if (err.error) {
          this.messageService.error(`${err.error.message}`);
        } else {
          this.messageService.error(`${err.status}`);
        }
      },
    );
    return promise;
  }
  initListProvinces(): Subscription | undefined {
    const promise = this.provinceApiService.getListCombobox().subscribe(
      (res: any) => {
        if (res.code !== 200) {
          this.messageService.error(`${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.messageService.error(`${res.message}`);
          return;
        }
        const dataResult = res.data;
        this.listOfProvinces = dataResult;
      },
      (err: any) => {
        if (err.error) {
          this.messageService.error(`${err.error.message}`);
        } else {
          this.messageService.error(`${err.status}`);
        }
      },
    );
    return promise;
  }

  initListDistricts(): Subscription | undefined {
    const promise = this.districtApiService.getListCombobox().subscribe(
      (res: any) => {
        if (res.code !== 200) {
          this.messageService.error(`${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.messageService.error(`${res.message}`);
          return;
        }
        const dataResult = res.data;
        this.listOfDistricts = dataResult;
        this.listOfDistrictsTemp = dataResult;
      },
      (err: any) => {
        if (err.error) {
          this.messageService.error(`${err.error.message}`);
        } else {
          this.messageService.error(`${err.status}`);
        }
      },
    );
    return promise;
  }
  //#region Search

  //#endregion Search

  //#region Event

  onAddItem(): void {
    this.isAdd = true;
    this.isEdit = false;
    this.isInfo = false;
    this.form.enable();
    // this.form.controls.fullName.disable();
    this.resetForm();
    this.item = null;
    this.uploadFileDKKDDisabled = false;
    this.uploadFileIdentityAfterDisabled = false;
    this.uploadFileIdentityBeforeDisabled = false;
  }

  onAddItemFromParent(item: any): void {
    this.isAdd = true;
    this.isEdit = false;
    this.isInfo = false;
    this.form.enable();
    // this.form.controls.fullName.disable();
    this.resetForm();
    this.form.controls.parentId.setValue(item.id);
    this.item = null;
    this.uploadFileDKKDDisabled = false;
    this.uploadFileIdentityAfterDisabled = false;
    this.uploadFileIdentityBeforeDisabled = false;
  }

  onEditItem(item: any = null): void {
    this.isAdd = false;
    this.isEdit = true;
    this.isInfo = false;
    this.item = item;
    this.form.enable();
    this.form.controls.taxCode.disable();
    this.form.controls.code.disable();
    // this.form.controls.fullName.disable();
    this.uploadFileDKKDDisabled = false;
    this.uploadFileIdentityAfterDisabled = false;
    this.uploadFileIdentityBeforeDisabled = false;
    this.getItemById(item);
  }

  onViewItem(item: any = null): void {
    this.isAdd = false;
    this.isEdit = false;
    this.isInfo = true;
    this.item = item;
    this.form.disable();
    this.uploadFileDKKDDisabled = true;
    this.uploadFileIdentityAfterDisabled = true;
    this.uploadFileIdentityBeforeDisabled = true;
    this.getItemById(item);
  }

  changeStatus(event: any) {
    this.filterStatus = event;
    this.initTreeData();
    this.resetForm();
  }

  onCreateCert(): void {
    this.closeContextMenu();
    this.route.navigateByUrl('/cert/' + this.item.id + '/3');
  }

  onDeleteItem(item: any = null): void {
    // console.log(item);
  }

  onChangeTaxCode(event: any): void {
    this.form.controls.taxCode.setValue(event);
  }

  // onChangeProvice(provinceId: string): Subscription | undefined {
  //   if (this.isDistrictChange) {
  //     this.isDistrictChange = false;
  //     return;
  //   }

  //   const promise = this.districtApiService.getListCombobox(provinceId).subscribe(
  //     (res: any) => {
  //       if (res.code !== 200) {
  //         this.messageService.error(`${res.message}`);
  //         return;
  //       }
  //       if (res.data === null || res.data === undefined) {
  //         this.messageService.error(`${res.message}`);
  //         return;
  //       }
  //       const dataResult = res.data;
  //       this.listOfDistricts = dataResult;
  //       this.form.controls.districtId.reset();
  //     },
  //     (err: any) => {
  //       if (err.error) {
  //         this.messageService.error(`${err.error.message}`);
  //       } else {
  //         this.messageService.error(`${err.status}`);
  //       }
  //     },
  //   );

  //   return promise;
  // }

  // onChangeDistrict(districtId: string): Subscription | undefined {
  //   this.isDistrictChange = true;
  //   const promise = this.provinceApiService.getListCombobox(districtId).subscribe(
  //     (res: any) => {
  //       if (res.code !== 200) {
  //         this.messageService.error(`${res.message}`);
  //         return;
  //       }
  //       if (res.data === null || res.data === undefined) {
  //         this.messageService.error(`${res.message}`);
  //         return;
  //       }

  //       const provinceId = res.data[0]?.id;
  //       this.form.controls.provinceId.setValue(provinceId);
  //     },
  //     (err: any) => {
  //       if (err.error) {
  //         this.messageService.error(`${err.error.message}`);
  //       } else {
  //         this.messageService.error(`${err.status}`);
  //       }
  //     },
  //   );

  //   return promise;
  // }

  nzEvent(event: NzFormatEmitEvent): void {
    // console.log(event);
  }

  resetForm(): void {
    this.form.reset();
    this.form.get('status')?.setValue(true);
  }

  getItemById(item: any): Subscription | undefined {
    if (item === null || item === undefined) {
      return;
    }

    const promise = this.organizationApiService.getById(item.id).subscribe(
      (res: any) => {
        if (res.code !== 200) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        const dataResult = res.data;
        // console.log(dataResult);

        // Fill form
        this.fillForm(dataResult);
        this.loadFile(dataResult);
      },
      (err: any) => {
        if (err.error) {
          this.notification.error(`Có lỗi xảy ra`, `${err.error.message}`);
        } else {
          this.notification.error(`Có lỗi xảy ra`, `${err.status}`);
        }
      },
    );
    return promise;
  }

  fillForm(item: any): void {
    this.form.controls.parentId.setValue(item.parentId);
    this.form.controls.code.setValue(item.code);
    this.form.controls.name.setValue(item.name);
    this.form.controls.shortName.setValue(item.shortName);
    this.form.controls.identifyNumber.setValue(item.identifyNumber);
    this.form.controls.issuerDate.setValue(item.issuerDate);
    this.form.controls.issuerBy.setValue(item.issuerBy);
    this.form.controls.taxCode.setValue(item.taxCode);
    this.form.controls.countryId.setValue(item.countryId);
    this.form.controls.provinceId.setValue(item.provinceId);
    this.form.controls.districtId.setValue(item.districtId);
    this.form.controls.address.setValue(item.address);
    this.form.controls.phoneNumber.setValue(item.phoneNumber);
    this.form.controls.email.setValue(item.email);
    this.form.controls.status.setValue(item.status);
    this.form.controls.organizationTypeId.setValue(item.organizationTypeId);
    this.form.controls.fullName.setValue(item.representationFullName);
    this.form.controls.userIdentity.setValue(item.representationIdentityNumber);
    this.form.controls.representationPositionLine1.setValue(item.representationPositionLine1);
    this.form.controls.representationPositionLine2.setValue(item.representationPositionLine2);
    this.form.controls.gender.setValue(item.representationSex?.toString());
    this.form.controls.userIssuerDate.setValue(item.representationIssueDate);
    this.form.controls.userBirthdate.setValue(item.representationBirthday);
    this.form.controls.userIssuerBy.setValue(item.representationIssueBy);
    this.form.controls.userAddress.setValue(item.representationPermanentAddress);
    this.form.controls.userAddressCurrent.setValue(item.representationCurentAddess);
    this.form.controls.userCountryId.setValue(item.representationCountryId);
    this.form.controls.userProvinceId.setValue(item.representationProvinceId);
    this.form.controls.userEmail.setValue(item.representationEmail);
    this.form.controls.userPhoneNumber.setValue(item.representationPhoneNumber);
    this.organizationCode = item.code;
  }

  loadFile(item: any): void {
    if (item.bussinessLicenseFilePath) {
      this.uploadFileDKKD = {
        id: '1',
        uid: '1',
        name: item.bussinessLicenseObjectName,
        status: 'done',
        url: item.bussinessLicenseFilePath,
        filename: item.bussinessLicenseObjectName,
      };

      this.fileListDKKD = [];
      this.fileListDKKD.push(this.uploadFileDKKD);
    } else {
      this.uploadFileDKKD = {
        id: undefined,
        uid: null,
        name: null,
        status: 'done',
        url: null,
        filename: null,
      };
      this.fileListDKKD = [];
    }

    if (item.identityFrontFilePath) {
      this.uploadFileIdentityBefore = {
        id: '1',
        uid: '1',
        name: item.identityFrontObjectName,
        status: 'done',
        url: item.identityFrontFilePath,
        filename: item.identityFrontObjectName,
      };

      this.fileListIdentityBefore = [];
      this.fileListIdentityBefore.push(this.uploadFileIdentityBefore);
    } else {
      this.uploadFileIdentityBefore = {
        id: undefined,
        uid: null,
        name: null,
        status: 'done',
        url: null,
        filename: null,
      };
      this.fileListIdentityBefore = [];
    }

    if (item.identityBackFilePath) {
      this.uploadFileIdentityAfter = {
        id: '1',
        uid: '1',
        name: item.identityBackObjectName,
        status: 'done',
        url: item.identityBackObjectName,
        filename: item.identityBackFilePath,
      };

      this.fileListIdentityAfter = [];
      this.fileListIdentityAfter.push(this.uploadFileIdentityAfter);
    } else {
      this.uploadFileIdentityAfter = {
        id: undefined,
        uid: null,
        name: null,
        status: 'done',
        url: null,
        filename: null,
      };
      this.fileListIdentityAfter = [];
    }
  }

  //#endregion Event

  //#region Modal
  onOpenOrgConfig(item: any = null): void {
    this.isShowOrgConfig = true;
    this.orgConfigModal.initData(item, 'edit', this.organizationCode);
  }

  onOpenOrgReport(item: any = null): void {
    this.isShowOrgReport = true;
    this.orgReportModal.initData(item);
  }

  onModalEventEmmit(event: any): void {
    this.modal.isShow = false;
    if (event.type === 'success') {
      this.initTreeData();
    }
  }
  onOrgConfigModalEventEmmit(event: any): void {
    this.isShowOrgConfig = false;
    if (event.type === 'success') {
      this.initTreeData();
    }
  }
  onOrgReportModalEventEmmit(event: any): void {
    this.isShowOrgReport = false;
  }
  onDeleteEventEmmit(event: any): void {
    if (event.type === 'success') {
      this.initTreeData();
    } else if (event.type === 'confirm') {
      this.deleteModal.updateIsLoading(true);
      this.deleteListItem(event.listId);
    }
  }

  onImportEventEmmit(event: any): void {
    if (event.type === 'success') {
      this.initTreeData();
    }
  }

  //#endregion Modal

  //#region API Event
  deleteListItem(listId: [string]): Subscription {
    this.isLoadingDelete = true;
    const promise = this.organizationApiService.delete(listId).subscribe(
      (res: any) => {
        this.isLoadingDelete = false;
        if (res.code !== 200) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        const dataResult = res.data;
        this.deleteModal.updateData(dataResult);
      },
      (err: any) => {
        this.isLoadingDelete = false;
        this.deleteModal.updateData(undefined);
        if (err.error) {
          this.notification.error(`Có lỗi xảy ra`, `${err.error.message}`);
        } else {
          this.notification.error(`Có lỗi xảy ra`, `${err.status}`);
        }
      },
    );
    return promise;
  }

  initTreeData(): Subscription {
    this.btnDelete.visible = false;
    const rs = this.organizationApiService.getListComboboxAll(this.filterStatus).subscribe(
      (res: any) => {
        if (res.code !== 200) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }

        const dataResult = res.data;
        // console.log(dataResult);

        const arrayTreeResult = dataResult.map((item: any, i: number, arr: any[]) => {
          const checkIsLeft = arr.some((c) => c.parentId === item.id);

          return {
            id: item.id,
            parent_id: item.parentId,
            title: item.name,
            isLeaf: !checkIsLeft,
            expanded: false,
            selected: false,
          };
        });

        this.arrayService.arrToTreeNode(arrayTreeResult, {
          cb: (item, parent, deep) => {
            if (deep > 1) {
              const indexOf = arrayTreeResult.indexOf(item);
              arrayTreeResult.splice(indexOf, 1);
            }
          },
        });

        this.data = arrayTreeResult;
      },
      (err: any) => {
        // console.log(err);
      },
    );
    return rs;
  }

  initTreeDataActive(): Subscription {
    this.btnDelete.visible = false;
    const rs = this.organizationApiService.getListCombobox().subscribe(
      (res: any) => {
        if (res.code !== 200) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }

        const dataResult = res.data;
        // console.log(dataResult);

        const arrayTreeResult = dataResult.map((item: any, i: number, arr: any[]) => {
          const checkIsLeft = arr.some((c) => c.parentId === item.id);

          return {
            id: item.id,
            parent_id: item.parentId,
            title: item.name,
            isLeaf: !checkIsLeft,
            expanded: false,
            selected: false,
          };
        });

        this.arrayService.arrToTreeNode(arrayTreeResult, {
          cb: (item, parent, deep) => {
            if (deep > 1) {
              const indexOf = arrayTreeResult.indexOf(item);
              arrayTreeResult.splice(indexOf, 1);
            }
          },
        });

        this.dataActive = arrayTreeResult;
      },
      (err: any) => {
        // console.log(err);
      },
    );
    return rs;
  }
  //#endregion API Event

  // //#region NzTree
  // move = (e: NzFormatBeforeDropEvent) => {
  //   if (e.pos !== 0) {
  //     return of(false);
  //   }
  //   if (e.dragNode.origin.parent_id === e.node.origin.id) {
  //     return of(false);
  //   }
  //   const from = e.dragNode.origin.id;
  //   const to = e.node.origin.id;
  //   // tslint:disable-next-line: semicolon
  //   return;
  // };

  show(e: NzFormatEmitEvent): void {
    this.menuEvent = e;
    this.item = e.node!.origin;
    this.onViewItem(this.item);
  }

  get delMsg(): string {
    if (!this.menuEvent) {
      return '';
    }
    const childrenLen = this.menuEvent.node!.children.length;
    if (childrenLen === 0) {
      return `Bạn có chắc chắn xóa đơn vị ${this.menuEvent.node!.title} ?`;
    }
    return `Bạn có chắc chắn xóa đơn vị ${this.menuEvent.node!.title}】và các đơn vị con ？`;
  }

  del(item: any): Subscription | undefined {
    this.closeContextMenu();
    const listId = [];
    listId.push(item.id);

    const promise = this.organizationApiService.delete(listId).subscribe(
      (res: any) => {
        this.isLoadingDelete = false;
        if (res.code !== 200) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        const dataResult = res.data[0];
        if (dataResult.result) {
          this.notification.success(`Xóa thành công đơn vị `, `${item.title}`);
          this.initTreeData();
        } else {
          this.notification.error(`Có lỗi xảy ra`, dataResult.message);
        }
      },
      (err: any) => {
        this.isLoadingDelete = false;
        this.deleteModal.updateData(undefined);
        if (err.error) {
          this.notification.error(`Có lỗi xảy ra`, `${err.error.message}`);
        } else {
          this.notification.error(`Có lỗi xảy ra`, `${err.status}`);
        }
      },
    );
    return promise;
  }

  showContextMenu(e: NzFormatEmitEvent, menu: NzDropdownMenuComponent): void {
    this.menuEvent = e;
    this.delDisabled = e.node!.children.length !== 0;
    this.item = e.node!.origin;
    this.getItemById(this.item);
    this.ccSrv.create(e.event!, menu);
  }

  closeContextMenu(): void {
    this.ccSrv.close();
  }
  //#endregion

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
      this.isLoading = false;
      return;
    }

    const data = {
      id: this.item?.id,
      parentId: this.form.controls.parentId.value,
      code: this.form.controls.code.value,
      name: this.form.controls.name.value,
      shortName: this.form.controls.shortName.value,
      identifyNumber: this.form.controls.identifyNumber.value,
      issuerDate: this.form.controls.issuerDate.value,
      issuerBy: this.form.controls.issuerBy.value,
      taxCode: this.form.controls.taxCode.value,
      countryId: this.form.controls.countryId.value,
      countryName: this.listOfCountries.find((x: any) => x.id === this.form.controls.countryId.value)?.name,
      provinceId: this.form.controls.provinceId.value,
      provinceName: this.listOfProvinces.find((x: any) => x.id === this.form.controls.provinceId.value)?.name,
      zipCode: this.listOfProvinces.find((x: any) => x.id === this.form.controls.provinceId.value)?.zipCode,
      districtId: this.form.controls.districtId.value,
      districtName: this.listOfDistricts.find((x: any) => x.id === this.form.controls.districtId.value)?.name,
      address: this.form.controls.address.value,
      phoneNumber: this.form.controls.phoneNumber.value,
      email: this.form.controls.email.value,
      status: this.form.controls.status.value,
      order: 0,
      description: null,
      organizationTypeId: this.form.controls.organizationTypeId.value,
      bussinessLicenseObjectName: this.uploadFileDKKD.fileObjectName,
      bussinessLicenseBucketName: this.uploadFileDKKD.fileBucketName,
      representationFullName: this.form.controls.fullName.value,
      identityFrontObjectName: this.uploadFileIdentityBefore.fileObjectName,
      identityFrontBucketName: this.uploadFileIdentityBefore.fileBucketName,
      identityBackObjectName: this.uploadFileIdentityAfter.fileObjectName,
      identityBackBucketName: this.uploadFileIdentityAfter.fileBucketName,
      representationIdentityNumber: this.form.controls.userIdentity.value,
      representationPositionLine1: this.form.controls.representationPositionLine1.value,
      representationPositionLine2: this.form.controls.representationPositionLine2.value,
      representationSex: parseInt(this.form.controls.gender.value),
      representationIssueDate: this.form.controls.userIssuerDate.value,
      representationBirthday: this.form.controls.userBirthdate.value,
      representationIssueBy: this.form.controls.userIssuerBy.value,
      representationPermanentAddress: this.form.controls.userAddress.value,
      representationCurentAddess: this.form.controls.userAddressCurrent.value,
      representationCountryId: this.form.controls.userCountryId.value,
      representationCountryCode: this.listOfCountries.find((x: any) => x.id === this.form.controls.userCountryId.value)?.code,
      representationCountryName: this.listOfCountries.find((x: any) => x.id === this.form.controls.userCountryId.value)?.name,
      representationProvinceId: this.form.controls.userProvinceId.value,
      representationProvinceCode: this.listOfProvinces.find((x: any) => x.id === this.form.controls.userProvinceId.value)?.zipCode,
      representationProvinceName: this.listOfProvinces.find((x: any) => x.id === this.form.controls.userProvinceId.value)?.name,
      representationEmail: this.form.controls.userEmail.value,
      representationPhoneNumber: this.form.controls.userPhoneNumber.value,
    };

    if (this.isAdd) {
      const promise = this.organizationApiService.create(data).subscribe(
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
          this.resetForm();
          this.initTreeData();
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

    if (this.isEdit) {
      const promise = this.organizationApiService.update(data).subscribe(
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
          this.resetForm();
          this.initTreeData();
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
    return;
  }

  handleFileChangeDKKD(data: any): void {
    if (data.type === 'success') {
      this.fileListDKKD = [data.file];
      this.uploadFileDKKD.fileBucketName = data.file?.response?.data?.bucketName;
      this.uploadFileDKKD.fileObjectName = data.file?.response?.data?.objectName;
      this.uploadFileDKKD.fileDataBucketName = data.file?.response?.data?.dataBucketName;
      this.uploadFileDKKD.fileDataObjectName = data.file?.response?.data?.dataObjectName;
      this.uploadFileDKKD.fileType = data.file?.response?.data?.fileType;
      this.uploadFileDKKD.filename = data.file?.response?.data?.fileName;
      this.uploadFileDKKD.url = data.file?.response?.data?.objectName;
      this.uploadFileDKKD.status = 'done';
      this.uploadFileDKKD.name = data.file?.name;
    } else {
    }
  }

  handleFileChangeIdentityBefore(data: any): void {
    if (data.type === 'success') {
      this.fileListIdentityBefore = [data.file];
      this.uploadFileIdentityBefore.fileBucketName = data.file?.response?.data?.bucketName;
      this.uploadFileIdentityBefore.fileObjectName = data.file?.response?.data?.objectName;
      this.uploadFileIdentityBefore.fileDataBucketName = data.file?.response?.data?.dataBucketName;
      this.uploadFileIdentityBefore.fileDataObjectName = data.file?.response?.data?.dataObjectName;
      this.uploadFileIdentityBefore.fileType = data.file?.response?.data?.fileType;
      this.uploadFileIdentityBefore.filename = data.file?.response?.data?.fileName;
      this.uploadFileIdentityBefore.url = data.file?.response?.data?.objectName;
      this.uploadFileIdentityBefore.status = 'done';
      this.uploadFileIdentityBefore.name = data.file?.name;
    } else {
    }
  }

  handleFileChangeIdentityAfter(data: any): void {
    if (data.type === 'success') {
      this.fileListIdentityAfter = [data.file];
      this.uploadFileIdentityAfter.fileBucketName = data.file?.response?.data?.bucketName;
      this.uploadFileIdentityAfter.fileObjectName = data.file?.response?.data?.objectName;
      this.uploadFileIdentityAfter.fileDataBucketName = data.file?.response?.data?.dataBucketName;
      this.uploadFileIdentityAfter.fileDataObjectName = data.file?.response?.data?.dataObjectName;
      this.uploadFileIdentityAfter.fileType = data.file?.response?.data?.fileType;
      this.uploadFileIdentityAfter.filename = data.file?.response?.data?.fileName;
      this.uploadFileIdentityAfter.url = data.file?.response?.data?.objectName;
      this.uploadFileIdentityAfter.status = 'done';
      this.uploadFileIdentityAfter.name = data.file?.name;
    } else {
    }
  }

  countryOnChange(id: any) { }

  provinceOnChange(id: any) {
    this.listOfDistricts = this.listOfDistrictsTemp;
    this.listOfDistricts = this.listOfDistricts.filter((x: any) => x.provinceId == id);
  }
}
