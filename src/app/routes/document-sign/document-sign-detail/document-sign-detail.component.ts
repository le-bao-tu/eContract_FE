import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentApiService, DocumentTemplateApiService } from '@service';

import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { ButtonModel } from '@model';
import { Constants, getUrlDownloadFile, LIST_FONT, LIST_FONT_SIZE, nodeUploadRouter } from '@util';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { catchError } from 'rxjs/operators';
import { SettingModel } from 'src/app/document-meta-data-config/models/setting';
import { DocumentSignService } from 'src/app/services/api/document-sign.service';
import { DocumentInfoSignComponent } from '../document-info-sign/document-info-sign.component';
import { DocumentListCertComponent } from '../document-list-cert/document-list-cert.component';
import { DocumentOtpSignComponent } from '../document-otp-sign/document-otp-sign.component';
@Component({
  selector: 'app-document-sign-detail',
  templateUrl: './document-sign-detail.component.html',
  styleUrls: ['./document-sign-detail.component.less'],
})
export class DocumentSignDetailComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private elem: ElementRef,
    private fb: FormBuilder,
    private settingsService: SettingsService,
    public http: _HttpClient,
    private msg: NzMessageService,
    private documentSignService: DocumentSignService,
    private modal: NzModalService,
  ) {
    this.form = fb.group({
      account: [this.route.snapshot.queryParams.email, [Validators.required]],
      otp: [this.route.snapshot.queryParams.otp, [Validators.required]],
    });
    this.app = this.settingsService.getData('app');
    ///
    this.btnSign = {
      title: 'KÝ',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.save(0);
      },
    };
    this.btnSignUSB = {
      title: 'KÝ USB Token',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.save(1);
      },
    };
    this.btnCancel = {
      title: 'TỪ CHỐI',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.onRejectDoc();
      },
    };
  }
  get account(): AbstractControl {
    return this.form.controls.account;
  }
  get otp(): AbstractControl {
    return this.form.controls.otp;
  }
  showPage = false;
  checkboxAccess = true;
  paramDataSign: any = {};
  fileBase64: any;
  data_get_document: any;
  showBtn = false;
  scaleImage: any = 0;
  scaleText: any = 0;
  scaleLogo: any = 0;
  @ViewChild(DocumentInfoSignComponent, { static: false }) itemSignModal!: { initData: (arg0: {}, arg1: string, userId: string) => void };
  @ViewChild(DocumentOtpSignComponent, { static: false }) itemModalOTP!: { initData: (arg0: number, list?: any) => void };
  @ViewChild(DocumentListCertComponent, { static: false }) itemModalCert!: { initData: (arg0: {}) => void };
  data_image: any;
  access_Sign: any;
  modalShow: any = {
    type: '',
    item: {},
    isShow: false,
    option: {},
  };
  lstCert: any;
  signatureType: any;
  showAll = false;
  msgOTP = true;
  // from access
  links = [];
  app: any;
  form: FormGroup;
  error = '';
  type = 0;
  count = 0;
  interval$: any;
  id = '';
  private sub: any;
  tittle = 'Chi tiết hợp đồng';
  listItemSetting: SettingModel[] = [];
  listItemSettingCurrentPage: SettingModel[] = [];
  listMetaData: any[] = [];
  templateConfig: any;
  tempId = 0;
  detail: any;
  logo_sign: any;
  isLoading = false;
  fileUrl: any;
  documentId: any;
  userId: any;
  PDF_BORDER_PAGE = 9;

  selectedFont = 'Times New Roman';
  listFont = LIST_FONT;
  selectedFontSize = 14;
  listFontSize = LIST_FONT_SIZE;
  // option: any; Liên quan tới app-config-item
  selectedFontWeight = 'normal';
  selectedFontStyle = 'normal';
  selectedTextDecoration = 'none';
  selectedTextAlign = 'left';
  selectedColor = '#000000';

  // @ViewChild('pdfContainer') pdfViewer!: ElementRef; Liên quan tới app-config-item
  outSize = false;
  currentPage = 1;
  totalPage = 0;
  btnSign: ButtonModel;
  btnSignUSB: ButtonModel;
  btnCancel: ButtonModel;
  typeSign: any;
  thumbnail: any[] = [];
  dataCoordinate: any;
  buckename: any;
  objectName: any;
  documentCode: any;
  documentFileId: any;

  serialData: any;
  dataHash: any;

  refreshOptionDefault(): void {
    this.selectedFontSize = 14;
    this.selectedFont = 'Times New Roman';
    this.selectedFontWeight = 'normal';
    this.selectedFontStyle = 'normal';
    this.selectedTextDecoration = 'none';
    this.selectedTextAlign = 'left';
    this.selectedColor = '#000000';
  }
  onClick(event: any): any {
    this.outSize = true;
  }

  onSelectedItem(event: any): void {
    if (event.isSelected === true) {
      this.selectedFontSize = event.fontSize;
      this.selectedFont = event.font;
      this.selectedFontWeight = event.fontWeight;
      this.selectedFontStyle = event.fontStyle;
      this.selectedTextDecoration = event.textDecoration;
      this.selectedTextAlign = event.textAlign;
      return;
    }
    this.refreshOptionDefault();
  }
  onPageChange(event: any, i: number, itempage: number): void {
    if (i === 2) {
      this.currentPage = parseInt(event);
    } else {
      this.currentPage = this.currentPage + i;
      if (this.currentPage < 1) {
        this.currentPage = 1;
      } else if (this.currentPage > this.totalPage) {
        this.currentPage = this.totalPage;
      } else if (i === 0) {
        this.currentPage = itempage;
      }
    }
    this.onChangeItemOnPage();
  }

  onChangeItemOnPage(): void {
    this.listItemSettingCurrentPage = this.listItemSetting.filter((x) => x.page === this.currentPage);

    const elements = this.elem.nativeElement.querySelectorAll('.canvasWrapper');

    const clientHeight = elements[0]?.clientHeight;
    const clientWidth = elements[0]?.clientWidth;

    this.listItemSettingCurrentPage.forEach((element, index) => {
      const temp = clientHeight / element.pageHeight;
      if (temp) {
        element.pageHeight = element.pageHeight * temp;
        element.pageWidth = element.pageWidth * temp;
        element.pageWidth = element.pageWidth * temp;
        element.height = element.height * temp;
        element.width = element.width * temp;
        element.llx = (element.llx - this.PDF_BORDER_PAGE) * temp + this.PDF_BORDER_PAGE;
        element.lly = (element.lly + this.PDF_BORDER_PAGE) * temp - this.PDF_BORDER_PAGE;
      }
    });
    let c1 = 0;
    let c2 = 0;
    let c3 = 0;
    this.listItemSettingCurrentPage.forEach((x) => {
      if (x.signType !== 0 && x.signType !== undefined && x.signType !== null) {
        if (x.signType === 1) {
          x.position = ++c1;
        } else if (x.signType === 2) {
          x.position = ++c2;
        } else {
          x.position = ++c3;
        }
      }
    });
  }

  ngOnInit(): void {}
  submit(): void {
    this.isLoading = true;
    this.error = '';
    if (this.type === 0) {
      this.account.markAsDirty();
      this.account.updateValueAndValidity();
      this.otp.markAsDirty();
      this.otp.updateValueAndValidity();
      if (this.account.invalid || this.otp.invalid) {
        this.isLoading = false;
        return;
      }
    }
    const dataDocument = {
      documentCode: this.route.snapshot.queryParams.code,
      account: this.account.value,
      otp: this.otp.value,
    };
    // Lấy tài liệu
    this.documentSignService.getDocument(dataDocument).subscribe(
      (res: any) => {
        this.isLoading = false;
        // console.log();
        this.data_get_document = res.data;
        this.showPage = true;
        this.documentId = res.data.documentId;
        this.userId = res.data.userId;
        this.buckename = res.data.listDocumentFile[0].buckename;
        this.objectName = res.data.listDocumentFile[0].objectName;
        this.documentCode = res.data.documentCode;
        this.documentFileId = res.data.listDocumentFile[0].documentFileId;
        this.updateFileUrl(this.buckename, this.objectName);
        this.bindingCoordinate(this.documentId);
      },
      (error: any) => {
        this.isLoading = false;
        if (error.status === 400) {
          this.error = 'Mã OTP không hợp lệ!';
        } else {
          this.error = error.error.message;
        }
      },
    );
    // Lấy tọa độ
  }
  bindingCoordinate(id: any): any {
    this.documentSignService.getCoordinate(id).subscribe(
      (res: any) => {
        if (res.code === 200) {
          const data = res.data;
          this.dataCoordinate = {
            llx: data.llx,
            lly: data.lly,
            urx: data.urx,
            ury: data.ury,
            page: data.page,
          };
        }
      },
      (error) => {
        if (error.error.code === 500) {
          this.msg.error(error.error.message);
        } else {
          this.msg.error('Chưa có tọa độ vùng ký!');
        }
      },
    );
  }
  afterPdfLoadComplete(event: any): void {
    this.totalPage = event?.numPages;
    this.listItemSettingCurrentPage = [];

    setTimeout(() => {
      this.onChangeItemOnPage();
    }, 1000);
  }

  pageInitialized(event: any): void {}

  updateFileUrl(buckename: string, objectName: string): any {
    this.documentSignService.getUrlDownloadFileBase64(buckename, objectName).subscribe(
      (res: any) => {
        this.fileUrl = `data:@file/pdf;base64,` + res.data.fileData;
        this.fileBase64 = res.data.fileData;
      },
      (err: any) => {
        this.msg.error('tải tài liệu không thành công!');
      },
    );
  }
  pageRendered(event: any): void {
    // if (this.thumbnail.length >= this.totalPage) {
    //   this.showAll = false;
    // } else {
    this.thumbnail.push({
      page: event.pageNumber,
      url: event.source.canvas.toDataURL(),
    });

    if (event.pageNumber === this.totalPage) {
      this.showAll = true;
    }

    this.onChangeItemOnPage();
  }

  textLayerRendered(event: any): void {}
  onPdfError(event: any): void {}
  onItemSettingUpdate(setting: any): void {
    this.listItemSetting.forEach((item) => {
      if (item.tempMetaDataId === setting.tempMetaDataId) {
        Object.assign(item, setting);
      }
    });
    this.onChangeItemOnPage();
  }
  save(type: any): void {
    // Kiểm tra đã chọn vào đồng ý ký tài liệu chưa
    if (this.checkboxAccess) {
      this.signatureType = type;
      this.itemSignModal.initData([type], 'draw', this.userId); // (document-info-sign)
    } else {
      this.msg.warning('Vui lòng chọn đồng ý ký để thực hiện ký tài liệu!');
    }
  }

  getOTP(): any {
    const code = this.route.snapshot.queryParams.code;
    this.documentSignService.sendOTPAccessDocument(code).subscribe(
      (res: any) => {
        this.msgOTP = false; // show dòng thông báo dưới ô input để thông báo khi gửi mã otp lại
        this.msg.success('Gửi OTP thành công vui lòng kiểm tra email');
      },
      (error: any) => {
        this.msgOTP = true; // hinden dòng thông báo dưới ô input để thông báo khi gửi mã otp lại
        this.msg.error('Gửi OTP không thành công');
        this.error = error.error.message;
      },
    );
  }

  getOTPSign(): any {
    const code = this.route.snapshot.queryParams.code;
    this.documentSignService.sendOTP(code).subscribe(
      (res: any) => {
        this.msgOTP = false; // show dòng thông báo dưới ô input để thông báo khi gửi mã otp lại
        this.msg.success('Gửi OTP thành công vui lòng kiểm tra tin nhắn');
      },
      (error: any) => {
        this.msgOTP = true; // hinden dòng thông báo dưới ô input để thông báo khi gửi mã otp lại
        this.msg.error('Gửi OTP không thành công');
        this.error = error.error.message;
      },
    );
  }

  // Kết quả trả về từ modal vẽ chữ ký (document-info-sign)
  onModalEventEmmitSign(event: any): void {
    this.detail = '';
    this.modalShow.isShow = false;
    this.data_image = event.dataResult;
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
        // Kiểm tra chứng thư số trước khi ký
        this.checkCert();
      }
      // Nếu chọn ký số HSM hoặc Ký Điện tử
      if (this.signatureType === 0) {
        this.typeSign = Constants.SIGN_DIG;
        // b2: Bật Modal để nhập OTP
        this.itemModalOTP.initData(Constants.SIGN_DIG, ''); // (document-otp-sign)
        // b3: Gọi hàm gửi OTP về mail
        this.getOTPSign();
      }
      //  else if (this.signatureType === 2) {
      //   this.isLoading = true;
      //   this.typeSign = Constants.SIGN_HSM;
      //   // b2: Bật Modal để nhập PiN
      //   if (this.listHSM.length > 1) {
      //     //nếu có nhiều HSM
      //     this.itemModalOTP.initData(Constants.SIGN_HSM,""); // (document-otp-sign)
      //   } else if (this.listHSM.length == 1) {
      //     // Nếu có 1 HSM
      //     if (this.listHSM[0].isDefault == true && this.listHSM[0].isHasUserPIN == true) {
      //       // Nếu có Đầy đủ thông tin Ký luôn
      //       this.onSignHSM({ hsmAcountId: this.listHSM[0].id, userPin: '' });
      //     } else {
      //       // Nếu thiếu thông tin gì đó
      //       this.itemModalOTP.initData(Constants.SIGN_HSM, this.listHSM); // (document-otp-sign)
      //     }
      //   }
      //   //
      // }
      // // Nếu chọn ký số HSM hoặc Ký Điện tử
      // if (this.signatureType === Constants.SIGN_DIG_OR_HSM) {
      //   // Hàm kiểm tra có chứng thư số HSM hay không
      //   // this.certificateService.checkCertHSM(this.route.snapshot.queryParams.email).subscribe(
      //   //   (res: any) => {
      //   //     if (res.code === 200) {
      //   //       if (res.data === false) {
      //   // b1: Gán Loại ký điện tử
      //   this.typeSign = Constants.SIGN_DIG;
      //   // b2: Bật Modal để nhập OTP
      //   this.itemModalOTP.initData(Constants.SIGN_DIG); // (document-otp-sign)
      //   // b3: Gọi hàm gửi OTP về mail
      //   this.getOTP();
      //   //     } else {
      //   //       // b1: Gán Loại ký Số HSM
      //   //       this.typeSign = Constants.SIGN_HSM;
      //   //       // b3: Bật Modal để nhập PIN vì không cần OTP
      //   //       this.itemModalOTP.initData(Constants.SIGN_HSM); // (document-otp-sign)
      //   //     }
      //   //   }
      //   // },
      //   // (error: any) => {
      //   //   if (error.error.code === 500) {
      //   //     this.msg.error(error.error.message);
      //   //   } else {
      //   //     this.msg.error('Kiểm tra không thành công');
      //   //   }
      //   // },
      //   // );
      // }
    }
  }
  hideBtnSign(): any {
    this.btnSign.visible = false;
    this.btnSignUSB.visible = false;
    this.btnCancel.visible = false;
  }
  // Kết quả trả về từ modal Nhập OTP or PIN(document-otp-sign)
  onModalEventEmmitOTP(event: any): void {
    this.modalShow.isShow = false;
    if (event.type === 'access_Sign') {
      // Xác nhận ký từ Compoent (OTP - PIN)=> document-otp-sign
      this.access_Sign = event.dataResult.toString();
      // Nếu typeSign=1  từ hàm Kiểm tra chứng thư số HSM thì ký Số HSM
      if (this.typeSign === Constants.SIGN_HSM) {
        this.onSignHSM(event.dataResult);
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
            this.msg.error(res.data);
          },
          (error) => {
            if (error.error.code === 500) {
              this.msg.error(error.error.message);
            } else {
              this.msg.error('Từ chối ký không thành công');
            }
          },
        );
    }
    // Nếu Chọn gửi lại mã trong MÀn hình xác thực OTP
    if (event.type === 'sendOTP') {
      this.getOTPSign();
    }
  }

  // Kết quả trả về từ modal Chọn chứng thư số(document-list-cert)
  onModalEventEmmitCert(event: any): void {
    // this.modalShow.isShow = false;
    if (event.type === 'access_Sign') {
      // Nếu có chứng thư số thì ký bằng chứng thư số
      if (event.dataResult != null || event.dataResult !== undefined) {
        this.getHash(event.dataResult);
        this.modalShow.isShow = false;
      }
    } else {
      this.modalShow.isShow = false;
    }
  }
  // Ký điện tử
  onSignDigital(): any {
    // const modelData = {
    //   documentCode: this.route.snapshot.queryParams.code,
    //   otp: this.access_Sign,
    //   signatureBase64: this.data_image,
    // };
    const modelData = {
      listDocumentId: [this.documentId],
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
    };
    this.isLoading = true;
    this.documentSignService.signDigitalMail(modelData).subscribe(
      (res: any) => {
        if (res.code === 200) {
          this.isLoading = false;
          this.showAll = false;
          this.thumbnail = [];
          this.msg.success('Ký tài liệu thành công');
          this.hideBtnSign();
          const dataResult = res.data[0].listFileSignedResult[0];
          this.updateFileUrl(dataResult?.bucketNameSigned, dataResult?.objectNameSigned);
        } else {
          this.isLoading = false;
          this.msg.error('Ký tài liệu thất bại');
        }
      },
      (error: any) => {
        this.isLoading = false;
        console.log(error);
        if (error.error.code === 500) {
          this.msg.error(error.error.message);
        } else {
          this.msg.error('Ký tài liệu không thành công');
        }
      },
    );
  }
  // Ký số HSM
  onSignHSM(pin: any): any {
    const modelData = {
      documentCode: this.route.snapshot.queryParams.code,
      pin: this.access_Sign,
      userPin: pin,
      base64Image: this.data_image,
    };
    this.documentSignService.signHSM(modelData).subscribe(
      (res: any) => {
        if (res.code === 200) {
          this.hideBtnSign();
          this.msg.success('Ký tài liệu thành công');
        } else {
          this.msg.error('Ký tài liệu thất bại');
        }
      },
      (error: any) => {
        if (error.error.code === 500) {
          this.msg.error(error.error.message);
        } else {
          this.msg.error('Ký tài liệu không thành công');
        }
      },
    );
  }

  // Kiểm tra chứng thư số
  checkCert(): any {
    this.documentSignService
      .checkCert()
      .pipe(
        catchError((err) => {
          this.showConfirmDowloadToolsSign();
          throw err;
        }),
      )
      .subscribe(
        (response: any) => {
          if (response.code === 1) {
            this.lstCert = response.data;
            this.itemModalCert.initData(this.lstCert); // (document-list-cert)
          } else {
            // Nếu không có chứng thư số thì sẽ tự động chuyển sang ký điện tử
            this.itemModalOTP.initData(Constants.SIGN_DIG); // (document-otp-sign)
          }
        },
        (error: any) => {
          if (error.error.code === 500) {
            this.msg.error(error.error.message);
          }
        },
      );
  }
  getHash(dataSerial: any): any {
    if (dataSerial != null) {
      const setHash = {
        certificate: dataSerial.certificate,
        requestList: [
          {
            id: this.documentFileId,
            bucketName: this.buckename,
            objectName: this.objectName,
            appearances: [
              {
                isVisible: true,
                page: +this.dataCoordinate?.page,
                llx: +this.dataCoordinate?.llx,
                lly: +this.dataCoordinate?.lly,
                urx: +this.dataCoordinate?.urx,
                ury: +this.dataCoordinate?.ury,
                imageData:
                  this.scaleImage > 0 || (this.scaleLogo === 0 && this.scaleText === 0 && this.scaleImage === 0) ? this.data_image : '',
                logo: this.scaleLogo > 0 ? this.logo_sign : '',
                detail: this.scaleText > 0 ? this.detail : '',
                signLocation: 'Hà Nội',
                contact: '',
                tsa: 1,
                ltv: 1,
                certify: 0,
                scaleImage: this.scaleImage,
                scaleText: this.scaleText,
                scaleLogo: this.scaleLogo,
                reason: 'Tôi đã đọc, hiểu, đồng ý ký hợp đồng.',
                mail: this.route.snapshot.queryParams.email,
                phone: null,
              },
            ],
          },
        ],
      };
      // console.log(setHash);
      this.serialData = dataSerial.serial;
      this.isLoading = true;
      this.documentSignService.getHashMail(setHash).subscribe(
        (res: any) => {
          this.isLoading = false;
          this.dataHash = res.data.resultList;
          this.SignUSB(this.dataHash[0].data);
        },
        (error: any) => {
          this.isLoading = false;
          if (error.error.code === 500) {
            this.msg.error(error.error.message);
          }
        },
      );
    }
  }

  SignUSB(dataHash: any): any {
    if (dataHash != null) {
      const dataSign = {
        serial: this.serialData,
        requestList: [
          {
            id: this.documentFileId,
            data: dataHash,
          },
        ],
      };
      // this.msg.success("Đang xử lý ký file ...");
      this.isLoading = true;
      this.documentSignService.signUSBTOKENHash(dataSign).subscribe(
        (response: any) => {
          if (response.code === 1) {
            const dtHash = this.dataHash.find((item: any) => item.id === this.documentFileId);

            const dataAttach = {
              certificate: response.data.certificate,
              requestList: [
                {
                  id: this.documentFileId,
                  bucketNameTemp: dtHash?.bucketNameTemp,
                  objectNameTemp: dtHash?.objectNameTemp,
                  hash: dtHash.hash,
                  fieldName: dtHash.fieldName,
                  objectNameSigned: dtHash?.objectNameTemp,
                  signature: response.data.resultList[0].data,
                  appearances: [
                    {
                      tsa: 1,
                      ltv: 1,
                    },
                  ],
                },
              ],
            };
            this.isLoading = true;
            // this.msg.success("Đang xử lý đính chữ ký vào file ...");
            this.documentSignService.attachMail(dataAttach).subscribe(
              (res: any) => {
                this.isLoading = false;
                this.thumbnail = [];
                this.showAll = false;

                this.hideBtnSign();
                const data = res.data[0].listFileSignedResult[0];
                this.updateFileUrl(data.bucketNameSigned, data.objectNameSigned);
                this.msg.success('Ký thành công');
                this.showBtn = true;
              },
              (err) => {
                this.isLoading = false;
                this.msg.error('Ký không thành công');
              },
            );
          } else if (response.code === Constants.CERT_EXPIRED) {
            this.msg.warning('Chứng thư số  hết hiệu lực');
          } else if (response.code === Constants.CERT_REVOKED) {
            this.msg.warning('Chứng thư số đã bị thu hồi');
          } else if (response.code === Constants.CERT_NOT_TRUST_CHAIN) {
            this.msg.warning('Chứng thư số là giả mạo');
          } else if (response.code === Constants.CERT_NOT_FOUND_WITH_SERIAL) {
            this.msg.warning('Không tìm thấy Chứng thư số có SerialNumber với SerialNumber truyền vào');
          } else {
            this.msg.error('Ký tài liệu không thành công');
          }
        },
        (err) => {
          this.msg.error('Ký tài liệu không thành công');
        },
      );
    }
  }

  onRejectDoc(): any {
    this.itemModalOTP.initData(Constants.REJECT_DOC); // (document-otp-sign)
  }
  // modal tải tools ký nhắc nhở cắn thiết bị
  showConfirmDowloadToolsSign(): void {
    this.modal.warning({
      nzTitle: '<i>Thông báo</i>',
      nzContent:
        '<b>Vui lòng tải tools ký và cắn USB TOKEN vào thiết bị để ký tài liệu!<br> <a href="https://drive.google.com/drive/folders/1IbMslzFxLSom9schEqPwyeV6BAWmoez2" target="_blank">Tải tại đây</a></b>',
      nzOnOk: () => this.modal.closeAll,
    });
  }
}
