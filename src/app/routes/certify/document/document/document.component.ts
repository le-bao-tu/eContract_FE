import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ACLService } from '@delon/acl';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { environment } from '@env/environment';
import { ButtonModel, GridModel, QueryFilerModel } from '@model';
import { CertifyTypeApiService, DocumentApiService, DocumentBatchApiService, UserHSMAccountApiService, WorkflowApiService } from '@service';
import { BtnCellRenderComponent, DateCellRenderComponent, DeleteModalComponent, StatusNameCellRenderComponent } from '@shared';
import {
  Constants,
  EXCEL_STYLES_DEFAULT,
  LIST_NOTIFY_TYPE,
  LIST_STATUS,
  OVERLAY_LOADING_TEMPLATE,
  OVERLAY_NOROW_TEMPLATE,
  PAGE_SIZE_OPTION_DEFAULT,
  QUERY_FILTER_DEFAULT,
} from '@util';
import moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';
import { UserV2ItemComponent } from 'src/app/routes/user/user-item/user-item-v2.component';
import { WorkflowItemComponent } from 'src/app/routes/workflow-custom/workflow/workflow-item/workflow-item.component';
import { NotifyConfigApiService } from 'src/app/services/api/notify-config-api.service';
import { WorkflowStateApiService } from 'src/app/services/api/workflow-state-api.service';
import { DocumentItemComponent } from '../document-item/document-item.component';
import { DocumentRenewComponent } from '../document-renew/document-renew.component';
import { DocumentSendMailComponent } from '../document-send-mail/document-send-mail.component';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.less'],
})
export class DocumentComponent implements OnInit {
  formDocCancel: any = {
    documentIds: '',
    lastReasonReject: '',
    notifyConfigId: null,
  };

  // formDocSendNotify: any = {
  //   documentId: '',
  //   notifyConfigId: null,
  // };

  formDocSendNotify: FormGroup;
  documentSendNotiId = '';

  emailSend = '';
  checked = false;
  indeterminate = false;
  expandSet = new Set<string>();
  setOfCheckedId = new Set<string>();
  listOfCurrentPageData = [];
  listOfData: any[] = [];
  listSteps: any[] = [];
  item: any;
  certifyType = null;
  isLoading = false;
  currentUserEmail = '';
  listHeaders = [
    {
      name: `${this.i18n.fanyi('function.document.grid.stt')}`,
      code: 'STT',
      width: '60px',
    },
    {
      name: `${this.i18n.fanyi('function.document.grid.ref-code')}`,
      code: 'Document3rdId',
    },
    {
      name: `${this.i18n.fanyi('function.document.grid.code')}`,
      code: 'Code',
    },
    {
      name: `${this.i18n.fanyi('function.document.grid.name')}`,
      code: 'Name',
    },
    {
      name: `${this.i18n.fanyi('function.document.grid.document-type-name')}`,
      code: 'documentTypeName',
    },
    // {
    //   name: `${this.i18n.fanyi('function.document.grid.workflow-state')}`,
    //   code: 'workflowState',
    // },
    // {
    //   name: `${this.i18n.fanyi('function.document.grid.document-status-name')}`,
    //   code: 'documentStatusName',
    // },
    {
      name: `${this.i18n.fanyi('function.document.grid.document-status-state-name')}`,
      code: 'documentStatusStateName',
    },
    {
      name: `${this.i18n.fanyi('function.document.grid.sign-expire-and-close-at-date')}`,
      code: 'signExpireAtDate',
    },
    {
      name: `${this.i18n.fanyi('function.document.grid.action')}`,
      code: 'Action',
    },
    {
      name: '',
      code: 'Action',
    },
  ];

  listHSM: any;
  userId: any = '';

  expandData: any;
  listNotifyType: any[] = LIST_NOTIFY_TYPE.filter((x) => x.value === Constants.LIST_NOTIFY_TYPE_REMIND);

  isVisibleWorkflowItem = false;

  modules = [ClientSideRowModelModule];
  columnDefs: any[] = [];
  defaultColDef: any;
  rowSelection = 'multiple';
  overlayLoadingTemplate = OVERLAY_LOADING_TEMPLATE;
  overlayNoRowsTemplate = OVERLAY_NOROW_TEMPLATE;
  frameworkComponents: any;
  excelStyles: any;
  private gridApi: any;
  private gridColumnApi: any;

  @ViewChild(WorkflowItemComponent, { static: false }) workflowItemModal!: { initData: (arg0: {}, arg1: string, arg2: {}) => void };
  @ViewChild(UserV2ItemComponent, { static: false }) itemUserModal!: {
    initData: (arg0: {}, arg1: string, isCustomer?: boolean, fromDocument?: boolean) => void;
  };
  @ViewChild(DocumentItemComponent, { static: false }) itemModal!: { initData: (arg0: any[], arg1: string) => void };
  @ViewChild(DocumentRenewComponent, { static: false }) itemReloadModal!: { initData: (arg0: any, arg1?: any[]) => void };
  @ViewChild(DocumentSendMailComponent, { static: false }) itemSendMailModal!: { initData: (arg0: any[], arg1: string) => void };
  @ViewChild(DeleteModalComponent, { static: false }) deleteModal!: {
    initData: (arg0: any, arg1: string) => void;
    updateIsLoading: (arg0: boolean) => void;
    updateData: (arg0: undefined) => void;
  };

