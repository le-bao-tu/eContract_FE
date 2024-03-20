import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { ButtonModel, GridModel, QueryFilerModel } from '@model';
import { BtnCellRenderComponent, DeleteModalComponent } from '@shared';
import {
  Constants,
  LIST_ACCOUNT_TYPE,
  LIST_STATUS,
  OVERLAY_LOADING_TEMPLATE,
  OVERLAY_NOROW_TEMPLATE,
  PAGE_SIZE_OPTION_DEFAULT,
  QUERY_FILTER_DEFAULT,
} from '@util';
import { NzMessageService } from 'ng-zorro-antd/message';
import PerfectScrollbar from 'perfect-scrollbar';
import { Subscription } from 'rxjs';
import { UserHSMAccountApiService } from 'src/app/services/api/user-hsm-account.service';
@Component({
  selector: 'app-hsm-account',
  templateUrl: './hsm-account.component.html',
  styleUrls: ['./hsm-account.component.less'],
})
export class HsmAccountComponent implements OnInit, AfterViewInit {
  @ViewChild(DeleteModalComponent, { static: false }) deleteModal!: {
    initData: (arg0: any, arg1: string) => void;
    updateIsLoading: (arg0: boolean) => void;
    updateData: (arg0: undefined) => void;
  };
  @Input() type = 'add';
  @Input() item: any;
  @Input() isVisible = false;
  @Input() option: any;
  @Output() eventEmmit = new EventEmitter<any>();
  form: FormGroup;
  moduleName = 'Cấu hình tài khoản HSM';
  modules = [ClientSideRowModelModule];
  checkSysAdmin = false;
  isInfo = false;
  isEdit = false;
  isAdd = false;
  tittle = 'Cấu hình tài khoản HSM';
  userId = '';
  username = '';
  isLoading = false;
  isReloadGrid = false;
  isShowDelete = false;
  isLoadingDelete = false;
  id: any;
  isDefault = false;
  btnSave: ButtonModel;
  btnClose: ButtonModel;
  btnCancel: ButtonModel;
  btnDelete: ButtonModel;
  btnEdit: ButtonModel;
  btnReload: ButtonModel;

  columnDefs: any[] = [];
  grid: GridModel = {
    dataCount: 0,
    rowData: [],
    totalData: 0,
  };
  listStatus = LIST_STATUS;
  paginationMessage = '';
  filter: QueryFilerModel = { ...QUERY_FILTER_DEFAULT };
  pageSizeOptions: any[] = [];
  defaultColDef: any;
  rowSelection = 'multiple';
  overlayLoadingTemplate = OVERLAY_LOADING_TEMPLATE;
  overlayNoRowsTemplate = OVERLAY_NOROW_TEMPLATE;
  quickText = '';
  excelStyles: any;
  frameworkComponents: any;
  gridApi: any;
  ratio: any = 1;
  imageWidth: any = 400;
  imageHeight: any = 200;
  gridColumnApi: any;

