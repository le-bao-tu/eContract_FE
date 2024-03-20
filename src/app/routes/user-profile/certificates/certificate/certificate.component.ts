import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ACLService } from '@delon/acl';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ArrayService } from '@delon/util';
import { ButtonModel, GridModel, QueryFilerModel } from '@model';
import {
  CountryApiService,
  DistrictApiService,
  OrganizationApiService,
  ProvinceApiService,
  UserHSMAccountApiService,
  UserService,
} from '@service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { DOCUMENT } from '@angular/common';
import { CertDetailComponent } from '../../../user/cert-detail/cert-detail.component';
import {
  EXCEL_STYLES_DEFAULT,
  LIST_STATUS,
  OVERLAY_LOADING_TEMPLATE,
  OVERLAY_NOROW_TEMPLATE,
  PAGE_SIZE_OPTION_DEFAULT,
  QUERY_FILTER_DEFAULT,
} from '@util';
import { Subscription } from 'rxjs';
import {
  BtnCellRenderComponent,
  BtnSwitchRenderComponent,
  DateCellRenderComponent,
  StatusCellRenderComponent,
  StatusCertCellRenderComponent,
  StatusNameCellRenderComponent,
  StatusUserCellRenderComponent,
} from '@shared';
import { CertificateItemComponent } from '../certificate-item/certificate-item.component';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { translate } from '@antv/g2/lib/util/transform';
import { CertificateRegisterComponent } from '../certificate-register/certificate-register.component';
@Component({
  selector: 'app-certificate',
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.less'],
})
export class CertificateComponent implements OnInit {
  private gridApi: any;
  private gridColumnApi: any;

