import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ACLService } from '@delon/acl';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { environment } from '@env/environment';
import { ButtonModel } from '@model';
import { DocumentApiService, OrganizationApiService, UserApiService, UserService, WorkflowApiService } from '@service';
import { SystemLogApiService } from '@service';
import { SignResponseModalComponent } from '@shared';
import { cleanForm, Constants, getUrlDownloadFile, LIST_NOTIFY_TYPE, nodeUploadRouter } from '@util';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
import { DocumentInfoSignComponent } from 'src/app/routes/document-sign/document-info-sign/document-info-sign.component';
import { DocumentListCertComponent } from 'src/app/routes/document-sign/document-list-cert/document-list-cert.component';
import { DocumentOtpSignComponent } from 'src/app/routes/document-sign/document-otp-sign/document-otp-sign.component';
import { DocumentSignService } from 'src/app/services/api/document-sign.service';
import { NotifyConfigApiService } from 'src/app/services/api/notify-config-api.service';
// import { UserHSMAcountService } from 'src/app/services/api/user-hsm-account.service';
import { UserHSMAccountApiService } from 'src/app/services/api/user-hsm-account.service';
import { DocumentSignComponent } from '../document-sign/document-sign.component';
@Component({
  selector: 'app-document-item',
  templateUrl: './document-item.component.html',
  styleUrls: ['./document-item.component.less'],
})
export class DocumentItemComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private documentApiService: DocumentApiService,
    private route: ActivatedRoute,
    private organizationApiService: OrganizationApiService,
    private aclService: ACLService,
    private notification: NzNotificationService,
    private modalService: NzModalService,
    private documentSignService: DocumentSignService,
    private userApiService: UserService,
    private ref: ChangeDetectorRef,
    private systemLogService: SystemLogApiService,
    private userHSMAccountService: UserHSMAccountApiService,
    private notifyConfigApiService: NotifyConfigApiService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {
    this.currentUserEmail = this.tokenService.get()?.email;
    this.organizationId = this.tokenService.get()?.organizationId;
    this.btnSign = {
      title: 'KÝ ĐIỆN TỬ AN TOÀN',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-sign.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.save(0);
      },
    };
    this.btnSignHSM = {
      title: 'KÝ HSM',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-sign-hsm.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.save(2);
      },
    };
    this.btnSignADSS = {
      title: 'KÝ ADSS',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-sign-adss.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.save(Constants.SIGN_ADSS);
      },
    };
    this.btnSignUSB = {
      title: 'KÝ USB Token',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-sign-usb.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.save(1);
      },
    };
    this.btnSignApproval = {
      title: 'Ký phê duyệt',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-sign-approval.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.onOpenDrawSign();
      },
    };
    this.btnSendToWF = {
      title: 'Trình duyệt',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-send-to-wf.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: (data: any) => {
        const listId: string[] = this.listDocument.map((entity: any) => {
          return entity.id;
        });
        this.sendToWFListItem(listId);
      },
    };
    this.btnSignAuthentication = {
      title: 'Ký chứng thực',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-sign-authentication.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.signAuthentication();
        // this.messageService.error('Chức năng đang được xây dựng!');
      },
    };
    this.btnReject = {
      title: 'Từ chối',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-reject.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: (data: any) => {
        // const listId: string[] = this.listDocument.map((entity: any) => {
        //   return entity.id;
        // });
        // this.rejectDocument(listId);
        this.formReject = {
          documentId: '',
          lastReasonReject: '',
          notifyConfigId: null,
        };
        this.isShowFormReject = true;
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
    this.btnApprove = {
      title: 'DUYỆT',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-approve.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: (item: any) => {
        this.approveDocument(this.listId);
      },
    };
    this.btnGenerateImagePreview = {
      title: 'Tạo ảnh Preview',
      titlei18n: `${this.i18n.fanyi('function.document.document-item.create-image-preview')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      isLoading: false,
      click: (item: any) => {
        this.generateImagePreview(this.listId);
      },
    };
  }
  @Input() type = 'add';
  @Input() item: any = {
    documentFile: [],
  };
  @Input() isVisible = false;
  @Input() option: any;
  @Output() eventEmmit = new EventEmitter<any>();
  listFileAttachment: any[] = [];
  listDocument: any[] = [];
  listId: any[] = [];
  paramDataSign: any = {};
  moduleName = `${this.i18n.fanyi('function.document.document-item.header-info')}`;
  error = '';
  userId: any = '';
  signatureType: any;
  isInfo = false;
  isEdit = false;
  isAdd = false;
  isShowSignResponse = false;
  isShowDocWFLHistory = false;
  msgOTP = true;
  tittle = '';
  typeSign: any;
  detail: any;
  isLoading = false;
  isReloadGrid = false;
  logo_sign: any;
  isSigned = false;
  btnSignApproval: ButtonModel;
  btnSignAuthentication: ButtonModel;
  btnReject: ButtonModel;
  btnSendToWF: ButtonModel;
  btnCancel: ButtonModel;
  btnSign: ButtonModel;
  btnSignHSM: ButtonModel;
  btnSignUSB: ButtonModel;
  btnApprove: ButtonModel;
  btnSignADSS: ButtonModel;
  btnGenerateImagePreview: ButtonModel;
  fileUrl = '';
  currentUserEmail = '';
  organizationId = '';
  checkboxAccess = true;
  modal: any = {
    type: '',
    item: {},
    isShow: false,
    option: {},
  };
  modalShow: any = {
    type: '',
    item: {},
    isShow: false,
    option: {},
  };
  listDocumentClientSign: any[] = [];
  lstCert: any;
  fileBase64: any;
  access_Sign: any;
  data_image: any;
  documentId: any;
  scaleImage: any = 0;
  scaleText: any = 0;
  scaleLogo: any = 0;
  @ViewChild(DocumentSignComponent, { static: false }) itemSignModal!: { initData: (arg0: {}, arg1: string, arg2: {}) => void };
  @ViewChild(SignResponseModalComponent, { static: false }) signResponseModal!: { initData: (arg0: any, arg1: string) => void };
  @ViewChild(DocumentInfoSignComponent, { static: false }) itemInfoSignModal!: {
    initData: (arg0: {}, arg1: string, userId: string) => void;
  };
  @ViewChild(DocumentOtpSignComponent, { static: false }) itemModalHSMAccount!: { initData: (arg0: number, list?: any) => void };
  @ViewChild(DocumentListCertComponent, { static: false }) itemModalCert!: { initData: (arg0: {}) => void };
  listParamDataSign: any[] = [];
  listDocumentWFLHistory: any[] = [];
  dataLog: any;
  listHSM: any;
  requestList: any[] = [];
  serialData: any;
  dataHash: any;
  dataCoordinate: any;
  req: any = [];
  dataAttach: any[] = [];

  checkIsSign = false;
  // 22-9/2021
  zoom_to: any = 1;

  listNotifyConfig: any[] = [];
  isShowFormReject = false;
  formReject: any = {
    documentId: '',
    lastReasonReject: '',
    notifyConfigId: null,
  };

  listNotifyType: any[] = LIST_NOTIFY_TYPE.filter((x) => x.value === Constants.LIST_NOTIFY_TYPE_REJECT);
  signConfig: any;

  onCloseFormReject() {
    this.isShowFormReject = false;
  }

  onRejectDocument() {
    const listId: string[] = this.listDocument.map((entity: any) => {
      return entity.id;
    });
    this.rejectDocument(listId);
    this.isShowFormReject = false;
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

  getFileUrl(file: any): string {
    if (file === null || file === undefined || file === '' || file === '') {
      return '';
    }

    return file.fileUrl;
    // return getUrlDownloadFile(file.fileBucketName, file.fileObjectName);
  }
  getFileBase64Url(file: any): any {
    if (file === null || file === undefined || file === '' || file === '') {
      return '';
    }
    return this.getBase64Url(file.fileBucketName, file.fileObjectName);
  }
  changeFileToView(data: any, document?: any): any {
    let dataId;

    console.log('data click vào=', document);
    if (dataId !== document.id) {
      dataId = document.id;
      this.getByDocID(document.id);
    }

    this.fileUrl = this.getFileUrl(data);
  }

  handleCancel(): void {
    this.isVisible = false;
    if (this.isReloadGrid) {
      this.eventEmmit.emit({ type: 'success' });
    } else {
      this.eventEmmit.emit({ type: 'close' });
    }
  }

  onModalEventEmmit(event: any): void {
    this.isShowSignResponse = false;
    if (event.type === 'success') {
      this.signResponseModal.initData(event, '');
    }
  }

  async onSignResponseModalEventEmmit(event: any): Promise<any> {
    this.isReloadGrid = true;
    await this.getDocumentDetailByListId(this.listId);
    this.checkShowButton();
    this.item = this.listDocument[0];
    this.fileUrl = this.getFileUrl(this.item.listDocumentFile[0]);
  }

  ngOnInit(): void {
    this.initRightOfUser();
  }

  initRightOfUser(): void {
    this.btnReject.grandAccess = this.aclService.canAbility('DOCUMENT-REJECT');
    this.btnSign.grandAccess = this.aclService.canAbility('DOCUMENT-SIGN-NORMAL');
    this.btnSignHSM.grandAccess = this.aclService.canAbility('DOCUMENT-SIGN-HSM');
    this.btnSignADSS.grandAccess = this.aclService.canAbility('DOCUMENT-SIGN-ADSS');
    this.btnSignUSB.grandAccess = this.aclService.canAbility('DOCUMENT-SIGN-USB');
    this.btnSendToWF.grandAccess = this.aclService.canAbility('DOCUMENT-REQUEST-APPROVE');
    this.btnApprove.grandAccess = this.aclService.canAbility('DOCUMENT-APPROVE');
    this.btnGenerateImagePreview.grandAccess = this.aclService.canAbility('DOCUMENT_IMAGE_PREVIEW');
  }

  updateFormType(type: string): void {
    this.tittle = this.moduleName;
  }

  public async initData(data: any, type: any = null, option: any = {}): Promise<any> {
    this.signConfig = null;
    // reset button visible
    this.btnSendToWF.visible = false;
    this.btnSignApproval.visible = false;
    this.btnSignAuthentication.visible = false;
    this.btnSign.visible = false;
    this.btnSignADSS.visible = false;
    this.btnSignUSB.visible = false;
    this.btnSignHSM.visible = false;
    this.btnReject.visible = false;
    this.btnApprove.visible = false;

    this.userId = this.tokenService.get()?.id;
    this.detail = '';
    this.isVisible = true;
    this.isLoading = false;
    this.isReloadGrid = false;
    this.hiddeAllButton();
    this.listId = data; // danh sách id hợp đồng ký
    await this.getDocumentDetailByListId(this.listId);
    this.checkShowButton();
    this.item = this.listDocument[0];
    this.documentId = this.item.id;
    this.fileUrl = this.getFileUrl(this.item.listDocumentFile[0]);
    this.listDocument.map((item) => {
      this.getBase64Url(item.listDocumentFile[0].fileBucketName, item.listDocumentFile[0].fileObjectName, item);
    });
    this.updateFileUrl(this.item.listDocumentFile[0].fileBucketName, this.item.listDocumentFile[0].fileObjectName);
    this.type = type;
    this.option = option;
    this.updateFormType(type);
    this.getHSMAccount();
    this.getListNotifyConfig();
  }

  //#endregion Check Show Button
  hiddeAllButton(): void {
    this.btnSendToWF.visible = false;
    this.btnReject.visible = false;
    this.btnSignApproval.visible = false;
    this.btnSignAuthentication.visible = false;
    this.btnApprove.visible = false;
  }

  checkShowButton(): any {
    this.checkShowButtonSendToWF();
    this.checkShowButtonReject();
    this.checkShowButtonSign();
    this.checkShowButtonSignApproval();
    this.checkShowButtonSignAuthentication();
    this.checkShowButtonApprove();
  }

  checkShowButtonSendToWF(): any {
    let check = true;
    if (this.listDocument.some((x) => x.documentStatus !== 0)) {
      check = false;
    }
    let checkIsDeleted = false;
    if (this.listDocument.some((x) => x.isDeleted === true)) {
      checkIsDeleted = true;
    }
    let checkIsClosed = false;
    if (this.listDocument.some((x) => x.isCloseDocument === true)) {
      checkIsClosed = true;
    }
    this.btnSendToWF.visible = check && !checkIsDeleted && !checkIsClosed;
  }

  checkShowButtonSignApproval(): any {
    let check = true;
    if (this.listDocument.some((x) => x.documentStatus !== 1 || x.nextStepSignType !== 2 || !x.isSign)) {
      check = false;
    }

    let checkIsDeleted = false;
    if (this.listDocument.some((x) => x.isDeleted === true)) {
      checkIsDeleted = true;
    }

    let checkIsClosed = false;
    if (this.listDocument.some((x) => x.isCloseDocument === true)) {
      checkIsClosed = true;
    }

    this.btnSignApproval.visible = check && !checkIsDeleted && !checkIsClosed;
  }
  checkShowButtonSignAuthentication(): any {
    let check = true;
    if (this.listDocument.some((x) => x.documentStatus !== 1 || x.nextStepSignType !== 1 || !x.isSign)) {
      check = false;
    }

    let checkIsDeleted = false;
    if (this.listDocument.some((x) => x.isDeleted === true)) {
      checkIsDeleted = true;
    }

    let checkIsClosed = false;
    if (this.listDocument.some((x) => x.isCloseDocument === true)) {
      checkIsClosed = true;
    }

    this.btnSignAuthentication.visible = check && !checkIsDeleted && !checkIsClosed;
  }
  checkShowButtonSign(): any {
    this.checkIsSign = true;

    let checkIsDeleted = false;
    if (this.listDocument.some((x) => x.isDeleted === true)) {
      checkIsDeleted = true;
    }

    let checkIsClosed = false;
    if (this.listDocument.some((x) => x.isCloseDocument === true)) {
      checkIsClosed = true;
    }

    if (this.listDocument.some((x) => x.nextStepSignType === 5)) {
      this.btnSign.visible = !checkIsDeleted && !checkIsClosed;
      return;
    }

    if (this.listDocument.some((x) => x.nextStepSignType === 8)) {
      this.btnSignUSB.visible = !checkIsDeleted && !checkIsClosed;
      this.btnSignHSM.visible = !checkIsDeleted && !checkIsClosed;
      return;
    }

    if (this.listDocument.some((x) => x.nextStepSignType === 9)) {
      this.btnSignHSM.visible = !checkIsDeleted && !checkIsClosed;
      this.btnSignUSB.visible = !checkIsDeleted && !checkIsClosed;
      this.btnSignADSS.visible = !checkIsDeleted && !checkIsClosed;
    } else {
      if (this.listDocument.some((x) => x.documentStatus !== 1 || (x.nextStepSignType !== 4 && x.nextStepSignType !== 7) || !x.isSign)) {
        this.checkIsSign = false;
      }
      let checkIdADSS = false;
      if (this.listDocument.some((x) => x.nextStepSignType === 7)) {
        checkIdADSS = true;
      }
      this.btnSign.visible = this.checkIsSign && !checkIsDeleted && !checkIdADSS && !checkIsClosed;
      this.btnSignUSB.visible = this.checkIsSign && !checkIsDeleted && !checkIdADSS && !checkIsClosed;
      this.btnSignHSM.visible = this.checkIsSign && !checkIsDeleted && !checkIdADSS && !checkIsClosed;
      this.btnSignADSS.visible = this.checkIsSign && !checkIsDeleted && !checkIsClosed;
    }
  }

  checkShowButtonReject(): any {
    let check = true;
    if (this.listDocument.some((x) => x.documentStatus !== 1 || !x.isSign)) {
      check = false;
    }

    let checkIsDeleted = false;
    if (this.listDocument.some((x) => x.isDeleted === true)) {
      checkIsDeleted = true;
    }

    let checkIsClosed = false;
    if (this.listDocument.some((x) => x.isCloseDocument === true)) {
      checkIsClosed = true;
    }
    this.btnReject.visible = check && !checkIsDeleted && !checkIsClosed;
  }

  checkShowButtonApprove(): any {
    let check = true;
    if (this.listDocument.some((x) => !(x.documentStatus === 1 && x.nextStepSignType === 6 && !x.isSignExpireAtDate && x.isSign))) {
      check = false;
    }

    let checkIsDeleted = false;
    if (this.listDocument.some((x) => x.isDeleted === true)) {
      checkIsDeleted = true;
    }

    let checkIsClosed = false;
    if (this.listDocument.some((x) => x.isCloseDocument === true)) {
      checkIsClosed = true;
    }
    this.btnApprove.visible = check && !checkIsDeleted && !checkIsClosed;
  }

  //#region
  save(type: any): void {
    // this.isLoading = true;
    // Kiểm tra đã chọn vào đồng ý ký tài liệu chưa
    if (this.checkboxAccess) {
      this.signatureType = type;
      const tokenModel = this.tokenService.get();

      if (type === Constants.SIGN_ADSS) {
        this.getHSMAccount();
        this.typeSign = Constants.SIGN_ADSS;
        this.listHSM = this.listHSM.filter((x: any) => x.accountType === Constants.ACCOUNT_TYPE_ADSS);
        this.itemModalHSMAccount.initData(type, this.listHSM);
      } else {
        this.itemInfoSignModal.initData([this.signatureType], 'draw', tokenModel ? tokenModel.id : ''); // (document-info-sign)
      }
    } else {
      this.messageService.warning('Vui lòng chọn đồng ý ký để thực hiện ký tài liệu!');
      // this.isLoading = false;
    }
  }
  sendToWFListItem(listId: string[]): Subscription {
    this.isLoading = true;
    this.isReloadGrid = true;
    const promise = this.documentApiService.sendToWF(listId).subscribe(
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
          this.listDocument.forEach((element) => {
            element.documentStatus = 1;
            this.checkShowButton();
          });
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

  rejectDocument(listId: string[]): Subscription {
    this.isLoading = true;
    this.isReloadGrid = true;

    const model = {
      listId,
      lastReasonReject: this.formReject.lastReasonReject,
      notifyConfigId: this.formReject.notifyConfigId,
    };

    const promise = this.documentApiService.rejectDocument(model).subscribe(
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

        this.initData(this.listId, this.type, this.option);
        if (check) {
          this.listDocument.forEach((element) => {
            element.documentStatus = 2;
            this.checkShowButton();
          });
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
  getHSMAccount(): any {
    let checkIsDeleted = false;
    if (this.listDocument.some((x) => x.isDeleted === true)) {
      checkIsDeleted = true;
    }
    if (!checkIsDeleted) {
      this.userHSMAccountService.getListComboboxHSMValid(this.userId).subscribe(
        (res: any) => {
          if (res.code === 200) {
            this.listHSM = res.data;
            if (this.listHSM.length < 1) {
              this.btnSignHSM.visible = false;
              this.btnSignADSS.visible = false;
            } else {
              let checkIsClosed = false;
              if (this.listDocument.some((x) => x.isCloseDocument === true)) {
                checkIsClosed = true;
              }

              // check HSM
              if (
                !this.listHSM.find((x: any) => x.accountType === Constants.ACCOUNT_TYPE_HSM) ||
                this.listDocument.some((x: any) => x.signType !== 4 && x.signType !== 8 && x.signType !== 9)
              ) {
                this.btnSignHSM.visible = false;
              } else {
                this.btnSignHSM.visible = this.checkIsSign && !checkIsClosed;
              }

              if (
                !this.listHSM.find((x: any) => x.accountType === Constants.ACCOUNT_TYPE_ADSS) ||
                !this.listDocument.some((x: any) => x.adssProfileName) ||
                !this.listDocument.some((x: any) => x.signType === 7 || x.signType === 9)
              ) {
                this.btnSignADSS.visible = false;
              } else {
                this.btnSignADSS.visible = this.checkIsSign && !checkIsClosed;
              }
            }
          }
        },
        (err: any) => {
          console.log(err);
        },
      );
    }
  }
  // Kết quả trả về từ modal vẽ chữ ký (document-info-sign)
  onModalEventEmmitSign(event: any): void {
    this.listFileAttachment = event.dataResult.listFileAttachment;
    this.signConfig = event.signSelected;
    if (this.signatureType === 2) {
      this.getHSMAccount();
      this.listHSM = this.listHSM.filter((x: any) => x.accountType === Constants.ACCOUNT_TYPE_HSM);
    }

    this.detail = '';
    this.modalShow.isShow = false;
    this.isLoading = false;

    this.data_image = event.dataResult.dataUrl;
    if (event.signSelected) {
      if (event.signSelected.logoFileBase64) {
        this.logo_sign = event.signSelected.logoFileBase64;
      }
      this.scaleImage = event.signSelected.scaleImage;
      this.scaleText = event.signSelected.scaleText;
      this.scaleLogo = event.signSelected.scaleLogo;
    }

    this.detail = event.listInfoSignIndex ? event.listInfoSignIndex.toString() : '';
    if (event.type === 'success') {
      // Nếu chọn ký số USB Token
      if (this.signatureType === Constants.SIGN_USB_TOKEN) {
        this.isLoading = true;
        // Kiểm tra chứng thư số trước khi ký
        this.checkCert();
      }
      // Nếu chọn ký số HSM hoặc Ký Điện tử
      if (this.signatureType === 0) {
        this.typeSign = Constants.SIGN_DIG;
        // b2: Bật Modal để nhập OTP
        this.itemModalHSMAccount.initData(Constants.SIGN_DIG, ''); // (document-otp-sign)
        // b3: Gọi hàm gửi OTP về mail
        this.getOTP();
      } else if (this.signatureType === 2) {
        this.isLoading = true;
        this.typeSign = Constants.SIGN_HSM;
        // b2: Bật Modal để chọn cert
        // Nếu thiếu thông tin gì đó
        this.itemModalHSMAccount.initData(this.typeSign, this.listHSM); // (document-otp-sign)
      }
    }
  }
  // Kết quả trả về từ modal Nhập OTP or PIN(document-otp-sign)
  onModalEventEmmitOTP(event: any): void {
    this.isLoading = false;
    this.modalShow.isShow = false;
    if (event.type === 'access_Sign') {
      // Xác nhận ký từ Compoent (OTP - PIN)=> document-otp-sign
      this.access_Sign = event.dataResult.toString();
      // Nếu typeSign=1  từ hàm Kiểm tra chứng thư số HSM thì ký Số HSM
      if (this.typeSign === Constants.SIGN_HSM) {
        this.onSignHSM(event.dataResult);
      }
      if (this.typeSign === Constants.SIGN_ADSS) {
        this.onSignADSS(event.dataResult);
      }
      // Nếu typeSign=0  từ hàm Kiểm tra chứng thư số HSM thì ký điện tử
      if (this.typeSign === Constants.SIGN_DIG) {
        this.onSignDigital();
      }
    }
    if (event.type === 'reject_Sign') {
      this.documentSignService
        .rejectDoc({
          documentId: this.documentId,
          account: this.route.snapshot.queryParams.email,
          rejectReason: event.dataResult,
        })
        .subscribe(
          (res: any) => {
            this.messageService.error(res.data);
          },
          (error) => {
            if (error.error.code === 500) {
              this.messageService.error(error.error.message);
            } else {
              this.messageService.error('Từ chối ký không thành công');
            }
          },
        );
    }
    // Nếu Chọn gửi lại mã trong MÀn hình xác thực OTP
    if (event.type === 'sendOTP') {
      this.getOTP();
    }
  }
  getOTP(): any {
    this.isLoading = false;
    this.userApiService.sendOTPAuth().subscribe(
      (res: any) => {
        this.msgOTP = false; // show dòng thông báo dưới ô input để thông báo khi gửi mã otp lại
        this.messageService.success('Gửi OTP thành công');
      },
      (error: any) => {
        this.msgOTP = true; // hinden dòng thông báo dưới ô input để thông báo khi gửi mã otp lại
        this.messageService.error('Gửi OTP không thành công');
        this.error = error.error.message;
      },
    );
  }
  // Kết quả trả về từ modal Chọn chứng thư số(document-list-cert)
  onModalEventEmmitCert(event: any): void {
    this.modalShow.isShow = false;
    if (event.type === 'access_Sign') {
      // Nếu có chứng thư số thì ký bằng chứng thư số
      if (event.dataResult != null || event.dataResult !== undefined) {
        this.bindingMultiCoordinate(event.dataResult);
      }
    }
    this.isLoading = false;
  }
  updateFileUrl(buckename: string, objectName: string): any {
    this.documentSignService.getUrlDownloadFileBase64(buckename, objectName).subscribe(
      (res: any) => {
        this.fileUrl = `data:@file/pdf;base64,` + res.data.fileData;
        this.fileBase64 = res.data.fileData;
      },
      (err: any) => {
        this.messageService.error('tải tài liệu không thành công!');
      },
    );
  }
  async getBase64Url(buckename: string, objectName: string, document: any = null): Promise<any> {
    this.documentSignService.getUrlDownloadFileBase64(buckename, objectName).subscribe(
      (res: any) => {
        this.fileUrl = `data:@file/pdf;base64,` + res.data.fileData;
        this.fileBase64 = res.data.fileData;
        if (document !== null) {
          document.fileSign = res.data.fileData;
        }
      },
      (err: any) => {
        this.messageService.error('tải tài liệu không thành công!');
      },
    );
  }
  onSignDigital(): any {
    const modelData = {
      listDocumentId: this.listId,
      listFileAttachment: this.listFileAttachment,
      otp: this.access_Sign,
      appearance: {
        imageData: this.scaleImage > 0 || (this.scaleLogo === 0 && this.scaleText === 0 && this.scaleImage === 0) ? this.data_image : '',
        logo: this.scaleLogo > 0 ? this.logo_sign : '',
        detail: this.scaleText > 0 ? this.detail : '',
        scaleImage: this.scaleImage,
        scaleText: this.scaleText,
        scaleLogo: this.scaleLogo,
        reason: 'Tôi đã đọc, hiểu, đồng ý ký hợp đồng.',
      },
      userSignConfigId: this.signConfig?.id,
    };
    this.isLoading = true;
    this.documentSignService.signDigital(modelData).subscribe(
      (res: any) => {
        this.isLoading = false;
        if (res.code === 200) {
          this.detail = '';
          this.isSigned = true;
          let data: any[] = [];
          res.data.map((item: any) => {
            data = [item.documentId, ...data];
          });
          this.OnLoadDataSigned(data);
          this.hideBtnSign();
          this.messageService.success('Ký tài liệu thành công');
        } else {
          this.isLoading = false;
          this.messageService.success('Ký tài liệu thất bại');
        }
      },
      (error: any) => {
        this.isLoading = false;
        if (error.error.code === 500) {
          this.messageService.error(error.error.message);
        } else {
          this.messageService.error('Ký tài liệu không thành công');
        }
      },
    );
  }
  onSignHSM(dataHSM: any): any {
    const modelData = {
      listDocumentId: this.listId,
      listFileAttachment: this.listFileAttachment,
      hsmAcountId: dataHSM.hsmAcountId,
      userPin: '' + dataHSM.userPin,

      appearance: {
        imageData: this.scaleImage > 0 || (this.scaleLogo === 0 && this.scaleText === 0 && this.scaleImage === 0) ? this.data_image : '',
        logo: this.scaleLogo > 0 ? this.logo_sign : '',
        detail: this.scaleText > 0 ? this.detail : '',
        scaleImage: this.scaleImage,
        scaleText: this.scaleText,
        scaleLogo: this.scaleLogo,
        reason: 'Tôi đã đọc, hiểu, đồng ý ký hợp đồng.',
      },
      userSignConfigId: this.signConfig?.id,
    };
    this.isLoading = true;
    this.documentSignService.signHSM(modelData).subscribe(
      (res: any) => {
        if (res.code === 200) {
          this.detail = '';
          this.isSigned = true;
          this.hideBtnSign();
          let data: any[] = [];
          res.data.map((item: any) => {
            data = [item.documentId, ...data];
          });
          this.OnLoadDataSigned(data);
          console.log('list id data signed=', data);
          this.messageService.success('Ký tài liệu thành công');
          this.isLoading = false;
        }
      },
      (error: any) => {
        this.isLoading = false;
        if (error.error.code === 500) {
          this.messageService.error(error.error.message);
        } else {
          this.messageService.error('Ký tài liệu không thành công');
        }
      },
    );
  }
  onSignADSS(dataHSM: any): any {
    const modelData = {
      listDocumentId: this.listId,
      listFileAttachment: this.listFileAttachment,
      hsmAcountId: dataHSM.hsmAcountId,
      userPin: '' + dataHSM.userPin,
      appearance: {
        imageData: this.scaleImage > 0 || (this.scaleLogo === 0 && this.scaleText === 0 && this.scaleImage === 0) ? this.data_image : '',
        logo: this.scaleLogo > 0 ? this.logo_sign : '',
        detail: this.scaleText > 0 ? this.detail : '',
        scaleImage: this.scaleImage,
        scaleText: this.scaleText,
        scaleLogo: this.scaleLogo,
        reason: 'Tôi đã đọc, hiểu, đồng ý ký hợp đồng.',
      },
    };
    this.isLoading = true;
    this.documentSignService.signADSS(modelData).subscribe(
      (res: any) => {
        if (res.code === 200) {
          this.detail = '';
          this.isSigned = true;
          this.hideBtnSign();
          let data: any[] = [];
          res.data.map((item: any) => {
            data = [item.documentId, ...data];
          });
          this.OnLoadDataSigned(data);

          this.messageService.success('Ký tài liệu thành công');
        }
        this.isLoading = false;
      },
      (error: any) => {
        this.isLoading = false;
        // if (error.error.code === 500) {
        //   this.messageService.error(error.error.message);
        // } else {
        //   this.messageService.error('Ký tài liệu không thành công');
        // }
        this.messageService.error(error.error.message);
      },
    );
  }
  async OnLoadDataSigned(data: any): Promise<any> {
    this.listId = data; // danh sách id hợp đồng ký
    await this.getDocumentDetailByListId(this.listId);
    // this.checkShowButton();
    this.item = this.listDocument[0];
    this.documentId = this.item.id;
    this.fileUrl = this.getFileUrl(this.item.listDocumentFile[0]);
    console.log(this.fileUrl);
    this.listDocument.map((item) => {
      this.getBase64Url(item.listDocumentFile[0].fileBucketName, item.listDocumentFile[0].fileObjectName, item);
    });
    this.updateFileUrl(this.item.listDocumentFile[0].fileBucketName, this.item.listDocumentFile[0].fileObjectName);
  }
  hideBtnSign(): any {
    this.btnSign.visible = false;
    this.btnSignUSB.visible = false;
    this.btnReject.visible = false;
    this.btnSignHSM.visible = false;
    this.btnSignADSS.visible = false;
  }
  checkCert(): any {
    this.documentSignService
      .checkCert()
      .pipe(
        catchError((err) => {
          this.isLoading = false;
          this.showConfirmDowloadToolsSign();
          throw err;
        }),
      )
      .subscribe(
        (response: any) => {
          if (response.code === 1) {
            this.lstCert = response.data;
            this.isLoading = true;
            this.itemModalCert.initData(this.lstCert); // (document-list-cert)
          } else {
            this.isLoading = true;
            // Nếu không có chứng thư số thì sẽ tự động chuyển sang ký điện tử
            this.itemModalHSMAccount.initData(Constants.SIGN_DIG); // (document-otp-sign)
          }
        },
        (error: any) => {
          this.isLoading = false;
          if (error.error.code === 500) {
            this.messageService.error(error.error.message);
          }
        },
      );
  }
  bindingMultiCoordinate(data: any): any {
    this.requestList = [];
    if (data.serial != null) {
      this.isLoading = true;
      this.documentSignService.getMultiCoordinate(this.listId).subscribe(
        (res: any) => {
          if (res.code === Constants.CERT_FAILED_TO_LOAD) {
            this.messageService.error('Không lấy được Chứng thư số trong thiết bị');
          } else {
            this.listDocument.map((document) => {
              let dataRequestList: any = {};
              this.dataCoordinate = res.data;
              const rs = this.dataCoordinate.find((item: any) => item.documentId === document.id);
              if (rs) {
                dataRequestList = {
                  id: document.id,
                  // bucketName: document?.listDocumentFile[0].fileBucketName,
                  // objectName: document?.listDocumentFile[0].fileObjectName,
                  appearances: {
                    llx: +rs.llx,
                    lly: +rs.lly,
                    urx: +rs.urx,
                    ury: +rs.ury,
                    isVisible: true,
                    page: +rs.page,
                    imageBase64:
                      this.scaleImage > 0 || (this.scaleLogo === 0 && this.scaleText === 0 && this.scaleImage === 0) ? this.data_image : '',
                    logoBase64: this.scaleLogo > 0 ? this.logo_sign : '',
                    detail: this.scaleText > 0 ? this.detail : '',
                    location: '',
                    contact: '',
                    reason: 'Tôi đồng ý ký tài liệu',
                    email: document.nextStepUserEmail,
                    // scaleImage: this.scaleImage,
                    // scaleText: this.scaleText,
                    // scaleLogo: this.scaleLogo,
                  },
                };
              }
              if (this.logo_sign) {
                this.paramDataSign.logo = this.logo_sign;
                this.paramDataSign.scaleLogo = 1;
              }
              this.requestList = [dataRequestList, ...this.requestList];
            });
            const modelSign = {
              listFileAttachment: this.listFileAttachment,
              requestId: this.listId[0],
              certificate: [data.certificate],
              requestList: this.requestList,
              userSignConfigId: this.signConfig?.id,
            };
            this.serialData = data.serial;
            this.isLoading = true;
            this.documentSignService.getHash(modelSign).subscribe(
              // tslint:disable-next-line:no-shadowed-variable
              (res: any) => {
                this.isLoading = false;
                this.dataHash = res.data.responseList;
                this.SignUSB(this.dataHash);
              },

              (error: any) => {
                this.isLoading = false;
                if (error.error.code === 500) {
                  this.messageService.error(error.error.message);
                }
              },
            );
          }
        },
        (error) => {
          if (error.error.code === 500) {
            this.messageService.error(error.error.message);
          } else {
            this.messageService.error('Chưa có tọa độ vùng ký!');
          }
        },
      );
    }
  }
  SignUSB(dataHash: any): any {
    console.log('dataHash', dataHash);
    const dataRequestList: any = [];

    this.dataHash.forEach((item: any) => {
      dataRequestList.push({
        id: item.id,
        data: item.hashData,
      });
    });

    const dataSign = {
      serial: this.serialData,
      requestList: dataRequestList,
    };

    this.isLoading = true;
    // this.msg.success("Đang xử lý ký file ...");
    this.documentSignService.signUSBTOKENHash(dataSign).subscribe(
      (response: any) => {
        this.isLoading = false;
        if (response.code === 1) {
          console.log('data da ky=', response.data);
          this.dataAttach = [];
          const data = response.data.resultList;
          const dataAttach: any = [];
          data.forEach((res: any) => {
            dataAttach.push({
              id: res.id,
              bucketNameTemp: dataHash.bucketNameTemp,
              objectNameTemp: dataHash.objectNameTemp,
              hash: dataHash.hash,
              fieldName: dataHash.fieldName,
              objectNameSigned: dataHash.objectNameTemp,
              signature: res.data,
              appearances: [
                {
                  tsa: 1,
                  ltv: 1,
                },
              ],
            });
          });

          if (this.logo_sign) {
            this.paramDataSign.logo = this.logo_sign;
            this.paramDataSign.scaleLogo = 1;
          }
          this.dataAttach = dataAttach;
          const datamodel = {
            listFileAttachment: this.listFileAttachment,
            requestId: this.listId[0],
            certificate: response.data.certificate,
            requestList: this.dataAttach,
          };
          console.log('datamodel: ', datamodel);
          this.attachFile(datamodel);
        } else if (response.code === Constants.CERT_EXPIRED) {
          this.messageService.warning('Chứng thư số  hết hiệu lực');
        } else if (response.code === Constants.CERT_REVOKED) {
          this.messageService.warning('Chứng thư số đã bị thu hồi');
        } else if (response.code === Constants.CERT_NOT_TRUST_CHAIN) {
          this.messageService.warning('Chứng thư số là giả mạo');
        } else if (response.code === Constants.CERT_NOT_FOUND_WITH_SERIAL) {
          this.messageService.warning('Không tìm thấy Chứng thư số có SerialNumber với SerialNumber truyền vào');
        } else {
          this.messageService.error('Ký tài liệu không thành công');
        }
      },
      (err) => {
        this.isLoading = false;
        this.messageService.error('Ký tài liệu không thành công');
      },
    );
  }
  attachFile(data: any): any {
    this.isLoading = true;
    this.documentSignService.attachV2(data).subscribe(
      (res: any) => {
        this.detail = '';
        this.isSigned = false;
        this.isLoading = false;
        this.hideBtnSign();
        // tslint:disable-next-line:no-shadowed-variable
        let data: any[] = [];
        res.data.map((item: any) => {
          data = [item.documentId, ...data];
        });
        this.OnLoadDataSigned(data);
        this.messageService.success('Ký tài liệu thành công');
      },
      (err) => {
        this.isLoading = false;
        this.messageService.error('Ký không thành công');
      },
    );
  }
  onOpenDrawSign(): void {
    this.modal = {
      type: 'add',
      item: {},
      isShow: true,
      option: { type: this.item.nextStepSignType },
    };
    this.itemSignModal.initData(this.listDocument, 'draw', { type: this.item.nextStepSignType });
  }

  async signAuthentication(): Promise<Subscription | undefined> {
    this.isLoading = true;

    // Lấy thông tin organization logo
    let logoBase64Image = '';
    let logoUrl = '';
    const response = await this.organizationApiService.getById(this.organizationId).toPromise();

    if (response.code === 200) {
      this.isLoading = false;
      const oResponseData = response.data;
      logoUrl = this.getFileUrl(oResponseData.sealFileId);

      // Create canvas
      const image = new Image();
      // create an empty canvas element
      const canvas = document.createElement('canvas');
      const canvasContext = canvas.getContext('2d');
      image.crossOrigin = 'anonymous';

      image.onload = async () => {
        canvas.width = image.width;
        canvas.height = image.height;

        // draw image into canvas element
        canvasContext?.drawImage(image, 0, 0, image.width, image.height);

        // get canvas contents as a data URL (returns png format by default)
        const dataURL = canvas.toDataURL();
        logoBase64Image = dataURL;

        const listId: string[] = this.listDocument.map((entity: any) => {
          return entity.id;
        });

        const data = {
          listDocumentId: listId,
          base64Image: logoBase64Image,
          signType: this.item.nextStepSignType,
          organizationId: this.organizationId,
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
            this.isLoading = false;
            this.isShowSignResponse = false;
            const dataResult = res.data.map((item: any) => {
              return {
                documentName: item.documentName,
                isSuccess: item.isSuccess,
                message: item.message,
              };
            });
            res.dataResult = dataResult;
            if (res.code === 200) {
              this.isLoading = false;
              this.signResponseModal.initData(res, '');
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
      };
      image.src = logoUrl;
    } else {
      this.isLoading = false;
      this.messageService.error(response.message);
      return;
    }
    return;
  }

  async getDocumentDetailByListId(listId: string[]): Promise<any> {
    const res = await this.documentApiService.getByListId(listId).toPromise();

    if (res.code !== 200) {
      this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
      return;
    }
    if (res.data === null || res.data === undefined) {
      this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
      return;
    }
    this.listDocument = res.data;

    this.getByDocID(this.listDocument[0].id);
    this.getDocumentWFLHistory(this.listDocument[0].id);
    if (this.listDocument.length > 0) {
      this.listDocument[0].show = true;
    }
    return res.data;
  }
  // modal tải tools ký nhắc nhở cắn thiết bị
  showConfirmDowloadToolsSign(): void {
    this.modalService.warning({
      nzTitle: '<i>Thông báo</i>',
      nzContent:
        '<b>Vui lòng tải tools ký và cắn USB TOKEN vào thiết bị để ký tài liệu!<br> <a href="https://drive.google.com/drive/folders/1IbMslzFxLSom9schEqPwyeV6BAWmoez2" target="_blank">Tải tại đây</a></b>',
      nzOnOk: () => this.modal.closeAll,
    });
  }

  getByDocID(id: any): any {
    this.systemLogService.getByDocument(id).subscribe(
      (res: any) => {
        if (res.data && res.data.data) {
          this.dataLog = res.data.data;
          this.dataLog.forEach((item: any) => {
            item.createdDate = new Date(item.createdDate);
          });
          console.log(this.dataLog);
        } else {
          this.messageService.error(res.message);
        }
      },
      (err: any) => {
        console.log(err);
      },
    );
  }

  getDocumentWFLHistory(id: any): any {
    this.documentApiService.getDocumentWFLHistory(id).subscribe(
      (res: any) => {
        this.listDocumentWFLHistory = res.data;
        if (this.listDocumentWFLHistory.length > 0) {
          this.isShowDocWFLHistory = true;
        } else {
          this.isShowDocWFLHistory = false;
        }
      },
      (err: any) => {
        console.log(err);
      },
    );
  }

  zoom_in(): void {
    this.zoom_to = this.zoom_to + 0.1;
  }

  zoom_out(): void {
    this.zoom_to = this.zoom_to - 0.1;
  }
  // 22-9-2021

  approveDocument(listId: any[]): Subscription {
    this.isLoading = true;
    const promise = this.documentApiService.approveDocument(listId).subscribe(
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
        res.data.forEach((element: any) => {
          if (element.result) {
            this.messageService.success(element.message);
          } else {
            this.messageService.error(element.message);
          }
        });

        this.isReloadGrid = true;
        this.handleCancel();
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

  generateImagePreview(listId: any) {
    this.isLoading = true;
    this.documentApiService.generateImagePreview(listId).subscribe(
      (res: any) => {
        this.isLoading = false;
        if (res && res.data) {
          this.messageService.success(`${this.i18n.fanyi('function.document.document-item.create-image-preview.message.success')}`);
        } else {
          this.notification.warning(
            `${this.i18n.fanyi('function.document.modal-item.notify.message.error.title')}`,
            `${this.i18n.fanyi('function.document.document-item.create-image-preview.message.error')}`,
          );
        }
      },
      (err: any) => {
        this.isLoading = false;
        if (err.error) {
          this.notification.error(`${this.i18n.fanyi('function.document.modal-item.notify.message.error.title')}`, `${err.error.message}`);
        } else {
          this.notification.error(`${this.i18n.fanyi('function.document.modal-item.notify.message.error.title')}`, `${err.status}`);
        }
      },
    );
  }
}