  hsmAccount = Constants.ACCOUNT_TYPE_HSM;
  listOfAccountType: any[] = LIST_ACCOUNT_TYPE;
  accountType: number = 1;

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private userHSMAccountApiService: UserHSMAccountApiService,
    private elementRef: ElementRef,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    @Inject(DOCUMENT) private doc: any,
  ) {
    this.columnDefs = [
      {
        field: 'code',
        headerName: `${this.i18n.fanyi('function.hsm-account.modal-item.code')}`,
        minWidth: 100,
        flex: 1,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
      },
      {
        field: 'alias',
        headerName: `${this.i18n.fanyi('function.hsm-account.modal-item.alias')}`,
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'hasUserPINStatus',
        headerName: `${this.i18n.fanyi('function.hsm-account.grid.has-userpin')}`,
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'accountTypeName',
        headerName: `${this.i18n.fanyi('function.hsm-account.grid.account-type')}`,
        minWidth: 100,
        flex: 1,
      },
      {
        headerName: `${this.i18n.fanyi('layout.grid.action')}`,
        minWidth: 150,
        cellRenderer: 'btnCellRenderer',
        cellRendererParams: {
          infoClicked: (item: any) => this.onViewItem(item),
          editClicked: (item: any) => this.onEditItem(item),
          deleteClicked: (item: any) => this.onDeleteItem(item),
        },
      },
    ];
    this.defaultColDef = {
      minWidth: 120,
      resizable: true,
    };
    this.frameworkComponents = {
      btnCellRenderer: BtnCellRenderComponent,
    };
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
    this.btnEdit = {
      title: 'Cập nhật',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.updateFormToEdit(this.item);
      },
    };
    this.btnCancel = {
      title: 'Tải Lại',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-reload.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.updateFormToAdd();
      },
    };
    this.btnDelete = {
      title: 'Xóa',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-delete.label')}`,
      visible: false,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.onDeleteItem(null);
      },
    };
    this.btnClose = {
      title: 'Đóng',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-cancel.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.handleCancel();
      },
    };
    this.form = this.fb.group({
      code: ['', Validators.required],
      alias: ['', Validators.required],
      userPIN: [''],
      isDefault: [true],
      accountType: [Constants.ACCOUNT_TYPE_HSM],
      timeOfCTS_HSM: [null]
    });
  }
  onEditItem(item: any): any {
    this.isAdd = false;
    this.id = item.id;
    this.userId = item.userId;
    this.form.controls.code.setValue(item.code);
    if (item.hasUserPIN) this.form.controls.userPIN.setValue('******');
    this.form.controls.alias.setValue(item.alias);
    this.form.controls.isDefault.setValue(item.isDefault);
    this.form.controls.accountType.setValue(item.accountType);

    if (item.validFrom && item.validTo) {
      let timeOfCTSHSM = [item.validFrom, item.validTo];
      this.form.controls.timeOfCTS_HSM.setValue(timeOfCTSHSM);
    } else {
      this.form.controls.timeOfCTS_HSM.setValue(null);
    }
  }
  onDeleteItem(item: any = null): void {
    let selectedRows = this.gridApi.getSelectedRows();
    if (item !== null) {
      selectedRows = [];
      selectedRows.push(item);
    }
    const tittle = 'Xác nhận xóa';
    let content = '';
    if (selectedRows.length > 1) {
      // content = 'Bạn có chắc chắn muốn xóa các bản ghi này không?';
      content = `${this.i18n.fanyi('layout-modal.delete.message.many')}`;
    } else {
      // content = 'Bạn có chắc chắn muốn xóa bản ghi này không?';
      content = `${this.i18n.fanyi('layout-modal.delete.message.one')}`;
    }
    this.isShowDelete = true;
    this.deleteModal.initData(selectedRows, content);
  }
  onResetSearch(reloadData: boolean): void {
    this.filter.pageNumber = 1;
    this.filter.textSearch = undefined;
    this.filter.status = null;
    if (reloadData) {
      this.initGridData();
    }
  }
  handleCancel(): void {
    this.isVisible = false;
    if (this.isReloadGrid) {
      this.eventEmmit.emit({ type: 'success' });
    } else {
      this.eventEmmit.emit({ type: 'close' });
    }
  }
  ngOnInit(): void { }

  updateFormToAdd(): void {
    this.resetForm();
    this.isInfo = false;
    this.isEdit = false;
    this.isAdd = true;
    this.tittle = `${this.i18n.fanyi('function.hsm-account.modal-item.header')}`;
  }

  updateFormToEdit(data: any): void {
    this.resetForm();
    this.isInfo = false;
    this.isEdit = true;
    this.isAdd = false;
  }

  updateFormToInfo(data: any): void {
    this.resetForm();
    this.isInfo = true;
    this.isEdit = false;
    this.isAdd = false;
  }
  onPageNumberChange(): void {
    this.initGridData();
  }
  onPageSizeChange(): void {
    this.initGridData();
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
  public initData(data: any, type: any = null, option: any = {}): void {
    this.resetForm();
    this.isLoading = false;
    this.isReloadGrid = false;
    this.type = type;
    this.option = option;
    if (data.id) {
      this.userId = data.id;
      this.username = data.userName;
      this.filter.userId = data.id;
    }
    this.updateFormType(type);
  }

  resetForm(): void {
    this.form.reset();
    this.form.get('code')?.setValue('');
    this.form.get('alias')?.setValue('');
    this.form.get('userPIN')?.setValue('');
    this.form.get('isDefault')?.setValue(false);
    this.form.get('accountType')?.setValue(Constants.ACCOUNT_TYPE_HSM);
    this.form.get('timeOfCTS_HSM')?.setValue(null);
  }

  closeModalReloadData(): void {
    this.isVisible = false;
    this.eventEmmit.emit({ type: 'success' });
  }
  onSelectionChanged($event: any): void {
    const selectedRows = this.gridApi.getSelectedRows();
    if (selectedRows.length > 0) {
      this.btnDelete.visible = true;
    } else {
      this.btnDelete.visible = false;
    }
  }
  onDeleteEventEmmit(event: any): void {
    if (event.type === 'success') {
      this.initGridData();
    } else if (event.type === 'confirm') {
      this.deleteModal.updateIsLoading(true);
      this.deleteListItem(event.listId);
    }
  }
  onCellDoubleClicked($event: any): void {
    this.updateFormType('edit');
    this.onEditItem($event.data);
  }
  onViewItem(data: any): any {
    this.updateFormToInfo('info');
  }
  onGridReady(params: any): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.approvePerfectScrollbar();
    this.initGridData();
  }
  approvePerfectScrollbar(): void {
    const agBodyViewport: HTMLElement = this.elementRef.nativeElement.querySelector('.ag-body-viewport');
    const agBodyHorizontalViewport: HTMLElement = this.elementRef.nativeElement.querySelector('.ag-body-horizontal-scroll-viewport');
    if (agBodyViewport) {
      const ps = new PerfectScrollbar(agBodyViewport);
      ps.update();
    }
    if (agBodyHorizontalViewport) {
      const ps = new PerfectScrollbar(agBodyHorizontalViewport);
      ps.update();
    }
  }
  ngAfterViewInit(): void { }
  deleteListItem(listId: [string]): Subscription {
    this.isLoadingDelete = true;
    const promise = this.userHSMAccountApiService.delete(listId).subscribe(
      (res: any) => {
        this.isLoadingDelete = false;
        if (res.code !== 200) {
          this.messageService.error(`Có lỗi xảy ra` + `${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.messageService.error(`Có lỗi xảy ra` + `${res.message}`);
          return;
        }
        const dataResult = res.data;
        this.deleteModal.updateData(dataResult);
      },
      (err: any) => {
        this.isLoadingDelete = false;
        this.deleteModal.updateData(undefined);
        if (err.error) {
          this.messageService.error(`Có lỗi xảy ra` + `${err.error.message}`);
        } else {
          this.messageService.error(`Có lỗi xảy ra` + `${err.status}`);
        }
      },
    );
    return promise;
  }
  save(isCreateAfter: boolean = false): Subscription | undefined {
    this.isLoading = true;
    // tslint:disable-next-line:forin
    for (const i in this.form.controls) {
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity();
    }
    if (!this.form.valid) {
      this.isLoading = false;
      this.messageService.error(`${this.i18n.fanyi('function.hsm-account.modal-item.error.message.form-invalid')}`);
      return;
    }

    let fromDate = null;
    let toDate = null;

    if (this.form.controls.accountType.value === Constants.ACCOUNT_TYPE_HSM && this.form.controls.timeOfCTS_HSM.value && this.form.controls.timeOfCTS_HSM.value.length > 0) {
      fromDate = this.form.controls.timeOfCTS_HSM.value[0];
      toDate = this.form.controls.timeOfCTS_HSM.value[1];
    }

    const data = {
      code: this.form.controls.code.value,
      userPIN: this.form.controls.userPIN.value,
      alias: this.form.controls.alias.value,
      userId: this.userId,
      isDefault: this.form.controls.isDefault.value,
      accountType: !this.form.controls.accountType.value ? Constants.ACCOUNT_TYPE_HSM : this.form.controls.accountType.value,
      id: this.id,
      validFrom: fromDate,
      validTo: toDate
    };
    if (this.isAdd) {
      const promise = this.userHSMAccountApiService.create(data).subscribe(
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
    } else {
      const promise = this.userHSMAccountApiService.update(data).subscribe(
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
  initGridData(): Subscription {
    this.btnDelete.visible = false;
    this.gridApi.showLoadingOverlay();
    const rs = this.userHSMAccountApiService.getFilter(this.filter).subscribe(
      (res: any) => {
        this.gridApi.hideOverlay();
        if (res.code !== 200) {
          this.messageService.error(`Có lỗi xảy ra` + `${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.messageService.error(`Có lỗi xảy ra` + `${res.message}`);
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
          item.hasUserPINStatus = item.hasUserPIN ? 'Đã có PIN' : 'Chưa có PIN';
          item.accountTypeName = item.accountType === Constants.ACCOUNT_TYPE_HSM ? 'HSM' : 'ADSS'
          item.name = item.code;
          item.index = ++i;
          item.editGrantAccess = true;
          item.infoGrantAccess = false;
          item.deleteGrantAccess = true;
        }
        this.grid.totalData = dataResult.totalCount;
        this.grid.dataCount = dataResult.dataCount;
        this.grid.rowData = dataResult.data;
        this.pageSizeOptions = [...PAGE_SIZE_OPTION_DEFAULT];
        // tslint:disable-next-line:variable-name
        this.pageSizeOptions = this.pageSizeOptions.filter((number) => {
          return number < dataResult.totalCount;
        });
        this.pageSizeOptions.push(dataResult.totalCount);
      },
      (err: any) => {
        this.gridApi.hideOverlay();
      },
    );
    return rs;
  }

  accountTypeChange($event: any) {
    this.accountType = $event;
  }
}