  constructor(
    private route: ActivatedRoute,
    private documentApiService: DocumentApiService,
    private aclService: ACLService,
    private notification: NzNotificationService,
    private elementRef: ElementRef,
    private messageService: NzMessageService,
    private activatedRoute: ActivatedRoute,
    private modalService: NzModalService,
    private certifyTypeService: CertifyTypeApiService,
    private documentBatchApiService: DocumentBatchApiService,
    private workflowStateApiService: WorkflowStateApiService,
    private userHSMAccountService: UserHSMAccountApiService,
    private notifyConfigApiService: NotifyConfigApiService,
    private workflowService: WorkflowApiService,
    private modalConfirm: NzModalService,
    private fb: FormBuilder,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {
    this.currentUserEmail = this.tokenService.get()?.email;
    this.userId = this.tokenService.get()?.id;
    this.filter.currentUserEmail = this.currentUserEmail;

    this.formDocSendNotify = fb.group({
      notifyConfigId: [null, [Validators.required]],
    });

    //#region Init button
    this.btnStatusAll = {
      title: 'Tất cả',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-status-all.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.filter.isDeleted = false;
        this.filter.isClosed = false;
        this.switchHeaderTable(null);
        this.onResetSearch(true);
      },
    };
    this.btnStatusDraft = {
      title: 'Đang soạn thảo',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-status-draft.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.filter.status = 0;
        this.filter.assignMe = false;
        this.filter.isSignExpireAtDate = false;
        this.filter.isIncommingSignExpirationDate = false;
        this.filter.isDeleted = false;
        this.filter.isClosed = false;
        this.switchHeaderTable(this.filter.status);
        this.onClearFilter();
        this.initGridData();
      },
    };
    this.btnStatusWaitMeSign = {
      title: 'Chờ tôi ký',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-status-wait-mesign.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.filter.status = 1;
        this.filter.assignMe = true;
        this.filter.isSignExpireAtDate = false;
        this.filter.isIncommingSignExpirationDate = false;
        this.filter.isDeleted = false;
        this.filter.isClosed = false;
        this.switchHeaderTable(this.filter.status);
        this.onClearFilter();
        this.initGridData();
      },
    };
    this.btnStatusProcessing = {
      title: 'Đang xử lý',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-status-processing.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.filter.status = 1;
        this.filter.assignMe = false;
        this.filter.isSignExpireAtDate = false;
        this.filter.isIncommingSignExpirationDate = false;
        this.filter.isDeleted = false;
        this.filter.isClosed = false;
        this.switchHeaderTable(this.filter.status);
        this.onClearFilter();
        this.initGridData();
      },
    };
    this.btnStatusCancel = {
      title: 'Đã từ chối',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-status-cancel.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.filter.status = 2;
        this.filter.assignMe = false;
        this.filter.isSignExpireAtDate = false;
        this.filter.isIncommingSignExpirationDate = false;
        this.filter.isDeleted = false;
        this.filter.isClosed = false;
        this.switchHeaderTable(this.filter.status);
        this.onClearFilter();
        this.initGridData();
      },
    };
    this.btnStatusComplete = {
      title: 'Đã hoàn thành',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-status-complete.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.filter.status = 3;
        this.filter.assignMe = false;
        this.filter.isSignExpireAtDate = false;
        this.filter.isIncommingSignExpirationDate = false;
        this.filter.isDeleted = false;
        this.filter.isClosed = false;
        this.switchHeaderTable(this.filter.status);
        this.onClearFilter();
        this.initGridData();
      },
    };
    this.btnStatusSignExpiredAtDate = {
      title: 'Hết hạn ký',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-status-sign-expired-at-date.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.filter.isSignExpireAtDate = true;
        this.filter.assignMe = false;
        this.filter.isIncommingSignExpirationDate = false;
        this.filter.isDeleted = false;
        this.filter.isClosed = false;
        this.switchHeaderTable(this.filter.status);
        this.onClearFilter();
        this.initGridData();
      },
    };
    this.btnStatusIncommingSignExpirationAtDate = {
      title: 'Sắp hết hạn ký',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-status-incomming-sign-expiration-at-date.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.filter.isIncommingSignExpirationDate = true;
        this.filter.assignMe = false;
        this.filter.isSignExpireAtDate = false;
        this.filter.status = null;
        this.filter.isDeleted = false;
        this.filter.isClosed = false;
        this.switchHeaderTable(1);
        this.onClearFilter();
        this.initGridData();
      },
    };
    this.btnStatusIsDeleted = {
      title: 'Đã xóa',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-status-is-deleted.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.filter.isIncommingSignExpirationDate = false;
        this.filter.assignMe = false;
        this.filter.isSignExpireAtDate = false;
        this.filter.status = null;
        this.filter.isDeleted = true;
        this.filter.isClosed = false;
        this.switchHeaderTable(2);
        this.onClearFilter();
        this.initGridData();
      },
    };
    this.btnStatusIsClosed = {
      title: 'Đã đóng',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-status-is-closed.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.filter.isIncommingSignExpirationDate = false;
        this.filter.assignMe = false;
        this.filter.isSignExpireAtDate = false;
        this.filter.status = null;
        this.filter.isDeleted = false;
        this.filter.isClosed = true;
        this.switchHeaderTable(2);
        this.onClearFilter();
        this.initGridData();
      },
    };
    this.btnHeaderSendEmail = {
      title: 'GỬI KẾT QUẢ',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-header-send-email.label')}`,
      visible: false,
      enable: true,
      grandAccess: true,
      click: (data: any) => {
        const dt: any[] = [];
        this.setOfCheckedId.forEach((element) => {
          dt.push(element);
        });

        const title = '100000000000';
        this.itemSendMailModal.initData(dt, title);
      },
    };
    this.btnHeaderSendToWF = {
      title: 'TRÌNH DUYỆT',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-header-sendtowf.label')}`,
      visible: false,
      enable: true,
      grandAccess: true,
      click: (data: any) => {
        const dt: any[] = [];
        this.setOfCheckedId.forEach((element) => {
          dt.push(element);
        });
        console.log(dt);
        this.itemModal.initData(dt, 'info');
      },
    };
    this.btnHeaderReject = {
      title: 'TỪ CHỐI',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-header-reject.label')}`,
      visible: false,
      enable: true,
      grandAccess: true,
      click: (data: any) => {
        const dt: any[] = [];
        this.setOfCheckedId.forEach((element) => {
          dt.push(element);
        });
        console.log(dt);
        this.itemModal.initData(dt, 'info');
      },
    };
    this.btnSignHeader = {
      title: 'KÝ',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-sign-header.label')}`,
      visible: false,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        const dt: any[] = [];
        this.setOfCheckedId.forEach((element) => {
          dt.push(element);
        });
        console.log(dt);
        this.itemModal.initData(dt, 'info');
      },
    };
    this.btnSign = {
      title: 'KÝ',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-sign-grid.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: (event: any) => {
        this.itemModal.initData([event.id], 'info');
      },
    };
    this.btnSignUsbHeader = {
      title: 'KÝ USB TOKEN',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-sign-usb-header.label')}`,
      visible: false,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        const dt: any[] = [];
        this.setOfCheckedId.forEach((element) => {
          dt.push(element);
        });
        this.itemModal.initData(dt, 'info');
      },
    };
    this.btnHeaderSignAuthentication = {
      title: 'KÝ CHỨNG THỰC',
      titlei18n: '',
      visible: false,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        const dt: any[] = [];
        this.setOfCheckedId.forEach((element) => {
          dt.push(element);
        });
        this.itemModal.initData(dt, 'info');
      },
    };
    this.btnHeaderSignApproval = {
      title: 'KÝ PHÊ DUYỆT',
      titlei18n: '',
      visible: false,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        const dt: any[] = [];
        this.setOfCheckedId.forEach((element) => {
          dt.push(element);
        });
        this.itemModal.initData(dt, 'info');
      },
    };

    this.btnApprove = {
      title: 'DUYỆT',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: (item: any) => {
        this.itemModal.initData([item.id], 'info');
      },
    };
    this.btnSearch = {
      title: 'Tìm kiếm',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-search.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.initGridData();
      },
    };
    this.btnResetSearch = {
      title: 'Tải lại',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-reload.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.onResetSearch(false);
      },
    };

    this.btnItemPrint = {
      title: 'In',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: async (data: any) => {
        await this.getDocumentDetailById(data.id);
        this.item.documentFile.forEach((element: any) => {
          this.goToLink(environment.API_URL + element.filePath);
        });
      },
    };
    this.btnItemSendEmail = {
      title: 'Gửi email',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: (data: any) => {
        this.itemSendMailModal.initData([data.id], 'send-mail');
      },
    };

    this.btnItemSendNotify = {
      title: 'Gửi thông báo',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: (data: any) => {
        this.isShowFormSendNoti = true;
        // this.showConfirm(data);
        this.formDocSendNotify.reset();
        this.documentSendNotiId = data.id;
      },
    };

    this.btnItemRenew = {
      title: `${this.i18n.fanyi('layout.button.btn-item-renew.label')}`,
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: (data: any) => {
        this.itemReloadModal.initData(data);
      },
    };

    this.btnItemCancel = {
      title: 'Từ chối/Hủy hợp đồng',
      titlei18n: '',
      visible: true,
      enable: false,
      grandAccess: true,
      click: (data: any) => {
        this.showFormCanel([data.id]);
      },
    };

    this.btnItemSendToWF = {
      title: 'Trình duyệt',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: (data: any) => {
        this.sendToWFListItem([data.id]);
      },
    };
    this.btnItemDownload = {
      title: 'Tải xuống',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: async (data: any) => {
        await this.getDocumentDetailById(data.id);
        console.log(this.item);
        this.item.documentFile.forEach((element: any) => {
          console.log(element.filePath);
          this.goToLink(environment.API_URL + element.filePath);
        });
      },
    };
    this.btnItemDelete = {
      title: 'Xóa',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: (item: any) => {
        console.log('Delete: ' + item.id);
        const dt = { ...item, name: item.code + ' - ' + item.name };
        this.onDeleteItem(dt);
      },
    };

    this.btnItemActionViewDetail = {
      title: 'XEM CHI TIẾT',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-item-action-view-detail.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: async (data: any) => {
        this.itemModal.initData([data.id], 'info');
      },
    };
    this.btnItemActionSignAuthentication = {
      title: 'KÝ CHỨNG THỰC',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: async (data: any) => {
        this.itemModal.initData([data.id], 'ky-chung-thuc');
      },
    };
    this.btnItemActionSignApprove = {
      title: 'KÝ PHÊ DUYỆT',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: async (data: any) => {
        this.itemModal.initData([data.id], 'ky-phe-duyet');
      },
    };
    this.btnSignHSMHeader = {
      title: 'KÝ HSM',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-sign-hsm-header.label')}`,
      visible: false,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        const dt: any[] = [];
        this.setOfCheckedId.forEach((element) => {
          dt.push(element);
        });
        this.itemModal.initData(dt, 'info');
      },
    };
    this.btnSignADSSHeader = {
      title: 'KÝ ADSS',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-sign-adss-header.label')}`,
      visible: false,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        const dt: any[] = [];
        this.setOfCheckedId.forEach((element) => {
          dt.push(element);
        });
        this.itemModal.initData(dt, 'info');
      },
    };
    this.btnApprovalHeader = {
      title: 'DUYỆT',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-approval-header.label')}`,
      visible: false,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        const dt: any[] = [];
        this.setOfCheckedId.forEach((element) => {
          dt.push(element);
        });
        this.itemModal.initData(dt, 'info');
      },
    };
    this.btnRenewHeader = {
      title: 'Renew',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-renew-header.label')}`,
      visible: false,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        const dt: any[] = [];
        this.setOfCheckedId.forEach((element) => {
          dt.push(element);
        });
        this.itemReloadModal.initData(undefined, dt);
      },
    };
    this.btnCancelHeader = {
      title: 'HỦY',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-cancel-header.label')}`,
      visible: false,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        const dt: any[] = [];
        this.setOfCheckedId.forEach((element) => {
          dt.push(element);
        });
        this.showFormCanel(dt);
      },
    };
    this.btnExportExcel = {
      title: 'Export excel',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-exportexcel.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      isLoading: false,
      click: async ($event: any) => {
        await this.onExportExcel();
      },
    };
    //#endregion Init button
    // #region init ag-grid
    this.columnDefs = [
      {
        field: 'index',
        headerName: `${this.i18n.fanyi('layout.grid.index')}`,
        width: 110,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
      },
      { field: 'document3rdId', headerName: `${this.i18n.fanyi('function.document.grid.ref-code')}`, minWidth: 180, flex: 1 },
      {
        field: 'code',
        headerName: `${this.i18n.fanyi('function.document.grid.code')}`,
        sortable: true,
        filter: true,
        minWidth: 180,
        flex: 1,
      },
      {
        field: 'name',
        headerName: `${this.i18n.fanyi('function.document.grid.name')}`,
        minWidth: 150,
      },
      {
        field: 'userFullName',
        headerName: `${this.i18n.fanyi('function.document.grid.user-name')}`,
        minWidth: 150,
      },
      {
        field: 'organizationName',
        headerName: `${this.i18n.fanyi('function.document.grid.organization')}`,
        minWidth: 150,
      },
      {
        field: 'documentTypeName',
        headerName: `${this.i18n.fanyi('function.document.grid.document-type-name')}`,
        minWidth: 150,
      },
      {
        field: 'documentStatusNameAgGrid',
        headerName: `${this.i18n.fanyi('function.document.grid.document-status-name')}`,
        minWidth: 150,
      },
      {
        field: 'documentStatusStateNameAgGrid',
        headerName: `${this.i18n.fanyi('function.document.grid.document-status-state-name')}`,
        minWidth: 150,
      },
      {
        field: 'lastReasonReject',
        headerName: `${this.i18n.fanyi('function.document.grid.last-reason-reject')}`,
        minWidth: 150,
      },
      {
        field: 'signExpireAtDateAgGrid',
        headerName: `${this.i18n.fanyi('function.document.renew-item.expired-date.label')}`,
        minWidth: 150,
      },
      {
        field: 'signCloseAtDateAgGrid',
        headerName: `${this.i18n.fanyi('function.document.grid.sign-close-at-date')}`,
        minWidth: 150,
      },
      {
        field: 'createdDateAgGrid',
        headerName: `${this.i18n.fanyi('function.document.grid.created-date')}`,
        minWidth: 150,
      },
      {
        field: 'createdUserName',
        headerName: `${this.i18n.fanyi('function.document.grid.create-username')}`,
        minWidth: 150,
      },
    ];

    this.defaultColDef = {
      // flex: 1,
      minWidth: 100,
      resizable: true,
    };
    this.frameworkComponents = {};
    this.excelStyles = [...EXCEL_STYLES_DEFAULT];
    // #endregion
  }

  sub: any;
  listCertifyType: any[] = [];
  listDocumentBatch: any[] = [];
  listWorkflowState: any[] = [];
  listStatus = LIST_STATUS;
  filter: QueryFilerModel = {
    ...QUERY_FILTER_DEFAULT,
    pageSize: 10,
    status: null,
    assignMe: false,
    documentBatchId: null,
    documentTypeId: null,
    stateId: null,
    userName: null,
  };
  pageSizeOptions: any[] = [];
  date: any;
  dateSign: any;
  grid: GridModel = {
    dataCount: 0,
    rowData: [],
    totalData: 0,
  };

  btnStatusAll: ButtonModel;
  btnStatusDraft: ButtonModel;
  btnStatusWaitMeSign: ButtonModel;
  btnStatusProcessing: ButtonModel;
  btnStatusCancel: ButtonModel;
  btnStatusComplete: ButtonModel;
  btnStatusSignExpiredAtDate: ButtonModel;
  btnStatusIsClosed: ButtonModel;

  btnHeaderSendToWF: ButtonModel;
  btnHeaderReject: ButtonModel;
  btnHeaderSendEmail: ButtonModel;
  btnHeaderSignAuthentication: ButtonModel;
  btnHeaderSignApproval: ButtonModel;
  btnSignHeader: ButtonModel;
  btnSign: ButtonModel;
  btnSignUsbHeader: ButtonModel;
  btnApprove: ButtonModel;
  btnResetSearch: ButtonModel;
  btnSearch: ButtonModel;

  btnItemPrint: ButtonModel;
  btnItemSendToWF: ButtonModel;
  btnItemSendEmail: ButtonModel;
  btnItemSendNotify: ButtonModel;
  btnItemRenew: ButtonModel;
  btnItemCancel: ButtonModel;
  btnItemDownload: ButtonModel;
  btnItemDelete: ButtonModel;

  btnItemActionViewDetail: ButtonModel;
  btnItemActionSignAuthentication: ButtonModel;
  btnItemActionSignApprove: ButtonModel;
  btnStatusIncommingSignExpirationAtDate: ButtonModel;
  btnStatusIsDeleted: ButtonModel;

  btnSignHSMHeader: ButtonModel;
  btnSignADSSHeader: ButtonModel;
  btnApprovalHeader: ButtonModel;
  btnRenewHeader: ButtonModel;
  btnCancelHeader: ButtonModel;
  btnExportExcel: ButtonModel;

  isLoadingDelete = false;
  isShowDelete = false;
  isShowImport = false;
  isShowFormCancel = false;
  isShowFormSendNoti = false;

  tittle = `${this.i18n.fanyi('function.document.title')}`;
  moduleName = 'Danh sách hợp đồng';

  modal: any = {
    type: '',
    item: {},
    isShow: false,
    option: {},
  };
  paramStatus: any;

  listNotifyConfig: any[] = [];

  userModal: any = {
    type: '',
    item: {},
    isShow: false,
    option: {},
  };

  ngOnInit(): void {
    // tslint:disable-next-line: deprecation
    this.route.queryParams.subscribe((params) => {
      // tslint:disable-next-line:radix
      this.filter.status = parseInt(params.status);
      this.switchHeaderTable(this.filter.status);
      this.filter.assignMe = params.assignMe === 'true';
      if (params.incommingExpiredFilter === 'true') {
        this.filter.isIncommingSignExpirationDate = true;
        this.filter.assignMe = false;
        this.filter.isSignExpireAtDate = false;
        this.filter.status = null;
      }

      if (params.days) {
        this.filter.ShowAdSearch = true;

        if (this.filter.status === 3) {
          const days = parseInt(params.days);
          this.filter.signStartDate = new Date(new Date().setDate(new Date().getDate() - days + 1));
          this.filter.signEndDate = new Date();

          this.dateSign = [];
          this.dateSign.push(this.filter.signStartDate, this.filter.signEndDate);
        } else {
          const days = parseInt(params.days);
          this.filter.startDate = new Date(new Date().setDate(new Date().getDate()));
          this.filter.endDate = new Date(new Date().setDate(new Date().getDate() + (days - 1)));

          this.date = [];
          this.date.push(this.filter.startDate, this.filter.endDate);
        }
      }

      if (params.expiredFilter === 'true') {
        this.filter.isSignExpireAtDate = true;
        this.filter.assignMe = false;
        this.filter.isIncommingSignExpirationDate = false;
      }
    });
    this.initGridData();
    this.initRightOfUser();
    this.fecthListCertifyType();
    this.initListWorkflowState();
    this.getHSMAccount();
    this.getListNotifyConfig();
  }

  getListNotifyConfig() {
    this.notifyConfigApiService.getListCombobox().subscribe(
      (res: any) => {
        if (res.code !== 200) {
          this.messageService.error(`${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.messageService.error(`${res.message}`);
          return;
        }

        this.listNotifyConfig = res.data.filter((x: any) => this.listNotifyType.map((x1) => x1.value).includes(x.notifyType));
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

  switchHeaderTable(status: any): any {
    if (status === 2) {
      this.listHeaders = [
        {
          name: `${this.i18n.fanyi('function.document.grid.stt')}`,
          code: 'STT',
          width: '60px',
        },
        {
          name: `${this.i18n.fanyi('function.document.grid.ref-code')}`,
          code: 'Document3rdId',
        },
        {
          name: `${this.i18n.fanyi('function.document.grid.code')}`,
          code: 'Code',
        },
        {
          name: `${this.i18n.fanyi('function.document.grid.name')}`,
          code: 'Name',
        },
        {
          name: `${this.i18n.fanyi('function.document.grid.document-type-name')}`,
          code: 'documentTypeName',
        },
        // {
        //   name: `${this.i18n.fanyi('function.document.grid.workflow-state')}`,
        //   code: 'workflowState',
        // },
        // {
        //   name: `${this.i18n.fanyi('function.document.grid.document-status-name')}`,
        //   code: 'documentStatusName',
        // },
        {
          name: `${this.i18n.fanyi('function.document.grid.document-status-state-name')}`,
          code: 'documentStatusStateName',
        },
        {
          name: `${this.i18n.fanyi('function.document.grid.last-reason-reject')}`,
          code: 'lastReasonReject',
        },
        {
          name: `${this.i18n.fanyi('function.document.grid.sign-expire-and-close-at-date')}`,
          code: 'signExpireAtDate',
        },
        {
          name: `${this.i18n.fanyi('function.document.grid.action')}`,
          code: 'Action',
        },
        {
          name: '',
          code: 'Action',
        },
      ];
    } else {
      this.listHeaders = [
        {
          name: `${this.i18n.fanyi('function.document.grid.stt')}`,
          code: 'STT',
          width: '60px',
        },
        {
          name: `${this.i18n.fanyi('function.document.grid.ref-code')}`,
          code: 'Document3rdId',
        },
        {
          name: `${this.i18n.fanyi('function.document.grid.code')}`,
          code: 'Code',
        },
        {
          name: `${this.i18n.fanyi('function.document.grid.name')}`,
          code: 'Name',
        },
        {
          name: `${this.i18n.fanyi('function.document.grid.document-type-name')}`,
          code: 'documentTypeName',
        },
        // {
        //   name: `${this.i18n.fanyi('function.document.grid.workflow-state')}`,
        //   code: 'workflowState',
        // },
        // {
        //   name: `${this.i18n.fanyi('function.document.grid.document-status-name')}`,
        //   code: 'documentStatusName',
        // },
        {
          name: `${this.i18n.fanyi('function.document.grid.document-status-state-name')}`,
          code: 'documentStatusStateName',
        },
        {
          name: `${this.i18n.fanyi('function.document.grid.sign-expire-and-close-at-date')}`,
          code: 'signExpireAtDate',
        },
        {
          name: `${this.i18n.fanyi('function.document.grid.action')}`,
          code: 'Action',
        },
        {
          name: '',
          code: 'Action',
        },
      ];
    }
  }

  goToLink(url: string): void {
    window.open(url, '_blank');
  }

  // showConfirm(obj: any): void {
  //   this.modalConfirm.confirm({
  //     nzTitle: `<i>${this.i18n.fanyi('function.document.modal-showconfirm.header')}</i>`,
  //     nzContent: `<b>${this.i18n.fanyi('function.document.modal-showconfirm.body')} ${obj.nextStepUserName}</b>`,
  //     nzOnOk: () => this.sendMailToUserSign(obj.id),
  //   });
  // }

  showFormCanel(listId: any[]): void {
    this.isShowFormCancel = true;
    this.formDocCancel = {
      documentIds: listId,
      lastReasonReject: '',
      notifyConfigId: null,
    };
  }

  onCloseFormSendNotify() {
    this.isShowFormSendNoti = false;
  }

  sendMailToUserSign(): Subscription | undefined {
    this.isLoading = true;

    if (!this.formDocSendNotify.valid) {
      this.isLoading = false;
      this.formDocSendNotify.controls.notifyConfigId.markAsDirty();
      this.formDocSendNotify.controls.notifyConfigId.updateValueAndValidity();
      return;
    }

    const model = {
      id: this.documentSendNotiId,
      notifyConfigId: this.formDocSendNotify.controls.notifyConfigId.value,
    };
    const rs = this.documentApiService.sendMailToUserSign(model).subscribe(
      (res: any) => {
        // this.gridApi.hideOverlay();
        if (res.code !== 200) {
          this.notification.error(`${this.i18n.fanyi('layout-modal.delete.message.many')}`, `${res.message}`);
          return;
        }
        this.notification.success(
          `${this.i18n.fanyi('function.document.modal-item.notify-notify-success-title')}`,
          `${this.i18n.fanyi('function.document.modal-item.notify-notify-success-body')}`,
        );
        this.isLoading = false;
        this.isShowFormSendNoti = false;
      },
      (err: any) => {
        this.isLoading = false;
        // this.gridApi.hideOverlay();
        console.log(err);
      },
    );
    return rs;
  }

  initRightOfUser(): void {
    this.btnSignHeader.grandAccess = this.aclService.canAbility('DOCUMENT-SIGN-NORMAL');
    this.btnHeaderSendToWF.grandAccess = this.aclService.canAbility('DOCUMENT-REQUEST-APPROVE');
    this.btnItemSendToWF.grandAccess = this.aclService.canAbility('DOCUMENT-REQUEST-APPROVE');
    this.btnHeaderReject.grandAccess = this.aclService.canAbility('DOCUMENT-REJECT');
    this.btnApprovalHeader.grandAccess = this.aclService.canAbility('DOCUMENT-APPROVE');
    this.btnApprove.grandAccess = this.aclService.canAbility('DOCUMENT-APPROVE');
    this.btnSignHSMHeader.grandAccess = this.aclService.canAbility('DOCUMENT-SIGN-HSM');
    this.btnSignADSSHeader.grandAccess = this.aclService.canAbility('DOCUMENT-SIGN-ADSS');
    this.btnRenewHeader.grandAccess = this.aclService.canAbility('DOCUMENT-RENEW');
    this.btnItemRenew.grandAccess = this.aclService.canAbility('DOCUMENT-RENEW');
    this.btnItemSendNotify.grandAccess = this.aclService.canAbility('DOCUMENT-SEND-NOTIFY');
    this.btnSign.grandAccess =
      this.aclService.canAbility('DOCUMENT-SIGN-NORMAL') ||
      this.aclService.canAbility('DOCUMENT-SIGN-HSM') ||
      this.aclService.canAbility('DOCUMENT-SIGN-ADSS');
    this.btnItemActionSignAuthentication.grandAccess = this.aclService.canAbility('DOCUMENT-SIGN-AUTHENTICATION');
    this.btnItemActionSignApprove.grandAccess = this.aclService.canAbility('DOCUMENT-SIGN-APPROVE');
    this.btnExportExcel.grandAccess = this.aclService.canAbility('DOCUMENT-EXPORT_EXCEL');
  }
  onPageSizeChange(): void {
    this.initGridData();
  }

  onPageNumberChange(): void {
    this.initGridData();
  }
  //#endregion Ag-grid

  //#region Modal
  onDeleteItem(item: any = null): void {
    console.log(item);
    let selectedRows = [];
    if (item !== null) {
      selectedRows = [];
      selectedRows.push(item);
    }
    const tittle = 'Xác nhận xóa';
    let content = '';
    if (selectedRows.length > 1) {
      // content = 'Bạn có chắc chắn muốn xóa các hợp đồng này không?';
      content = `${this.i18n.fanyi('layout-modal.delete.message.many')}`;
    } else {
      // content = 'Bạn có chắc chắn muốn xóa hợp đồng này không?';
      content = `${this.i18n.fanyi('layout-modal.delete.message.one')}`;
    }
    this.isShowDelete = true;
    this.deleteModal.initData(selectedRows, content);
  }

  onModalEventEmmit(event: any): void {
    this.modal.isShow = false;
    if (event.type === 'success' || event.type === 'close') {
      this.initGridData();
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

  onViewItem(item: any = null): void {
    if (item === null) {
      // const selectedRows = this.gridApi.getSelectedRows();
      // item = selectedRows[0];
    }
    this.modal = {
      type: 'info',
      item,
      isShow: true,
      option: {},
    };
  }

  //#endregion Modal

  //#region Event
  onUpdateStatusTocancel(): Subscription | undefined {
    const rs = this.documentApiService.updateStatusTocancel(this.formDocCancel).subscribe(
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
        this.messageService.success(`${res.message}`);
        this.initGridData();
        this.onClose();
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
    return rs;
  }

  onClose(): void {
    this.isShowFormCancel = false;
    this.formDocCancel = {};
  }

  onChange(result: Date[]): void {
    this.filter.startDate = moment(result[0]).format('YYYY-MM-DD');
    this.filter.endDate = moment(result[1]).format('YYYY-MM-DD');
    this.initGridData();
  }

  onChangeDateSign(result: Date[]): void {
    this.filter.signStartDate = moment(result[0]).format('YYYY-MM-DD');
    this.filter.signEndDate = moment(result[1]).format('YYYY-MM-DD');
    this.initGridData();
  }

  updateCheckedSet(id: any, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onExpandChange(data: any, checked: boolean): void {
    if (checked) {
      this.expandSet.add(data.id);
      this.expandData = data;
    } else {
      this.expandSet.delete(data.id);
      this.expandData = null;
    }
  }
  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData.filter(({ disabled }) => !disabled).forEach(({ id }) => this.updateCheckedSet(id, checked));
    this.refreshCheckedStatus();
  }
  onCurrentPageDataChange(listOfCurrentPageData: any): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }

  onDocumentTypeChange(event: any): any {
    this.filter.documentTypeId = event;
    this.initGridData();
  }

  onDocumentBatchChange(event: any): any {
    this.filter.documentBatchId = event;
    this.initGridData();
  }

  onWorkflowStateChange(event: any): any {
    // this.filter.stateId = event;
    if (event === null || event === undefined) {
      this.filter.stateId = null;
      this.filter.status = null;
    }

    const item = {};
    this.listWorkflowState.forEach((element) => {
      if (element.id === event) {
        this.filter.stateId = element.realId;
        this.filter.status = element.documentStatus;
      }
    });

    this.filter.isIncommingSignExpirationDate = false;
    this.filter.isDeleted = false;
    this.filter.isClosed = false;
    this.initGridData();
  }

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData.filter(({ disabled }) => !disabled);
    if (listOfEnabledData.length === 0) {
      this.checked = false;
    } else {
      this.checked = listOfEnabledData.every(({ id }) => this.setOfCheckedId.has(id));
    }
    this.indeterminate = listOfEnabledData.some(({ id }) => this.setOfCheckedId.has(id)) && !this.checked;
    this.checkShowHeaderButton();
  }

  onItemChecked(id: any, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  showConfirmSignApprove(): void {
    this.modalService.confirm({
      nzTitle: 'Xác nhận ký nhiều hợp đồng?',
      nzContent: '',
      nzOkText: 'OK',
      nzCancelText: 'Đóng',
      nzOnOk: () => {
        const dt: any[] = [];
        this.setOfCheckedId.forEach((element) => {
          dt.push(element);
        });
        this.processingWorkflow(dt);
      },
    });
  }

  onResetSearch(reloadData: boolean): void {
    this.filter.startDate = null;
    this.filter.endDate = null;
    this.filter.textSearch = '';
    this.filter.referenceCode = '';
    this.filter.pageNumber = 1;
    this.filter.status = null;
    this.filter.assignMe = false;
    this.filter.isSignExpireAtDate = false;
    this.filter.documentBatchId = null;
    this.filter.documentTypeId = null;
    this.filter.isIncommingSignExpirationDate = false;
    this.filter.userName = '';
    this.filter.stateId = null;
    this.filter.stateId_display = null;
    this.date = null;
    this.dateSign = null;
    this.filter.isDeleted = false;
    this.filter.isClosed = false;

    this.filter.signStartDate = null;
    this.filter.signEndDate = null;
    this.filter.startDate = null;
    this.filter.endDate = null;
    this.initGridData();
  }

  onClearFilter() {
    this.filter.textSearch = '';
    this.filter.documentTypeId = null;
    this.filter.stateId_display = null;
    this.date = null;
    this.dateSign = null;
    this.filter.userName = '';
    this.filter.referenceCode = '';
    this.filter.pageNumber = 1;
    this.filter.startDate = null;
    this.filter.endDate = null;
    this.filter.signStartDate = null;
    this.filter.signEndDate = null;
  }
  //#endregion Event

  checkShowHeaderButton(): any {
    this.checkShowButtonSendToWF();
    this.checkShowButtonReject();
    this.checkShowButtonSendMail();
    this.checkShowButtonSignApproval();
    this.checkShowButtonSignAuthentication();
    this.checkShowButtonSign();
    this.checkShowButtonSignUsb();
    this.checkShowButtonSignHSM();
    this.checkShowButtonSignADSS();
    this.checkShowButtonApprovalHeader();
    this.checkShowButtonRenewHeader();
    this.checkShowButtonCancelHeader();
  }

  checkShowButtonCancelHeader() {
    let check = true;
    let checkExistItem = false;
    this.listOfData.forEach((item: any) => {
      if (this.setOfCheckedId.has(item.id)) {
        checkExistItem = true;
        if (
          !(item.documentStatus === 0 || item.documentStatus === 1) ||
          (item.documentStatus === 1 && item.isSignExpireAtDate) ||
          item.isDeleted ||
          item.isCloseDocument
        ) {
          check = false;
        }
      }
    });

    this.btnCancelHeader.visible = check && checkExistItem;
  }

  checkShowButtonRenewHeader() {
    let check = true;
    let checkExistItem = false;
    this.listOfData.forEach((item: any) => {
      if (this.setOfCheckedId.has(item.id)) {
        checkExistItem = true;
        if ((item.documentStatus !== 2 && !item.isSignExpireAtDate) || item.isDeleted || item.isCloseDocument || !item.isAllowRenew) {
          check = false;
        }
      }
    });

    this.btnRenewHeader.visible = check && checkExistItem;
  }

  checkShowButtonApprovalHeader() {
    let check = true;
    let checkExistItem = false;
    this.listOfData.forEach((item: any) => {
      if (this.setOfCheckedId.has(item.id)) {
        checkExistItem = true;
        if (
          item.documentStatus !== 1 ||
          item.nextStepSignType !== 6 ||
          item.isSignExpireAtDate ||
          item.isDeleted ||
          !item.isSign ||
          item.isCloseDocument
        ) {
          check = false;
        }
      }
    });

    this.btnApprovalHeader.visible = check && checkExistItem;
  }

  checkShowButtonSignHSM() {
    let check = true;
    let checkExistItem = false;
    this.listOfData.forEach((item: any) => {
      if (this.setOfCheckedId.has(item.id)) {
        checkExistItem = true;
        const document = this.listOfData.find((x) => x.id === item.id);
        if (
          document.documentStatus !== 1 ||
          (document.nextStepSignType !== 4 && document.nextStepSignType !== 8 && document.nextStepSignType !== 9) ||
          !document.isSign ||
          this.listHSM.length < 1 ||
          !this.listHSM.find((x: any) => x.accountType === Constants.ACCOUNT_TYPE_HSM) ||
          document.isCloseDocument
        ) {
          check = false;
        }
      }
    });

    this.btnSignHSMHeader.visible = check && checkExistItem;
  }

  checkShowButtonSignADSS() {
    let check = true;
    let checkExistItem = false;
    const listId: string[] = [];
    this.listOfData.forEach((item: any) => {
      if (this.setOfCheckedId.has(item.id)) {
        listId.push(item.id);
        checkExistItem = true;
        if (
          item.documentStatus !== 1 ||
          (item.nextStepSignType !== 7 && item.nextStepSignType !== 9) ||
          !item.isSign ||
          !this.listHSM.find((x: any) => x.accountType === Constants.ACCOUNT_TYPE_ADSS) ||
          item.isCloseDocument
        ) {
          check = false;
        }

        this.documentApiService.getByListId(listId).subscribe(
          (res: any) => {
            if (!res.data[0].adssProfileName && (res.data[0].signType === 7 || res.data[0].signType === 9)) {
              check = false;
              this.btnSignADSSHeader.visible = check && checkExistItem;
            }
          },
          (err: any) => console.log(err),
        );
      }
    });

    this.btnSignADSSHeader.visible = check && checkExistItem;
  }

  checkShowButtonSendMail(): any {
    let check = true;
    let checkExistItem = false;
    if (this.setOfCheckedId.size === 0) {
      check = false;
    } else {
      this.setOfCheckedId.forEach((element) => {
        if (this.listOfData.some((x) => x.id === element)) {
          checkExistItem = true;
        }
        if (this.listOfData.some((x) => x.id === element && x.documentStatus !== 3)) {
          check = false;
        }
        if (this.listOfData.some((x) => x.isCloseDocument)) {
          check = false;
        }
      });
    }

    this.btnHeaderSendEmail.visible = check && checkExistItem;
  }

  checkShowButtonSendToWF(): any {
    let check = true;
    let checkExistItem = false;
    if (this.setOfCheckedId.size === 0) {
      check = false;
    } else {
      this.setOfCheckedId.forEach((element) => {
        if (this.listOfData.some((x) => x.id === element)) {
          checkExistItem = true;
        }
        if (this.listOfData.some((x) => x.id === element && x.documentStatus !== 0)) {
          check = false;
        }
        if (this.listOfData.some((x) => x.isDeleted || x.isCloseDocument)) {
          check = false;
        }
      });
    }

    this.btnHeaderSendToWF.visible = check && checkExistItem;
  }

  checkShowButtonSignApproval(): any {
    let check = true;
    let checkExistItem = false;

    this.listOfData.forEach((item: any) => {
      if (this.setOfCheckedId.has(item.id)) {
        checkExistItem = true;
        if (item.documentStatus === 1 && item.isSign) {
          if (item.nextStepSignType !== 2) {
            check = false;
          }
        } else {
          check = false;
        }
        if (this.listOfData.some((x) => x.isCloseDocument)) {
          check = false;
        }
      }
    });
    // }

    this.btnHeaderSignApproval.visible = check && checkExistItem;
  }
  checkShowButtonSignAuthentication(): any {
    let check = true;
    let checkExistItem = false;
    this.listOfData.forEach((item: any) => {
      if (this.setOfCheckedId.has(item.id)) {
        checkExistItem = true;
        if (item.documentStatus === 1 && item.isSign) {
          if (item.nextStepSignType !== 1) {
            check = false;
          }
        } else {
          check = false;
        }
        if (this.listOfData.some((x) => x.isCloseDocument)) {
          check = false;
        }
      }
    });

    this.btnHeaderSignAuthentication.visible = check && checkExistItem;
  }
  checkShowButtonSign(): any {
    let check = true;
    let checkExistItem = false;
    this.listOfData.forEach((item: any) => {
      if (this.setOfCheckedId.has(item.id)) {
        checkExistItem = true;
        if (
          this.listOfData.some(
            (x) => x.id === item.id && (x.documentStatus !== 1 || (x.nextStepSignType !== 4 && x.nextStepSignType !== 5) || !x.isSign),
          )
        ) {
          check = false;
        }
        if (this.listOfData.some((x) => x.isCloseDocument)) {
          check = false;
        }
      }
    });

    this.btnSignHeader.visible = check && checkExistItem;
  }
  checkShowButtonSignUsb(): any {
    let check = true;
    let checkExistItem = false;
    this.listOfData.forEach((item: any) => {
      if (this.setOfCheckedId.has(item.id)) {
        checkExistItem = true;
        if (
          this.listOfData.some(
            (x) =>
              x.id === item.id &&
              (x.documentStatus !== 1 || (x.nextStepSignType !== 4 && x.nextStepSignType !== 8 && x.nextStepSignType !== 9) || !x.isSign),
          )
        ) {
          check = false;
        }
        if (this.listOfData.some((x) => x.isCloseDocument)) {
          check = false;
        }
      }
    });

    this.btnSignUsbHeader.visible = check && checkExistItem;
  }
  checkShowButtonReject(): any {
    let check = true;
    let checkExistItem = false;
    this.listOfData.forEach((item: any) => {
      if (this.setOfCheckedId.has(item.id)) {
        checkExistItem = true;
        if (item.documentStatus !== 1 || !item.isSign || item.isCloseDocument) {
          check = false;
        }
      }
    });

    this.btnHeaderReject.visible = check && checkExistItem;
  }

  //#region API Event
  getHSMAccount(): any {
    this.userHSMAccountService.getListCombobox(this.userId).subscribe(
      (res: any) => {
        if (res.code === 200) {
          this.listHSM = res.data;
        }
      },
      (err: any) => {
        console.log(err);
      },
    );
  }

  // isSignExpireAtDate: Trạng thái Hết hạn ký hay chưa?
  getStatusName(status: number, isSignExpireAtDate: boolean): string {
    if (status === 1 && isSignExpireAtDate) {
      return 'Hết hạn ký';
    } else {
      switch (status) {
        case 0:
          return 'Đang soạn thảo';
          break;
        case 1:
          return 'Đang xử lý';
          break;
        case 2:
          return 'Đã từ chối';
          break;
        case 3:
          return 'Đã hoàn thành';
          break;
        default:
          return '';
          break;
      }
    }
    return '';
  }

  getStatusSignName(data: any): string {
    if (data.signAtDate === null || data.signAtDate === undefined) {
      return 'Đang xử lý';
    } else {
      switch (data.type) {
        case 1:
          return 'Đã ký chứng thực';
          break;
        case 2:
          return 'Đã ký phê duyệt';
          break;
        case 3:
          return 'Đã ký review';
          break;
        default:
          return '';
          break;
      }
    }

    return '';
  }

  fecthListCertifyType(): Subscription {
    const rs = this.certifyTypeService.getListCombobox().subscribe(
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
        this.listCertifyType = res.data;
      },
      (err: any) => {
        // this.gridApi.hideOverlay();
        console.log(err);
      },
    );
    return rs;
  }

  initListWorkflowState(): Subscription {
    const rs = this.workflowStateApiService.getListCombobox().subscribe(
      (res: any) => {
        if (res.code !== 200) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        const dt: any[] = [];
        res.data.forEach((element: any) => {
          dt.push({
            id: element.id + '-1',
            realId: element.id,
            code: element.code,
            name: element.name,
            displayName: element.name + ' - ' + element.code,
            documentStatus: 1,
          });
          dt.push({
            id: element.id + '-2',
            realId: element.id,
            code: element.code,
            name: element.name,
            displayName: element.nameForReject + ' - ' + element.code,
            documentStatus: 2,
          });
        });
        this.listWorkflowState = dt;
      },
      (err: any) => {
        console.log(err);
      },
    );
    return rs;
  }

  initGridData(): Subscription {
    this.setOfCheckedId.clear();
    // this.gridApi.showLoadingOverlay();
    const rs = this.documentApiService.getFilter(this.filter).subscribe(
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

        this.listOfData = dataResult.data.map((elem: any) => ({
          ...elem,
          documentStatusName: this.getStatusName(elem.documentStatus, elem.isSignExpireAtDate),
          workFlowUser: elem.workFlowUser
            ? elem.workFlowUser.map((item: any) => ({
                ...item,
              }))
            : [],
        }));
        let i =
          (this.filter.pageSize === undefined ? 0 : this.filter.pageSize) *
          ((this.filter.pageNumber === undefined ? 0 : this.filter.pageNumber) - 1);

        let ckComplete = false;
        this.listOfData.forEach((doc: any) => {
          doc.index = ++i;
          ckComplete = true;
          doc.workFlowUser.forEach((wf: any) => {
            // wf.signAtDate = new Date();
            wf.statusSignName = this.getStatusSignName(wf);
            if (wf.signAtDate !== null && wf.signAtDate !== undefined) {
              wf.wfStatus = true;
            } else {
              ckComplete = false;
            }
          });
          doc.isWFComplete = ckComplete;
        });

        for (const item of dataResult.data) {
          item.index = ++i;
          item.statusName = this.listStatus.find((x) => x.id === item.status)?.name;
          item.infoGrantAccess = true;
          item.editGrantAccess = true;
          item.deleteGrantAccess = true;
        }
        this.grid.totalData = dataResult.totalCount;
        this.grid.dataCount = dataResult.dataCount;
        // this.grid.rowData = dataResult.data;
        this.pageSizeOptions = [...PAGE_SIZE_OPTION_DEFAULT];
        // tslint:disable-next-line: variable-name
        this.pageSizeOptions = this.pageSizeOptions.filter((number) => {
          return number < dataResult.totalCount;
        });
        this.pageSizeOptions.push(dataResult.totalCount);
      },
      (err: any) => {
        // this.gridApi.hideOverlay();
        console.log(err);
      },
    );
    return rs;
  }

  deleteListItem(listId: any[]): Subscription {
    this.isLoadingDelete = true;
    const promise = this.documentApiService.delete(listId).subscribe(
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

  sendToWFListItem(listId: string[]): Subscription {
    const promise = this.documentApiService.sendToWF(listId).subscribe(
      (res: any) => {
        if (res.code !== 200) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        let check = false;
        res.data.forEach((element: any) => {
          if (element.result) {
            check = true;
            this.messageService.success(element.message);
          } else {
            this.messageService.error(element.message);
          }
        });
        if (check) {
          this.initGridData();
        }
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

  rejectDocument(listId: any[]): Subscription {
    this.isLoading = true;
    const promise = this.documentApiService.rejectDocument(listId).subscribe(
      (res: any) => {
        this.isLoading = false;
        if (res.code !== 200) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        let check = false;
        res.data.forEach((element: any) => {
          if (element.result) {
            check = true;
            this.messageService.success(element.message);
          } else {
            this.messageService.error(element.message);
          }
        });
        if (check) {
          this.item.documentStatus = 2;
        }
      },
      (err: any) => {
        this.isLoading = false;
        if (err.error) {
          this.notification.error(`Có lỗi xảy ra`, `${err.error.message}`);
        } else {
          this.notification.error(`Có lỗi xảy ra`, `${err.status}`);
        }
      },
    );
    return promise;
  }

  async getDocumentDetailById(id: string): Promise<any> {
    const res = await this.documentApiService.getById(id).toPromise();
    if (res.code !== 200) {
      this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
      return;
    }
    if (res.data === null || res.data === undefined) {
      this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
      return;
    }
    this.item = res.data;
    return res.data;
  }

  processingWorkflow(listId: any[]): Subscription {
    const data = {
      listDocumentId: listId,
    };
    const promise = this.documentApiService.processingWorkflow(data).subscribe(
      (res: any) => {
        if (res.code !== 200) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        if (res.data) {
          this.messageService.success(res.message);
          this.initGridData();
        } else {
          this.messageService.error(res.message);
        }
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
  //#endregion API Event

  filterUserNameKeyDown($event: any): any {
    if ($event.code === 'Enter' || $event.code === 'NumpadEnter') {
      this.initGridData();
    }
  }

  filterRefCodeKeyDown($event: any): any {
    if ($event.code === 'Enter' || $event.code === 'NumpadEnter') {
      this.initGridData();
    }
  }

  wfStepIndexChange($event: any): any {
    const wfUser = this.expandData.workFlowUser[$event - 1];
    const userModel = {
      id: wfUser.userId,
    };
    this.modal = {
      type: 'info',
      item: userModel,
      isShow: true,
      option: {},
    };
    this.itemUserModal.initData(userModel, 'info', true, true);
  }

  getWorkflowById(id: any): Promise<any> {
    return this.workflowService.getById(id).toPromise();
  }

  async workflowClick($event: any) {
    const response = await this.getWorkflowById($event);

    this.isVisibleWorkflowItem = true;

    this.workflowItemModal.initData(response.data, 'info', { isFromDocument: true });
  }

  onModalWorkflowItemEventEmmit($event: any) {
    this.isVisibleWorkflowItem = false;
  }

  onSelectionChanged($event: any): void {}

  onCellDoubleClicked($event: any): void {}

  onGridReady(params: any): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  async getAllDocumentForExport(): Promise<any> {
    this.btnExportExcel.isLoading = true;

    const fil: QueryFilerModel = new QueryFilerModel();
    Object.assign(fil, this.filter);
    fil.pageSize = this.grid.totalData;

    const res = await this.documentApiService
      .getFilter(fil)
      .toPromise()
      .catch((x) => (this.btnExportExcel.isLoading = false));
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

    let columnDefs = this.gridApi.getColumnDefs();

    let i = 1;
    for (const item of dataResult.data) {
      item.index = i;
      item.statusName = this.listStatus.find((x) => x.id === item.status)?.name;

      item.documentStatusNameAgGrid = this.getStatusName(item.documentStatus, item.isSignExpireAtDate);
      item.documentStatusNameAgGrid = item.documentStatus === 1 && item.isCloseDocument ? 'Đã đóng' : item.documentStatusNameAgGrid;

      item.documentStatusName = this.getStatusName(item.documentStatus, item.isSignExpireAtDate);

      item.documentStatusStateNameAgGrid =
        item.documentStatus === 0 || item.documentStatus === 3
          ? item.documentStatusName
          : item.documentStatus === 1
          ? item.stateName
          : item.stateNameForReject;

      item.documentStatusStateNameAgGrid = item.isDeleted ? 'Đã xóa' : item.documentStatusStateNameAgGrid;

      item.signExpireAtDateAgGrid = item.signExpireAtDate ? moment(item.signExpireAtDate).format('DD/MM/YYYY HH:mm:ss') : '';
      item.signCloseAtDateAgGrid = item.signCloseAtDate ? moment(item.signCloseAtDate).format('DD/MM/YYYY HH:mm:ss') : '';
      item.createdDateAgGrid = item.createdDate ? moment(item.createdDate).format('DD/MM/YYYY HH:mm:ss') : '';

      if (item.exportDocumentData) {
        item.exportDocumentData.forEach((x: any) => {
          let checkColumnExists = columnDefs.some((c: any) => c.field === x.key);
          if (!checkColumnExists) {
            columnDefs.push({
              field: x.key,
              headerName: x.name,
              minWidth: 150,
            });

            this.gridApi.setColumnDefs(columnDefs);
          }

          item[x.key] = x.value;
        });
      }

      i++;
    }

    this.gridApi.setRowData(dataResult.data);

    this.btnExportExcel.isLoading = false;
  }

  async onExportExcel() {
    await this.getAllDocumentForExport();
    const params = {
      columnWidth: 150,
      sheetName: this.moduleName,
      exportMode: undefined, // 'xml', // : undefined,
      suppressTextAsCDATA: true,
      rowHeight: undefined,
      fileName: `${this.moduleName} ${moment(new Date()).format('DDMMYYYY_HHmm')}.xlsx`,
      headerRowHeight: undefined, // undefined,
      customHeader: [
        [],
        [
          {
            styleId: 'bigHeader',
            data: {
              type: 'String',
              value: `${this.moduleName}`,
            },
            mergeAcross: 4,
          },
        ],
        [],
      ],
      customFooter: [[]],
    };
    this.gridApi.exportDataAsExcel(params);
  }
}
