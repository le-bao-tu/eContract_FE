import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ACLService } from '@delon/acl';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ArrayService } from '@delon/util';
import { ButtonModel, GridModel, QueryFilerModel } from '@model';
import { CountryApiService, DistrictApiService, OrganizationApiService, ProvinceApiService, UserService } from '@service';
import { BtnCellRenderComponent, DateCellRenderComponent } from '@shared';
import {
  cleanForm,
  Constants,
  EMAIL_VALIDATION,
  EXCEL_STYLES_DEFAULT,
  LIST_ACCOUNT_TYPE,
  LIST_EFORMCONFIG,
  LIST_IDENTITY_NUMBER_TYPE,
  LIST_SEX,
  OVERLAY_LOADING_TEMPLATE,
  OVERLAY_NOROW_TEMPLATE,
  PAGE_SIZE_OPTION_DEFAULT,
  QUERY_FILTER_DEFAULT,
  REGEX_PHONE,
  ROLE_SYS_ADMIN,
} from '@util';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';
import { CertDetailComponent } from '../cert-detail/cert-detail.component';

import { DOCUMENT } from '@angular/common';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';

@Component({
  selector: 'app-user-v2-item',
  templateUrl: './user-item-v2.component.html',
  styleUrls: ['./user-item-v2.component.less'],
})
export class UserV2ItemComponent implements OnInit {
  @Input() type = 'add';
  @Input() item: any;
  @Input() isVisible = false;
  @Input() option: any;
  @Output() eventEmmit = new EventEmitter<any>();
  listIdentityNumberType: Array<{ value: string; label: string; displayName: string }> = [];
  formInfoPerson: FormGroup;
  formInfoAccount: FormGroup;
  moduleName = 'người dùng';
  identityName = 'chứng minh thư';
  excelStyles: any;
  frameworkComponents: any;
  listOfOrg: any = [];
  listSex = LIST_SEX;
  listCountry: any[] = [];
  listProvince: any[] = [];
  listDistrict: any[] = [];
  listEFormConfig: any[] = LIST_EFORMCONFIG;
  listAccountType: any[] = LIST_ACCOUNT_TYPE;
  isInfo = false;
  isEdit = false;
  isAdd = false;
  checkSysAdmin = false;
  tittle = '';
  dateFormat = 'dd/MM/yyyy';
  isLoading = false;
  isReloadGrid = false;
  defaultColDef: any;
  rowSelection = 'multiple';
  overlayLoadingTemplate = OVERLAY_LOADING_TEMPLATE;
  overlayNoRowsTemplate = OVERLAY_NOROW_TEMPLATE;
  filter: QueryFilerModel = { ...QUERY_FILTER_DEFAULT };
  pageSizeOptions: any[] = [];
  paginationMessage = '';
  columnDefs: any[] = [];
  grid: GridModel = {
    dataCount: 0,
    rowData: [],
    totalData: 0,
  };

  modal: any = {
    type: '',
    item: {},
    isShow: false,
    option: {},
  };

  private gridApi: any;
  private gridColumnApi: any;
  modules = [ClientSideRowModelModule];
  btnSave: ButtonModel;
  btnSaveAndCreate: ButtonModel;
  btnCancel: ButtonModel;
  btnEdit: ButtonModel;

  isCustomer = false;

  isFromDocument: any = false;