  btnAdd!: ButtonModel;
  btnDelete!: ButtonModel;
  btnResetSearch!: ButtonModel;
  btnSearch!: ButtonModel;
  btnReload!: ButtonModel;
  isShowDelete = false;
  isCustomer = false;
  tittle = `${this.i18n.fanyi('function.notify-config.title')}`;
  listStatus = LIST_STATUS;
  isFromDocument: any = false;
  formInfoAccount!: FormGroup;
  formInfoPerson!: FormGroup;
  isLoading = false;
  form!: FormGroup;
  pageSizeOptions: any[] = [];
  paginationMessage = '';
  @Input() item: any;
  @Input() isVisible = false;
  @Input() isVisiblee = false;
  @Output() eventEmmit = new EventEmitter<any>();
  @Output() eventEmmiter = new EventEmitter<any>();
  @ViewChild(CertificateItemComponent, { static: false }) itemModal!: { initData: (arg0: any, arg1: string) => void };
  @ViewChild(CertificateRegisterComponent, { static: false }) registerModal!: { initData: (arg0: any, arg1: string) => void };
  constructor(
    private fb: FormBuilder,
    private userHsmAccount: UserHSMAccountApiService,
    private notification: NzNotificationService,
    private modalEdit: NzModalService,
    private messageService: NzMessageService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, // @Inject(DOCUMENT) private doc: any,
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
        field: 'status',
        headerName: `${this.i18n.fanyi('layout.grid.status')}`,
        width: 200,
        cellRenderer: 'statusNameCellRender',
      },
      {
        headerName: `${this.i18n.fanyi('layout.grid.action')}`,
        minWidth: 30,
        cellRenderer: 'btnSwitchRender',
        cellRendererParams: {
          infoClicked: (item: any) => this.onViewItem(item),
          editClicked: (item: any) => this.showConfirm(item),
        },
      },
    ];

    this.defaultColDef = {
      minWidth: 100,
      resizable: true,
    };

    this.frameworkComponents = {
      btnSwitchRender: BtnSwitchRenderComponent,
      btnCellRender: BtnCellRenderComponent,
      dateCellRender: DateCellRenderComponent,
      statusNameCellRender: StatusCellRenderComponent,
    };

    this.excelStyles = [...EXCEL_STYLES_DEFAULT];
    this.btnAdd = {
      title: 'Thêm mới',
      titlei18n: `${this.i18n.fanyi('function.user.button.user-register-HSM')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.onAddItem();
      },
    };
    this.btnSearch = {
      title: 'Tìm kiếm',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.initGridData();
      },
    };
    this.btnResetSearch = {
      title: 'Đặt lại',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.onResetSearch(false);
      },
    };
    this.btnReload = {
      title: 'Tải lại',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-reload.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.onResetSearch(true);
      },
    };
  }
  columnDefs: any[] = [];
  defaultColDef: any;
  rowSelection = 'multiple';
  overlayLoadingTemplate = OVERLAY_LOADING_TEMPLATE;
  overlayNoRowsTemplate = OVERLAY_NOROW_TEMPLATE;
  excelStyles: any;
  frameworkComponents: any;
  filter: QueryFilerModel = { ...QUERY_FILTER_DEFAULT };
  modules = [ClientSideRowModelModule];
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
  modalRegister: any = {
    type: '',
    item: {},
    isShow: false,
    option: {},
  };
  ngOnInit(): void {}

  onInfoCert(id: string): void {
    this.itemModal.initData(id, 'info');
  }

  onCellDoubleClicked($event: any): void {
    this.onViewItem($event.data);
  }

  onPageSizeChange(): void {
    this.initGridData();
  }

  onPageNumberChange(): void {
    this.initGridData();
  }

  onAddItem(item: any = null): void {
    this.modal = {
      type: 'add',
      item: {},
      isShow: true,
      option: {},
    };
    this.registerModal.initData(item, 'add');
  }

  onResetSearch(reloadData: boolean): void {
    this.filter.pageNumber = 1;
    this.filter.textSearch = undefined;
    this.filter.status = null;
    if (reloadData) {
      this.initGridData();
    }
  }

  onViewItem(item: any = null): void {
    if (item === null) {
      const selectedRows = this.gridApi.getSelectedRows();
      item = selectedRows[0];
    }
    if (item.accountType == 1) {
      this.modal = {
        type: 'info',
        item,
        isShow: true,
        option: {},
      };
      this.itemModal.initData(item, 'info');
    }
  }

  confirmModal?: NzModalRef;
  switchValue = false;
  loading = false;

  showConfirm(item: any): void {
    this.modalEdit.confirm({
      nzTitle: item.status
        ? `${this.i18n.fanyi('layout.grid.action.status.true')}`
        : `${this.i18n.fanyi('layout.grid.action.status.false')}`,
      nzOkText: `${this.i18n.fanyi('layout.grid.button.succes')}`,
      nzOnOk: () => this.save(item),
      nzCancelText: `${this.i18n.fanyi('layout.grid.button.reject')}`,
    });
  }

  onSelectionChanged($event: any): void {
    const selectedRows = this.gridApi.getSelectedRows();
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.initGridData();
  }

  initGridData(): Subscription {
    this.gridApi.showLoadingOverlay();
    const rs = this.userHsmAccount.getHSMAccount(this.filter).subscribe(
      (res: any) => {
        // console.log('res: ', res);
        this.gridApi.hideOverlay();
        if (res.code !== 200) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }

        const dataResult = res.data;
        // console.log('data', dataResult);
        let i =
          (this.filter.pageSize === undefined ? 0 : this.filter.pageSize) *
          ((this.filter.pageNumber === undefined ? 0 : this.filter.pageNumber) - 1);

        this.paginationMessage = `Hiển thị <b>${i + 1} - ${i + dataResult.dataCount}</b> trên tổng số <b>${
          dataResult.totalCount
        }</b> kết quả`;
        for (const item of dataResult.data) {
          item.index = ++i;
          item.statusName = this.listStatus.find((x: any) => x.id === item.status)?.name;
          item.accountTypeName = item.accountType === 1 ? 'HSM' : 'ADSS';
          item.infoGrantAccess = true;
          item.editGrantAccess = true;
        }
        this.grid.totalData = dataResult.totalCount;
        this.grid.dataCount = dataResult.dataCount;
        this.grid.rowData = dataResult.data;
        this.pageSizeOptions = [...PAGE_SIZE_OPTION_DEFAULT];
        // tslint:disable-next-line: variable-name
        this.pageSizeOptions = this.pageSizeOptions.filter((number) => {
          return number < dataResult.totalCount;
        });
        this.pageSizeOptions.push(dataResult.totalCount);
      },
      (err: any) => {
        this.gridApi.hideOverlay();
        // console.log(err);
      },
    );
    return rs;
  }

  onModalEventEmmit(event: any): void {
    this.modal.isShow = false;
    if (event.type === 'success') {
      this.initGridData();
    }
  }

  closeModalReloadData(): void {
    this.isVisible = false;
    this.eventEmmit.emit({ type: 'success' });
  }

  save(item: any): Subscription | undefined {
    this.isLoading = true;
    const promise = this.userHsmAccount.updateStatus(item.id).subscribe(
      (res: any) => {
        this.isLoading = false;
        if (res.code !== 200) {
          this.messageService.error(`${res.message}`);
          return;
        }

        const dataResult = res.data;
        this.messageService.success(`${res.message}`);
        this.initGridData();
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
}
