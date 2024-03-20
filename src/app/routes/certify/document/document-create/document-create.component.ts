import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ACLService } from '@delon/acl';
import { ArrayService } from '@delon/util';
import { ButtonModel, ExcelColumnMapping, GridModel, QueryFilerModel } from '@model';
import {
  CertifyTypeApiService,
  DocumentBatchApiService,
  DocumentTemplateApiService,
  OrganizationApiService,
  PositionApiService,
  UserApiService,
  WorkflowApiService,
} from '@service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTreeNode } from 'ng-zorro-antd/tree';
import { NzUploadChangeParam } from 'ng-zorro-antd/upload';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import PerfectScrollbar from 'perfect-scrollbar';
import { ArgumentOutOfRangeError, async, Observable, Observer, Subscription } from 'rxjs';
import * as XLSX from 'xlsx';

import { NzModalService } from 'ng-zorro-antd/modal';

import { Inject, Injectable, Injector } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BtnCellRenderComponent, DeleteModalComponent, StatusNameCellRenderComponent } from '@shared';

import { environment } from '@env/environment';
import { cleanForm, LIST_SIGN_TYPE, nodeUploadRouter } from '@util';

import {
  EXCEL_STYLES_DEFAULT,
  LIST_STATUS,
  OVERLAY_LOADING_TEMPLATE,
  OVERLAY_NOROW_TEMPLATE,
  PAGE_SIZE_OPTION_DEFAULT,
  QUERY_FILTER_DEFAULT,
  stringToBoolean,
} from '@util';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';