  @ViewChild(CertDetailComponent, { static: false }) itemModal!: { initData: (arg0: any, arg1: string) => void };
  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private userService: UserService,
    private orgService: OrganizationApiService,
    private provinceService: ProvinceApiService,
    private districtService: DistrictApiService,
    private countryService: CountryApiService,
    private aclService: ACLService,
    private notification: NzNotificationService,
    private arrayService: ArrayService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    @Inject(DOCUMENT) private doc: any,
  ) {
    this.columnDefs = [
      {
        field: 'index',
        headerName: `${this.i18n.fanyi('layout.grid.index')}`,
        width: 50,
      },
      { field: 'code', headerName: `${this.i18n.fanyi('function.user.modal-item.grid.code')}`, minWidth: 100, flex: 1 },
      { field: 'alias', headerName: `${this.i18n.fanyi('function.user.modal-item.grid.alias')}`, minWidth: 150, flex: 1 },
      { field: 'subjectDN', headerName: `${this.i18n.fanyi('function.user.modal-item.grid.subjectdn')}`, minWidth: 150, flex: 1 },
      {
        field: 'validFrom',
        headerName: `${this.i18n.fanyi('function.user.modal-item.grid.validfrom')}`,
        minWidth: 200,
        flex: 1,
        cellRenderer: 'dateCellRender',
      },
      {
        field: 'validTo',
        headerName: `${this.i18n.fanyi('function.user.modal-item.grid.validto')}`,
        minWidth: 200,
        flex: 1,
        cellRenderer: 'dateCellRender',
      },
      {
        field: 'accountTypeName',
        headerName: `${this.i18n.fanyi('function.user.modal-item.grid.accounttypename')}`,
        minWidth: 200,
        flex: 1,
      },
      {
        headerName: `${this.i18n.fanyi('layout.grid.action')}`,
        minWidth: 50,
        cellRenderer: 'btnCellRender',
        cellRendererParams: {
          infoCertClicked: (item: any) => this.onInfoCert(item.id),
          // downloadClicked: (item: any) => this.onDownloadCertClicked(item.id),
        },
      },
    ];

    this.defaultColDef = {
      minWidth: 100,
      resizable: true,
    };

    this.frameworkComponents = {
      btnCellRender: BtnCellRenderComponent,
      dateCellRender: DateCellRenderComponent,
    };

    this.excelStyles = [...EXCEL_STYLES_DEFAULT];
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
      titlei18n: `${this.i18n.fanyi('layout.button.btn-saveandcreate.label')}`,
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
        this.updateFormToEdit(this.item);
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
    this.formInfoAccount = this.fb.group({
      userName: ['', Validators.required],
      status: [true],
    });
  }

  changeIdentity(event: any): any {
    this.identityName = this.listIdentityNumberType.find((r) => r.value === event)?.displayName ?? this.identityName;
  }

  handleCancel(): void {
    this.isVisible = false;
    if (this.isReloadGrid) {
      this.eventEmmit.emit({ type: 'success' });
    } else {
      this.eventEmmit.emit({ type: 'close' });
    }
  }

  checkIsAdmin(): any {
    this.checkSysAdmin = this.aclService.can(ROLE_SYS_ADMIN);
    if (!this.checkSysAdmin) {
      const tokenData = this.tokenService.get();
      this.formInfoPerson.get('organization')?.setValue(tokenData?.organizationId);
    }
  }

  ngOnInit(): void {
    if (this.listOfOrg.length === 0) {
      this.initListOrg();
    }
    if (this.listCountry.length === 0) {
      this.initListCountry();
    }
    if (this.listProvince.length === 0) {
      this.initListProvince();
    }
    if (this.listDistrict.length === 0) {
      this.initListDistrict();
    }
    this.initRightOfUser();
  }

  initRightOfUser(): void {
    this.btnEdit.grandAccess = this.aclService.canAbility('USER-EDIT') || this.aclService.canAbility('CUSTOMER-EDIT');
    this.btnSave.grandAccess =
      this.aclService.canAbility('USER-ADD') || this.aclService.canAbility('USER-EDIT') || this.aclService.canAbility('CUSTOMER-EDIT');
    this.btnSaveAndCreate.grandAccess = this.aclService.canAbility('USER-ADD');
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.initGridData();
  }

  onResetSearch(reloadData: boolean): void {
    this.filter.pageNumber = 1;
    this.filter.textSearch = undefined;
    this.filter.status = null;
    if (this.checkSysAdmin) {
      this.filter.organizationId = null;
    }
    if (reloadData) {
      this.initGridData();
    }
  }

  initGridData(): Subscription {
    // this.gridApi.showLoadingOverlay();
    const rs = this.userService.getUserHSMAccount(this.filter).subscribe(
      (res: any) => {
        // this.gridApi.hideOverlay();
        if (res.code !== 200) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }

        const dataResult = res.data;

        let i =
          (this.filter.pageSize === undefined ? 0 : this.filter.pageSize) *
          ((this.filter.pageNumber === undefined ? 0 : this.filter.pageNumber) - 1);

        this.paginationMessage = `Hiển thị <b>${i + 1} - ${i + dataResult.dataCount}</b> trên tổng số <b>${
          dataResult.totalCount
        }</b> kết quả`;

        for (const item of dataResult.data) {
          item.index = ++i;
          item.accountTypeName = this.listAccountType.find((r) => r.value == item.accountType)?.label;
          item.infoCertGrantAccess = item.accountType !== Constants.ACCOUNT_TYPE_HSM ? false : true;
          // item.downloadGrantAccess = true;
        }

        this.grid.totalData = dataResult.totalCount;
        this.grid.dataCount = dataResult.dataCount;
        this.grid.rowData = dataResult.data;
        this.pageSizeOptions = [...PAGE_SIZE_OPTION_DEFAULT];
        this.pageSizeOptions = this.pageSizeOptions.filter((number: any) => {
          return number < dataResult.totalCount;
        });
        this.pageSizeOptions.push(dataResult.totalCount);
      },
      (err: any) => {
        console.log(err);
        // this.gridApi.hideOverlay();
      },
    );
    return rs;
  }

  updateFormToAdd(): void {
    this.resetForm();
    this.isInfo = false;
    this.isEdit = false;
    this.isAdd = true;
    // this.tittle = `Thêm mới ${this.moduleName}`;
    this.tittle = `${this.i18n.fanyi('function.user.modal-item.header-add')}`;

    this.formInfoPerson.get('organization')?.enable();
    this.formInfoPerson.get('identityType')?.enable();
    this.formInfoPerson.get('identityType')?.setValue('CMT');
    this.formInfoPerson.get('identityNumber')?.enable();
    this.formInfoPerson.get('issueDate')?.enable();
    this.formInfoPerson.get('position')?.enable();
    this.formInfoPerson.get('issueBy')?.enable();
    this.formInfoPerson.get('countryName')?.enable();
    this.formInfoPerson.get('address')?.enable();
    this.formInfoPerson.get('name')?.enable();
    this.formInfoPerson.get('birthday')?.enable();
    this.formInfoPerson.get('sex')?.enable();
    this.formInfoPerson.get('phoneNumber')?.enable();
    this.formInfoPerson.get('email')?.enable();
    this.formInfoPerson.get('provinceName')?.enable();
    this.formInfoPerson.get('districtName')?.enable();
    this.formInfoPerson.get('connectId')?.enable();
    this.formInfoPerson.get('eFormConfig')?.enable();
    this.formInfoPerson.get('subjectDN')?.enable();

    this.formInfoAccount.get('userName')?.enable();
    this.formInfoAccount.get('status')?.enable();
  }

  updateFormToEdit(data: any): void {
    this.isInfo = false;
    this.isEdit = true;
    this.isAdd = false;
    // this.tittle = `Cập nhật ${this.moduleName}`;
    if (this.isCustomer) {
      this.tittle = `${this.i18n.fanyi('function.customer.modal-item.header-edit')}`;
    } else {
      this.tittle = `${this.i18n.fanyi('function.user.modal-item.header-edit')}`;
    }

    this.formInfoPerson.get('organization')?.setValue(data?.organizationId);
    this.formInfoPerson.get('identityType')?.setValue(data?.identityType);
    this.formInfoPerson.get('identityNumber')?.setValue(data?.identityNumber);
    this.formInfoPerson.get('issueDate')?.setValue(data?.issueDate);
    this.formInfoPerson.get('position')?.setValue(data?.positionName);
    this.formInfoPerson.get('issueBy')?.setValue(data?.issueBy);
    this.formInfoPerson.get('countryName')?.setValue(data?.countryName);
    this.formInfoPerson.get('address')?.setValue(data?.address);
    this.formInfoPerson.get('name')?.setValue(data?.name);
    this.formInfoPerson.get('birthday')?.setValue(data?.birthday);
    this.formInfoPerson.get('sex')?.setValue(data?.sex);
    this.formInfoPerson.get('phoneNumber')?.setValue(data?.phoneNumber);
    this.formInfoPerson.get('email')?.setValue(data?.email);
    this.formInfoPerson.get('provinceName')?.setValue(data?.provinceName);
    this.formInfoPerson.get('districtName')?.setValue(data?.districtName);
    this.formInfoPerson.get('connectId')?.setValue(data?.connectId);
    this.formInfoPerson.get('eFormConfig')?.setValue(data?.eFormConfig);
    this.formInfoPerson.get('subjectDN')?.setValue(data?.subjectDN);
    this.formInfoAccount.get('userName')?.setValue(data?.userName);
    this.formInfoAccount.get('status')?.setValue(data?.status);

    this.formInfoPerson.get('identityType')?.enable();
    this.formInfoPerson.get('identityNumber')?.enable();
    this.formInfoPerson.get('organization')?.enable();
    this.formInfoPerson.get('issueDate')?.enable();
    this.formInfoPerson.get('position')?.enable();
    this.formInfoPerson.get('issueBy')?.enable();
    this.formInfoPerson.get('countryName')?.enable();
    this.formInfoPerson.get('address')?.enable();
    this.formInfoPerson.get('name')?.enable();
    this.formInfoPerson.get('birthday')?.enable();
    this.formInfoPerson.get('sex')?.enable();
    this.formInfoPerson.get('phoneNumber')?.enable();
    this.formInfoPerson.get('email')?.enable();
    this.formInfoPerson.get('provinceName')?.enable();
    this.formInfoPerson.get('districtName')?.enable();
    this.formInfoPerson.get('connectId')?.enable();
    this.formInfoPerson.get('sex')?.enable();
    this.formInfoPerson.get('eFormConfig')?.enable();
    this.formInfoPerson.get('subjectDN')?.enable();

    this.formInfoAccount.get('userName')?.disable();
  }

  updateFormToInfo(data: any): void {
    this.isInfo = true;
    this.isEdit = false;
    this.isAdd = false;
    if (this.isCustomer) {
      this.tittle = `${this.i18n.fanyi('function.customer.model-item-header-info')}`;
    } else {
      this.tittle = `${this.i18n.fanyi('function.user.model-item-header-info')}`;
    }

    this.formInfoPerson.get('organization')?.setValue(data?.organizationId);
    this.formInfoPerson.get('identityType')?.setValue(data?.identityType);
    this.formInfoPerson.get('identityNumber')?.setValue(data?.identityNumber);
    this.formInfoPerson.get('issueDate')?.setValue(data?.issueDate);
    this.formInfoPerson.get('position')?.setValue(data?.positionName);
    this.formInfoPerson.get('issueBy')?.setValue(data?.issueBy);
    this.formInfoPerson.get('countryName')?.setValue(data?.countryName);
    this.formInfoPerson.get('address')?.setValue(data?.address);
    this.formInfoPerson.get('name')?.setValue(data?.name);
    this.formInfoPerson.get('birthday')?.setValue(data?.birthday);
    this.formInfoPerson.get('sex')?.setValue(data?.sex);
    this.formInfoPerson.get('phoneNumber')?.setValue(data?.phoneNumber);
    this.formInfoPerson.get('email')?.setValue(data?.email);
    this.formInfoPerson.get('provinceName')?.setValue(data?.provinceName);
    this.formInfoPerson.get('districtName')?.setValue(data?.districtName);
    this.formInfoPerson.get('connectId')?.setValue(data?.connectId);
    this.formInfoPerson.get('eFormConfig')?.setValue(data?.eFormConfig);
    this.formInfoPerson.get('subjectDN')?.setValue(data?.subjectDN);
    this.formInfoAccount.get('userName')?.setValue(data?.userName);
    this.formInfoAccount.get('status')?.setValue(data?.status);

    this.formInfoAccount.get('userName')?.disable();
    this.formInfoPerson.disable();
  }

  updateFormType(type: string, data: any = {}): void {
    switch (type) {
      case 'add':
        this.updateFormToAdd();
        break;
      case 'info':
        this.updateFormToInfo(data);
        break;
      case 'edit':
        this.updateFormToEdit(data);
        break;
      default:
        this.updateFormToAdd();
        break;
    }
  }

  getUserById(id: any, type: any): any {
    const rs = this.userService.getById(id).subscribe(
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
        this.updateFormType(type, res.data);
      },
      (err: any) => {
        console.log(err);
      },
    );
    return rs;
  }

  public initData(data: any, type: any = null, isCustomer?: boolean, fromDocument?: boolean, option: any = {}): void {
    if (isCustomer) {
      this.isCustomer = isCustomer;
    }
    this.checkIsAdmin();
    if (data.id) {
      const rs = this.getUserById(data.id, type);
      this.filter.userId = data.id;
      this.initGridData();
    } else {
      this.updateFormToAdd();
    }
    this.isLoading = false;
    this.isReloadGrid = false;
    this.type = type;
    this.option = option;

    if (fromDocument) {
      this.isFromDocument = fromDocument;
      this.isVisible = true;
    }
  }

  resetForm(): void {
    this.formInfoPerson.reset();
    this.formInfoAccount.reset();
    this.formInfoAccount.get('status')?.setValue(true);
    this.checkIsAdmin();
  }

  closeModalReloadData(): void {
    this.isVisible = false;
    this.eventEmmit.emit({ type: 'success' });
  }

  initListOrg(): any {
    const rs = this.orgService.getListCombobox().subscribe(
      (res: any) => {
        if (res.code !== 200) {
          this.messageService.error(`Có lỗi xảy ra ${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.messageService.error(`Có lỗi xảy ra ${res.message}`);
          return;
        }

        const arrayTreeResult = res.data.map((item: any, i: number, arr: any[]) => {
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

        this.listOfOrg = this.arrayService.arrToTreeNode(arrayTreeResult, {
          cb: (item: any, parent: any, deep: any) => {
            item.selected = item.id === 0;
          },
        });
      },
      (err: any) => {
        console.log(err);
      },
    );
  }

  changeGttt(event: any): any {
    // this.formInfoAccount.controls.userName.setValue(event);
  }

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
      },
      (err: any) => {
        console.log(err);
      },
    );
  }

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
      },
      (err: any) => {
        console.log(err);
      },
    );
  }

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
      },
      (err: any) => {
        console.log(err);
      },
    );
  }

  // onDownloadCertClicked(id: string): void {
  //   const promise = this.userService.downloadCertificate(id).subscribe(
  //     (res: any) => {
  //       console.log(res);
  //       this.isLoading = false;
  //       if (res.code !== 200) {
  //         this.messageService.error(`${res.message}`);
  //         return;
  //       }
  //       if (res.data === null || res.data === undefined) {
  //         this.messageService.error(`${res.message}`);
  //         return;
  //       }

  //       // const contentType = 'text/plain';
  //       const blob = new Blob([res]);
  //       const url = window.URL.createObjectURL(blob);
  //       //Open a new window to download
  //       // window.open(url);

  //       //Download by dynamically creating a tag
  //       const a = document.createElement('a');
  //       const fileName = 'certificate';
  //       a.href = url;
  //       a.download = fileName + '.csr';
  //       a.click();
  //       window.URL.revokeObjectURL(url);
  //     },
  //     (err: any) => {
  //       this.isLoading = false;
  //       if (err.error) {
  //         console.log(err.error.error);
  //         this.messageService.error(`${err.error.message}`);
  //       } else {
  //         this.messageService.error(`${err.status}`);
  //       }
  //     });
  // }

  onInfoCert(id: string): void {
    this.itemModal.initData(id, 'info');
  }

  onCellDoubleClicked($event: any): void {
    this.onInfoCert($event.data);
  }

  onModalEventEmmit(event: any) {
    console.log(event);
  }

  save(isCreateAfter: boolean = false): Subscription | undefined {
    this.isLoading = true;

    cleanForm(this.formInfoPerson);
    cleanForm(this.formInfoAccount);
    // tslint:disable-next-line:forin
    for (const i in this.formInfoPerson.controls) {
      this.formInfoPerson.controls[i].markAsDirty();
      this.formInfoPerson.controls[i].updateValueAndValidity();
    }
    for (const i in this.formInfoAccount.controls) {
      this.formInfoAccount.controls[i].markAsDirty();
      this.formInfoAccount.controls[i].updateValueAndValidity();
    }
    if (!this.formInfoPerson.valid || !this.formInfoAccount.valid) {
      this.isLoading = false;
      this.messageService.error(`${this.i18n.fanyi('function.user.modal-item.error.message.form-invalid')}`);
      return;
    }
    // tslint:disable-next-line:forin
    for (const i in this.formInfoAccount.controls) {
      this.formInfoAccount.controls[i].markAsDirty();
      this.formInfoAccount.controls[i].updateValueAndValidity();
    }

    if (!this.formInfoAccount.valid) {
      this.isLoading = false;
      this.messageService.error(`${this.i18n.fanyi('function.user.modal-item.error.message.form-invalid')}`);
      return;
    }
    const data = {
      id: this.item?.id,
      organizationId: this.formInfoPerson.controls.organization?.value,
      identityType: this.formInfoPerson.controls.identityType?.value,
      identityNumber: this.formInfoPerson.controls.identityNumber?.value,
      issueDate: this.formInfoPerson.controls.issueDate?.value,
      positionName: this.formInfoPerson.controls.position?.value,
      issueBy: this.formInfoPerson.controls.issueBy?.value,
      countryName: this.formInfoPerson.controls.countryName?.value,
      address: this.formInfoPerson.controls.address?.value,
      name: this.formInfoPerson.controls.name?.value,
      birthday: this.formInfoPerson.controls.birthday?.value,
      sex: this.formInfoPerson.controls.sex?.value,
      phoneNumber: this.formInfoPerson.controls.phoneNumber?.value,
      email: this.formInfoPerson.controls.email?.value,
      // provinceName: this.formInfoPerson.controls.provinceName?.value,
      provinceName: this.formInfoPerson.controls.provinceName?.value,
      zipCode: this.listProvince.find((r) => r.value == this.formInfoPerson.controls.provinceName?.value)?.zipCode,
      // districtName: this.formInfoPerson.controls.districtName?.value,
      districtName: this.formInfoPerson.controls.districtName?.value,
      connectId: this.formInfoPerson.controls.connectId?.value,
      eFormConfig: !this.formInfoPerson.controls.eFormConfig?.value
        ? Constants.SIGN_TYPE_DIG
        : this.formInfoPerson.controls.eFormConfig?.value,
      subjectDN: this.formInfoPerson.controls.subjectDN?.value,
      userName: this.formInfoAccount.controls.userName?.value,
      status: this.formInfoAccount.controls.status?.value,
      isInternalUser: false,
    };

    if (this.isCustomer) {
      data.isInternalUser = false;
    }

    if (!data.name) {
      this.isLoading = false;
      this.messageService.error(`Tên người dùng không được để trống!`);
      return;
    }

    if (this.isAdd) {
      const promise = this.userService.create(data).subscribe(
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
      const promise = this.userService.update(data).subscribe(
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