@Component({
  selector: 'app-document-create',
  templateUrl: './document-create.component.html',
  styleUrls: ['./document-create.component.less'],
})
export class DocumentCreateComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private userApiService: UserApiService,
    private messageService: NzMessageService,
    private documentBatchApiService: DocumentBatchApiService,
    private aclService: ACLService,
    private modalService: NzModalService,
    private certifyTypeApiService: CertifyTypeApiService,
    private documentTemplateApiService: DocumentTemplateApiService,
    private elementRef: ElementRef,
    private workflowApiService: WorkflowApiService,
    private organizationApiService: OrganizationApiService,
    private positionApiService: PositionApiService,
    private arrayService: ArrayService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private _router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {
    const token = tokenService.get()?.token;
    if (token) {
      this.headerUploadFile = {
        Authorization: 'Bearer ' + token,
      };
    }
    //#region ag-grid
    this.columnDefs = [
      {
        field: 'index',
        headerName: `${this.i18n.fanyi('layout.grid.index')}`,
        width: 50,
        headerCheckboxSelection: false,
        headerCheckboxSelectionFilteredOnly: true,
      },
    ];
    this.defaultColDef = {
      // flex: 1,
      minWidth: 100,
      resizable: true,
    };
    this.frameworkComponents = {
      btnCellRenderer: BtnCellRenderComponent,
      statusNameCellRender: StatusNameCellRenderComponent,
    };
    this.excelStyles = [...EXCEL_STYLES_DEFAULT];
    //#endregion ag-grid

    //#region buttoon
    this.btnCancel = {
      title: 'Đóng',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-cancel.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.showConfirmCancel();
      },
    };

    this.btnContinue = {
      title: 'Tiếp tục',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-continue.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.handleContinue();
      },
    };

    this.btnBack = {
      title: 'Quay lại',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-back.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.handleBack();
      },
    };

    this.btnSave = {
      title: 'Hoàn tất',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-completed.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.save();
      },
    };

    this.btnExportExcel = {
      title: 'Export excel',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.onExportExcel();
      },
    };

    this.btnImportExcel = {
      title: 'Import excel',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.onImportExcel();
      },
    };

    //#endregion
    this.userNameFilteredOptions = this.userNameOptions;
    //#region Other param
    this.screen = 1;
    this.userNameFilteredOptions = this.userNameOptions;
    //#endregion

    if (this.tokenService.get()?.token) {
      this.user_id = this.tokenService.get()?.id;
      this.user_email = this.tokenService.get()?.email;
    }
  }

  @Input() type = 'add';
  @Input() item: any;
  @Input() isVisible = false;
  @Input() option: any;
  @Output() eventEmmit = new EventEmitter<any>();

  // tittle = 'TẠO MỚI HỢP ĐỒNG';
  tittle = `${this.i18n.fanyi('function.document-create.title')}`;
  myText = `${this.i18n.fanyi('function.document-create.grid.description')}`;

  headerUploadFile = {};

  columnDefs: any[] = [];
  grid: GridModel = {
    dataCount: 0,
    rowData: [],
    totalData: 0,
  };
  private gridApi: any;
  private gridColumnApi: any;
  modules = [ClientSideRowModelModule];
  defaultColDef: any;
  rowSelection = 'multiple';
  overlayLoadingTemplate = OVERLAY_LOADING_TEMPLATE;
  overlayNoRowsTemplate = OVERLAY_NOROW_TEMPLATE;
  quickText = '';
  excelStyles: any;
  frameworkComponents: any;

  jsonObject: any[] = [];
  excelColumnsMapping: ExcelColumnMapping[] = [];

  data: NzTreeNode[] = [];
  delDisabled = false;

  isLoading = false;
  isReloadGrid = false;
  fileList: NzUploadFile[] = [];

  btnCancel: ButtonModel;
  btnContinue: ButtonModel;
  btnBack: ButtonModel;
  btnSave: ButtonModel;
  btnExportExcel: ButtonModel;
  btnImportExcel: ButtonModel;
  userNameFilteredOptions: any[] = [];
  userNameOptions: any[] = [];
  listOfCertifyType: any[] = [];
  listOfWorkflow: any[] = [];
  listOfWorkflowDefault: any[] = [];
  listOfWorkflowCustom: any[] = [];
  listUser: any[] = [];

  listOfDocumentTemplate: any[] = [];
  selectedCertifyType: any = null;

  // Other variable
  screen: number;
  radioWorkflowTypeValue = '1';
  listOfOrgs: any[] = [];
  user_id: any = null;
  user_email: any = null;
  newWorkflow: any = {
    name: '',
    orgId: null,
    status: true,
  };
  checkedMailNotify = true;
  selectedCertifyTypeDefault: any = null;
  selectedCertifyTypeCustom: any = null;

  //#region User
  tempWorkflowId: any = null;
  listUserForWorkflow: any[] = [];
  listOfPositions: any[] = [];

  // Region autocomplete User List
  userNameInputValue?: string;
  // userNameFilteredOptions: any[] = [];
  // userNameOptions: any[] = [];

  optionGroups: AutocompleteOptionGroups[] = [];

  listOfSignOption = LIST_SIGN_TYPE;

  document_batch: any = {
    code: null,
    name: null,
    description: null,
    status: true,
    documentTypeId: null,
    documentTypeName: null,
    type: '1',
    workflowId: null,
    workflowName: null,
    numberOfEmailPerWeek: 0,
    order: 0,
  };

  uploadUrl = environment.API_URL + nodeUploadRouter.uploadFileBinary;

  tokenData: any = {};

  //#endregion

  handleCancel(): void {
    this.isVisible = false;
    if (this.isReloadGrid) {
      this.eventEmmit.emit({ type: 'success' });
    } else {
      this.eventEmmit.emit({ type: 'close' });
    }
  }

  showConfirmCancel(): void {
    this.modalService.confirm({
      nzTitle: `${this.i18n.fanyi('function.document-template.modal-confirm-cancel.header')}`,
      nzContent: '',
      nzCancelText: `${this.i18n.fanyi('layout.button.btn-cancel.label')}`,
      nzOkText: `${this.i18n.fanyi('layout.button.btn-ok.label')}`,
      nzOnOk: () => {
        this.redirect();
      },
    });
  }

  handleContinue(): void {
    // Check valid
    if (
      this.document_batch.documentTypeId === null ||
      this.document_batch.documentTypeId === undefined ||
      this.document_batch.documentTypeId === ''
    ) {
      this.messageService.error(`Loại hợp đồng không được để trống!`);
      return;
    }

    // if (this.document_batch.code === null || this.document_batch.code === undefined || this.document_batch.code === '') {
    //   this.messageService.error(`Mã lô không được để trống!`);
    //   return;
    // }

    // if (this.document_batch.name === null || this.document_batch.name === undefined || this.document_batch.name === '') {
    //   this.messageService.error(`Tên lô không được để trống!`);
    //   return;
    // }

    if (this.document_batch.type === '1' && this.fileList.length < 1) {
      this.messageService.error(`Bạn chưa tải lên file hợp đồng!`);
      return;
    }

    if (this.gridApi && this.gridApi.getDisplayedRowCount() === 0 && this.document_batch.type === '2') {
      this.messageService.error(`Dữ liệu hợp đồng không được để trống!`);
      return;
    }

    this.screen = 2;
    return;
  }

  handleBack(): void {
    this.screen = 1;
  }

  handleChange({ file, fileList }: NzUploadChangeParam): void {
    const status = file.status;
    if (status !== 'uploading') {
      // console.log(file, fileList);
    }
    if (status === 'done') {
      this.messageService.success(`${file.name} đã tải lên thành công.`);
    } else if (status === 'error') {
      this.messageService.error(`${file.name} tải lên thất bại.`);
    }
  }

  ngOnInit(): void {
    this.initRightOfUser();
    this.initListPositions();
    this.initListCertifyType();
    this.initListUsers();
    // this.initListOrgs();
    this.initTreeData();
    this.initListWorkflows();
    // this.initListUsers();
    this.tokenData = this.tokenService.get();
    this.newWorkflow.orgId = this.tokenData?.organizationId;
    // debugger;
    // setTimeout(() => {
    //   this.optionGroups = [
    //     {
    //       title: 'Danh bạ nội bộ',
    //       href: '/#/workflow/contact/internal',
    //       children: this.userNameOptions.filter((item) => {
    //         return item.userId === undefined;
    //       }),
    //     },
    //     // {
    //     //   title: 'Danh bạ của tôi',
    //     //   href: '/#/workflow/contact/owner',
    //     //   children: this.userNameOptions.filter((item) => {
    //     //     return item.userId !== undefined;
    //     //   }),
    //     // },
    //   ];
    // }, 2000);
    // // B1 Check xem mail có trong danh bạ k
    // const userUser = this.userNameOptions.find((c) => c.email === this.user_email);
    // // B2 Add vào lstUser
    // if (
    //   userUser !== undefined &&
    //   userUser !== null &&
    //   (this.user_email !== undefined || this.user_email !== null) &&
    //   this.option.type !== 'default'
    // ) {
    //   this.listUser = [
    //     {
    //       order: 0,
    //       type: this.listOfSignOption[0].value,
    //       name: '',
    //       userId: userUser.id,
    //       userEmail: userUser.email,
    //       userName: userUser.name,
    //       userFullName: userUser.fullName,
    //       userPhoneNumber: userUser.phoneNumber,
    //       userPositionName: userUser.positionName,
    //       selectedSignType: this.listOfSignOption[0],
    //       isDisabled: true,
    //     },
    //   ];
    // } else {
    //   this.listUser = [
    //     {
    //       order: 0,
    //       type: this.listOfSignOption[0].value,
    //       name: '',
    //       userId: null,
    //       userName: '',
    //       userFullName: '',
    //       userEmail: '',
    //       userPhoneNumber: '',
    //       userPositionName: '',
    //       selectedSignType: this.listOfSignOption[0],
    //       isDisabled: false,
    //     },
    //   ];
    // }
  }
  onChangeUserName(value: any, i: number): void {
    const user = this.listUserForWorkflow.find((x) => x.value === value);
    this.listUser[i].userId = user?.id;
    this.listUser[i].userName = user?.name;
    this.listUser[i].userFullName = user?.fullName;
    this.listUser[i].userEmail = user?.email;
    this.listUser[i].userPhoneNumber = user?.phoneNumber;
    this.listUser[i].userPositionName = user?.positionName;
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

  initTreeData(): Subscription {
    const rs = this.organizationApiService.getListCombobox().subscribe(
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

        this.data = this.arrayService.arrToTreeNode(arrayTreeResult, {
          cb: (item, parent, deep) => {
            // item.expanded = deep <= 1;
            item.selected = item.id === 0;
          },
        });
      },
      (err: any) => {
        // console.log(err);
      },
    );
    return rs;
  }

  initListWorkflows(): Subscription | undefined {
    const promise = this.workflowApiService.getListCombobox(this.user_id).subscribe(
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
        this.listOfWorkflow = dataResult;
        this.listOfWorkflowDefault = this.listOfWorkflow.filter((data: any) => data.userId === null || data.userId === undefined);
        this.listOfWorkflowCustom = this.listOfWorkflow.filter((data: any) => data.userId !== null && data.userId !== undefined);
        this.listOfWorkflowDefault.forEach((element) => {
          element.value = element.id;
          element.label = `${element.code} - ${element.name}`;
        });
        this.listOfWorkflowCustom.forEach((element) => {
          element.value = element.id;
          element.label = `${element.code} - ${element.name}`;
        });
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

  initListPositions(): Subscription | undefined {
    const promise = this.positionApiService.getListCombobox().subscribe(
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
        this.listOfPositions = dataResult;
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

  onGridReady(params: any): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    // this.approvePerfectScrollbar();
    // this.initGridData();
  }

  //#region Event
  onExportExcel(): void {
    const params = {
      columnWidth: 100,
      sheetName: 'Danh sách',
      exportMode: undefined, // 'xml', // : undefined,
      suppressTextAsCDATA: true,
      rowHeight: undefined,
      fileName: `Mẫu - Danh sách thông tin hợp đồng.xlsx`,
      headerRowHeight: undefined, // undefined,
      customHeader: [],
      customFooter: [[]],
    };
    this.gridApi.exportDataAsExcel(params);
  }

  onImportExcel(): void {
    // this.isShowImport = true;
    // this.importModal.initData();
  }

  onChangeSignType(value: any, i: number): void {
    this.listUser[i].type = Number(value.value);
  }

  onChangeRadioWorkflowType(value: any): void {
    // Reset Workflow
    this.newWorkflow = {
      name: '',
      orgId: null,
      status: true,
    };

    if (value === '1') {
      this.selectedCertifyTypeCustom = null;
      this.listUser = [];
    } else if (value === '2') {
      this.selectedCertifyTypeDefault = null;
      this.listUser = [];
    } else {
      this.newWorkflow.orgId = this.tokenData?.organizationId;
      this.selectedCertifyTypeCustom = null;
      this.selectedCertifyTypeDefault = null;
      // this.initListUsers();
    }
  }
  initListUsers(): Subscription | undefined {
    const orgId = this.tokenService.get()?.organizationId;
    const promise = this.userApiService.getListCombobox(orgId).subscribe(
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
        this.listUserForWorkflow = dataResult;
        this.listUserForWorkflow.forEach((element) => {
          element.value = element.id;
          element.label = `${element.code} - ${element.name}`;
        });
        this.userNameOptions = dataResult;
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
  removeUser($event: any, index: any): void {
    if (this.listUser.length === 1) {
      return;
    }
    this.listUser.splice(index, 1);
  }

  addUser($event: any): void {
    this.listUser.push({
      order: 0,
      type: this.listOfSignOption[0].value,
      name: '',
      state: '',
      userId: null,
      userName: '',
      userFullName: '',
      userEmail: '',
      positionName: '',
      selectedSignType: this.listOfSignOption[0],
      isDisabled: false,
    });
  }

  //#region convertExcelData
  transformExcelFileToGrid = (file: NzUploadFile) => {
    this.parseExcel(file);
    return new Observable((observer: Observer<Blob>) => {});
    // tslint:disable-next-line: semicolon
  };

  parseExcel(file: any): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, {
        type: 'binary',
      });
      workbook.SheetNames.forEach((sheetName) => {
        // Here is your object
        const XL_row_object = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        this.jsonObject = [...XL_row_object];
      });

      const listObj: any[] = [];
      let i = 0;
      let check = false;
      this.jsonObject.forEach((itemExcel) => {
        const itemGrid: any = { index: ++i };
        check = false;
        this.excelColumnsMapping.forEach((col) => {
          this.convertExcelToGrid(itemGrid, itemExcel);
        });
        itemGrid.deleteGrantAccess = true;
        listObj.push(itemGrid);
      });

      // Add addGrantAccess to last item
      // tslint:disable-next-line:no-shadowed-variable
      for (let i = 0; i < listObj.length; i += 1) {
        if (i === listObj.length - 1) {
          listObj[i].addGrantAccess = true;
        }
      }

      // console.log(listObj);
      this.gridApi.setRowData(listObj);
      if (listObj.length === 0) {
        this.messageService.error(`Dữ liệu tải lên không phù hợp`);
      } else {
        this.messageService.success(`Tải lên dữ liệu thành công`);
      }
    };

    reader.onerror = (ex) => {
      this.messageService.error(`Tải lên dữ liệu thất bại - ${ex}`);
      // console.log(ex);
    };

    reader.readAsBinaryString(file);
  }

  convertExcelToGrid = (itemGrid: any, itemExcel: any): void => {
    this.excelColumnsMapping.forEach((col) => {
      if (col.dataType === 'string') {
        itemGrid[col.gridName!] = itemExcel[col.excelName!] ? '' + itemExcel[col.excelName!] : '';
      } else if (col.dataType === 'number') {
        itemGrid[col.gridName!] = itemExcel[col.excelName!] ? parseFloat(itemExcel[col.excelName!]) : '';
      } else if (col.dataType === 'boolean') {
        itemGrid[col.gridName!] = itemExcel[col.excelName!] ? stringToBoolean(itemExcel[col.excelName!]) : '';
      } else {
        itemGrid[col.gridName!] = itemExcel[col.excelName!] ? itemExcel[col.excelName!] : '';
      }
    });
    // tslint:disable-next-line:semicolon
  };

  //#endregion convertExcelData

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

  onSelectionChanged($event: any): void {
    const selectedRows = this.gridApi.getSelectedRows();
  }

  onViewItem(item: any = null): void {
    if (item === null) {
      const selectedRows = this.gridApi.getSelectedRows();
      item = selectedRows[0];
    }
  }

  onAddItem(item: any = null): void {
    const data: any[] = [];
    // iterate through every node in the grid
    this.gridApi.forEachNode((rowNode: any, index: number) => {
      data.push(rowNode.data);
    });

    // Remove addGrantAccess to last item
    for (let i = 0; i < data.length; i += 1) {
      if (i === data.length - 1) {
        data[i].addGrantAccess = false;
      }
    }

    // Add 1 row
    data.push({
      index: data.length + 1,
      addGrantAccess: true,
      deleteGrantAccess: true,
    });

    this.gridApi.setRowData(data);
  }

  onDeleteItem(item: any = null): void {
    const data: any[] = [];
    // iterate through every node in the grid
    this.gridApi.forEachNode((rowNode: any, index: number) => {
      data.push(rowNode.data);
    });

    // Splice data
    data.splice(item.index - 1, 1);

    // ReAssigned Index
    for (let i = 0; i < data.length; i += 1) {
      data[i].index = i + 1;
      if (i === data.length - 1) {
        data[i].addGrantAccess = true;
      }
    }

    // Reload Grid
    this.gridApi.setRowData(data);
  }
  //#endregion Ag-grid

  initRightOfUser(): void {
    // this.btnSave.grandAccess = this.aclService.canAbility('UNIT-CREATE');
    // this.btnEdit.grandAccess = this.aclService.canAbility('UNIT-EDIT');
    // this.btnSaveAndCreate.grandAccess = this.aclService.canAbility('UNIT-CREATE');
  }

  initListCertifyType(): Subscription | undefined {
    const promise = this.certifyTypeApiService.getListCombobox().subscribe(
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
        this.listOfCertifyType = dataResult;
        this.listOfCertifyType.forEach((element) => {
          element.name = `${element.code} - ${element.name}`;
        });
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

  closeModalReloadData(): void {
    this.isVisible = false;
    this.eventEmmit.emit({ type: 'success' });
  }

  onChangeCertifyType(value: any): Subscription | undefined {
    this.grid.rowData = [{ index: 1, addGrantAccess: true, deleteGrantAccess: true }];
    if (value == null || value === undefined) {
      return;
    }
    const promise = this.documentTemplateApiService.getByType(value).subscribe(
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
        this.listOfDocumentTemplate = dataResult;

        // Lấy danh sách các metadata
        const colsInGrid: any[] = [];

        this.listOfDocumentTemplate.forEach((element) => {
          const documentMetaDataConfigs = element.documentMetaDataConfig;

          documentMetaDataConfigs.forEach((item: any) => {
            colsInGrid.push(item);
          });
        });

        // Reset columnDefs
        const firstCol = this.columnDefs[0];
        this.columnDefs = [];
        this.columnDefs.push(firstCol);

        // Distinct column metadata + create column in ag-grid
        const map = new Map();
        for (const item of colsInGrid) {
          if (!map.has(item.metaDataId)) {
            map.set(item.metaDataId, true); // set any value to Map
            this.columnDefs.push({
              field: item.metaDataCode,
              headerName: item.metaDataName + ' - ' + item.metaDataCode,
              editable: true,
              sortable: true,
              filter: true,
              minWidth: 180,
              flex: 1,
            });

            this.excelColumnsMapping.push({
              gridName: item.metaDataCode,
              excelName: item.metaDataName + ' - ' + item.metaDataCode,
              dataType: 'string',
            });
          }
        }
        this.columnDefs.push({
          headerName: 'Thao tác',
          minWidth: 150,
          cellRenderer: 'btnCellRenderer',
          cellRendererParams: {
            addClicked: (item: any) => this.onAddItem(item),
            deleteClicked: (item: any) => this.onDeleteItem(item),
          },
        });

        this.gridApi.setColumnDefs(this.columnDefs);
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

  onChangeWorkflow(value: any): Subscription | undefined {
    if (value == null || value === undefined) {
      return;
    }

    const promise = this.workflowApiService.getById(value).subscribe(
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
        this.newWorkflow.name = dataResult.name;
        this.newWorkflow.orgId = dataResult.organizationId;
        this.listUser = dataResult.listUser;
        this.listUser.forEach((con: any) => {
          con.userPosition = this.listOfPositions.find((c) => c.id === con.positionId)?.name;
          con.selectedSignType = this.listOfSignOption.find((c) => c.value === con.type);
        });
        // console.log(dataResult);
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

  redirect(): any {
    this._router.navigate(['/certify/document']);
  }

  deleteTempWorkflow(id: any): void {
    if (id === null || id === undefined) {
      return;
    }

    const promise = this.workflowApiService.delete([String(id)]).subscribe(
      (res: any) => {
        if (res.code !== 200) {
          // this.messageService.error(`${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          // this.messageService.error(`${res.message}`);
          return;
        }
        const dataResult = res.data;
        // this.messageService.success(`${res.message}`);
      },
      (err: any) => {
        if (err.error) {
          // this.messageService.error(`${err.error.message}`);
        } else {
          // this.messageService.error(`${err.status}`);
        }
      },
    );
  }

  async save(): Promise<Subscription | undefined> {
    this.isLoading = true;
    const data: any = {
      code: this.document_batch.code,
      name: this.document_batch.name,
      description: null,
      status: true,
      workFlowUser: [],
      documentTypeId: this.document_batch.documentTypeId,
      documentTypeName: null,
      type: Number(this.document_batch.type),
      workflowId: null,
      workflowName: null,
      numberOfEmailPerWeek: Number(this.document_batch.numberOfEmailPerWeek),
      order: 0,
      listFile: [],
    };

    // Send mail
    if (!this.checkedMailNotify) {
      data.numberOfEmailPerWeek = 0;
    }
    let flag = 0;
    this.listUser.map((item) => {
      if (item.userName === null || item.userName === undefined || item.userName === '') {
        flag = 1;
        return;
      }
    });
    if (flag === 1) {
      this.isLoading = false;
      this.messageService.error('Thông tin người tham gia không được trống!');
      return;
    }
    //#region Workflow & User
    if (this.radioWorkflowTypeValue === '1') {
      // Get workflow Info
      const response = await this.workflowApiService.getById(this.selectedCertifyTypeDefault).toPromise();

      if (response.code === 200) {
        const wfResponseData = response.data;
        data.workflowId = wfResponseData.id;
        data.workflowName = wfResponseData.name;

        this.listUser.forEach(
          (element: { name: any; userId: any; userName: any; userFullName: string; userEmail: any; type: number; id: string }) => {
            data.workFlowUser.push({
              id: element.id,
              order: 0,
              type: element.type,
              name: element.name,
              state: '',
              workflowId: wfResponseData.id,
              userId: element.userId,
              userName: element.userName,
              userFullName: element.userFullName,
              userEmail: element.userEmail,
            });
          },
        );
      } else {
        this.messageService.error(response.message);
      }
    }
    if (this.radioWorkflowTypeValue === '2') {
      // Get workflow Info
      const response = await this.workflowApiService.getById(this.selectedCertifyTypeCustom).toPromise();

      if (response.code === 200) {
        const wfResponseData = response.data;
        data.workflowId = wfResponseData.id;
        data.workflowName = wfResponseData.name;

        this.listUser.forEach(
          (element: { name: any; userId: any; userName: any; userFullName: string; userEmail: any; type: number; id: string }) => {
            data.workFlowUser.push({
              id: element.id,
              order: 0,
              type: element.type,
              name: element.name,
              state: '',
              workflowId: wfResponseData.id,
              userId: element.userId,
              userName: element.userName,
              userFullName: element.userFullName,
              userEmail: element.userEmail,
            });
          },
        );
      } else {
        this.messageService.error(response.message);
      }
    }
    if (this.radioWorkflowTypeValue === '3') {
      //#region Check new Workflow
      if (this.newWorkflow.name === null || this.newWorkflow.name === undefined || this.newWorkflow.name === '') {
        this.isLoading = false;
        this.messageService.error(`Tên quy trình không được để trống!`);
        return;
      }
      if (this.newWorkflow.orgId === null || this.newWorkflow.orgId === undefined || this.newWorkflow.orgId === '') {
        this.isLoading = false;
        this.messageService.error(`Bộ phận không được để trống!`);
        return;
      }

      // Check list User
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.listUser.length; i++) {
        if (
          this.listUser[i].userName === null ||
          this.listUser[i].userName === undefined ||
          this.listUser[i].userName === '' ||
          this.listUser[i].userEmail === null ||
          this.listUser[i].userEmail === undefined ||
          this.listUser[i].userEmail === ''
        ) {
          this.messageService.error(`Kiểm tra lại thông tin người tham gia!`);
          this.isLoading = false;
          return;
        }
      }
      //#endregion

      //#region Create new workflow
      const workflowData = {
        code: '',
        name: this.newWorkflow.name,
        status: this.newWorkflow.status,
        organizationId: this.newWorkflow.orgId,
        userId: this.user_id,
        listUser: this.listUser,
        order: 0,
        description: '',
      };

      const response = await this.workflowApiService.create(workflowData).toPromise();

      if (response.code === 200) {
        const wfId = response.data;
        this.tempWorkflowId = wfId;
        // Assigned to data
        data.workflowId = wfId;
        data.workflowName = this.newWorkflow.name;

        this.listUser.forEach((element: { id: any; type: any; userId: any; userName: any; userFullName: string }) => {
          data.workFlowUser.push({
            id: element.id,
            order: 0,
            type: element.type,
            name: '',
            state: '',
            workflowId: wfId,
            userId: element.userId,
            userName: element.userName,
            userFullName: element.userFullName,
          });
        });
      } else {
        this.messageService.error(response.message);
      }
      //#endregion
    }

    //#endregion

    //#region File
    if (this.document_batch.type === '1') {
      const listOfFile: any[] = [];
      this.fileList.forEach((element) => {
        listOfFile.push({
          fileName: element.response?.data.fileName,
          fileBucketName: element.response?.data.bucketName,
          fileObjectName: element.response?.data.objectName,
        });
      });
      data.listFile = listOfFile;
      // console.log(listOfFile);
    } else {
      //#region metaDat
      const listMetaData: any[] = [];
      const colsInGrid: any[] = [];
      this.listOfDocumentTemplate.forEach((element) => {
        const documentMetaDataConfigs = element.documentMetaDataConfig;
        documentMetaDataConfigs.forEach((item: any) => {
          colsInGrid.push(item);
        });
      });

      const tempColsMetaData: any[] = [];
      const map = new Map();
      for (const item of colsInGrid) {
        if (!map.has(item.metaDataId)) {
          map.set(item.metaDataId, true); // set any value to Map
          tempColsMetaData.push({
            metaDataId: item.metaDataId,
            metaDataCode: item.metaDataCode,
            metaDataName: item.metaDataName,
          });
        }
      }
      // Data In Grid
      const dataInGrid: any[] = [];
      // iterate through every node in the grid
      this.gridApi.forEachNode((rowNode: any, index: number) => {
        dataInGrid.push(rowNode.data);
      });

      dataInGrid.forEach((dig) => {
        const singleRow: any = {
          fullName: '',
          email: '',
          phoneNumber: '',
          metaData: [],
        };
        tempColsMetaData.forEach((tcmd) => {
          if (dig[tcmd.metaDataCode] !== undefined || dig[tcmd.metaDataCode] !== null) {
            switch (tcmd.metaDataCode) {
              case 'EMAIL':
                singleRow.email = dig[tcmd.metaDataCode];
                break;
              case 'FULLNAME':
                singleRow.fullName = dig[tcmd.metaDataCode];
                break;
              case 'PHONENUMBER':
                singleRow.phoneNumber = dig[tcmd.metaDataCode];
                break;
              default:
                break;
            }
            singleRow.metaData.push({
              value: dig[tcmd.metaDataCode],
              metaDataId: tcmd.metaDataId,
              metaDataCode: tcmd.metaDataCode,
              metaDataName: tcmd.metaDataName,
            });
          }
        });
        listMetaData.push(singleRow);
      });
      data.listMetaData = listMetaData;

      //#endregion

      //#region File
      const listOfFile: any[] = [];

      this.listOfDocumentTemplate.forEach((element) => {
        element.documentFileTemplate.forEach((it: { fileName: any; fileBucketName: any; fileObjectName: any; id: any }) => {
          listOfFile.push({
            fileName: it.fileName,
            fileBucketName: it.fileBucketName,
            fileObjectName: it.fileObjectName,
            documentFileTemplateId: it.id,
          });
        });
      });
      data.listFile = listOfFile;
      //#endregion
    }

    //#endregion

    // Call API save
    const promise = this.documentBatchApiService.create(data).subscribe(
      (res: any) => {
        if (res.code !== 200) {
          // Xóa Workflow vừa tạo mới nếu Tạo hợp đồng thất bại
          this.deleteTempWorkflow(this.tempWorkflowId);
          this.messageService.error(`${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          // Xóa Workflow vừa tạo mới nếu Tạo hợp đồng thất bại
          this.deleteTempWorkflow(this.tempWorkflowId);
          this.messageService.error(`${res.message}`);
          return;
        }
        this.isLoading = false;
        this.messageService.success(`${res.message}`);
        this.redirect();
      },
      (err: any) => {
        if (err.error) {
          // Xóa Workflow vừa tạo mới nếu Tạo hợp đồng thất bại
          this.isLoading = false;
          this.deleteTempWorkflow(this.tempWorkflowId);
          this.messageService.error(`${err.error.message}`);
        } else {
          this.isLoading = false;
          // Xóa Workflow vừa tạo mới nếu Tạo hợp đồng thất bại
          this.deleteTempWorkflow(this.tempWorkflowId);
          this.messageService.error(`${err.status}`);
        }
      },
    );
    return promise;
  }
}

export interface AutocompleteOptionGroups {
  title: string;
  href: string;
  count?: number;
  children?: AutocompleteOptionGroups[];
}
