import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ACLService } from '@delon/acl';
import { ButtonModel } from '@model';
import { DocumentApiService, UserSignConfigApiService } from '@service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, Observer, Subscription } from 'rxjs';

import { environment } from '@env/environment';
import { cleanForm, getUrlDownloadFile, nodeUploadRouter } from '@util';

import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';

import 'fabric';
import { NzUploadFile } from 'ng-zorro-antd/upload';
declare const fabric: any;
@Component({
  selector: 'app-document-info-sign',
  templateUrl: './document-info-sign.component.html',
  styleUrls: ['./document-info-sign.component.scss'],
})
export class DocumentInfoSignComponent implements OnInit {
  // @Input() item: any;
  @Input() isVisible = false;
  @Input() userId = '';
  // @Input() option: any;
  @Output() eventEmmit = new EventEmitter<any>();

  listDocument: any[] = [];

  moduleName = 'CHỮ KÝ TAY';

  title = 'CHỮ KÝ TAY';

  btnReset: ButtonModel;
  btnSave: ButtonModel;
  btnCancel: ButtonModel;
  btnUpload: ButtonModel;

  canvas: any;
  isLoading = false;
  option: any = {};
  type = '1';
  signText = '';
  listSignOfUser: any[] = [];
  fileToUpload: File | any;
  ratio: any = 1;
  imageWidth: any = 300;
  imageHeight: any = 160;
  idSign: any;
  signSelected: any;
  listInfoSignIndex: any[] = [];
  uploadUrl = environment.API_URL + nodeUploadRouter.uploadDocumentFileTemplateBinary + '?bucketName=draftAttachment';
  headerUploadFile = {};
  listFileAttachment: any[] = [];
  fileUploadError = '';
  isErrorUpload = false;
  fileList: NzUploadFile[] = [];
  uploadFile: any = {
    id: undefined,
    uid: null,
    name: null,
    status: 'done',
    url: null,
    filename: null,
  };
  documentId: any;

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private documentApiService: DocumentApiService,
    private aclService: ACLService,
    private userSignConfigService: UserSignConfigApiService,
    private notification: NzNotificationService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
  ) {
    const token = tokenService.get()?.token;
    if (token) {
      this.headerUploadFile = {
        Authorization: 'Bearer ' + token,
      };
    }

    this.btnReset = {
      title: 'Vẽ lại',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.resetCanvas();
      },
    };

    this.btnSave = {
      title: 'Ký',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.processingWorkflow();
      },
    };

    this.btnCancel = {
      title: 'Đóng',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.handleCancel();
      },
    };

    this.btnUpload = {
      title: 'Tải file lên',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {},
    };
  }

  closeModalReloadData(data: any): void {
    this.isVisible = false;
    this.eventEmmit.emit({ type: 'success', dataResult: data, listInfoSignIndex: this.listInfoSignIndex, signSelected: this.signSelected });
  }

  handleCancel(): void {
    if (this.isLoading) {
      return;
    }
    this.isVisible = false;
    this.eventEmmit.emit({ type: 'close' });
  }

  onChangeRadioType(value: any): void {
    this.signText = '';
    this.canvas.clear();
    switch (value) {
      case '1':
        this.canvas.isDrawingMode = true;
        this.canvas.freeDrawingBrush.width = 2;
        this.onChangeSign(this.idSign);
        break;
      case '2':
        this.canvas.isDrawingMode = false;
        break;
      case '3':
        this.canvas.isDrawingMode = false;
        break;
      default:
        break;
    }
  }
  // Lấy cấu hình ký của người dùng
  fetchListSignOfUser(): Subscription {
    const rs = this.userSignConfigService.getListComboboxSign(this.userId).subscribe(
      (res: any) => {
        if (res.code !== 200) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        this.listSignOfUser = res.data;
        const length = this.listSignOfUser.length;
        if (length === 1) {
          this.idSign = this.listSignOfUser[0].id;
          if (this.idSign) {
            this.onChangeSign(this.idSign);
          }
        }
        if (length > 1) {
          const signDefault = this.listSignOfUser.filter((x) => x.isSignDefault === true);
          if (signDefault.length) {
            this.idSign = signDefault[0].id;
            this.onChangeSign(this.idSign);
          }
        }
      },
      (err: any) => {
        this.notification.error(`Có lỗi xảy ra`, `${err.error.message}`);
      },
    );
    return rs;
  }
  onChangeSign(event: any) {
    console.log('event: ', event);
    this.canvas.clear();
    const item = this.listSignOfUser.filter((x) => x.id === event);
    if (item.length > 0) {
      this.signSelected = item[0];
      const list = JSON.parse(item[0].listSignInfoJson);
      if (list.length > 0) {
        list.map((item: any) => {
          if (item.value === true) {
            this.listInfoSignIndex.push(item.index);
          }
        });
      }
      const image = new Image();
      image.src = item[0].imageFileBase64;
      image.onload = (i: any) => {
        // Lấy kích thước thật của ảnh
        this.imageWidth = i.target.naturalWidth;
        this.imageHeight = i.target.naturalHeight;
        // Tính tỷ lệ kích thước thật của ảnh với kích thước mặc định khung canvas
        this.ratio = 250 / i.target.naturalWidth;
      };

      const data = item[0].imageFileBase64;
      fabric.Image.fromURL(data, (img: any) => {
        const oImg = img.set({ left: 0, top: 0, angle: 0, width: this.imageWidth, height: this.imageHeight }).scale(1);
        this.canvas.add(oImg).renderAll();
        this.canvas.setActiveObject(oImg);
      });
    }
  }
  onChangeSignText(value: any): void {
    this.canvas.clear();
    if (!value) {
      return;
    }
    // Define an array with all fonts
    const textbox = new fabric.Textbox(value, {
      left: 0,
      top: 0,
      fontSize: 40,
      fontFamily: 'Times New Roman',
      fill: '#1d2df1',
    });
    this.canvas.add(textbox).setActiveObject(textbox);
    this.canvas.getActiveObject().set('fontFamily', 'Times New Roman');
    this.canvas.renderAll();
  }

  resetCanvas(): void {
    this.canvas.clear();
    this.onChangeSign(this.idSign);
    // fabric.Image.fromURL('../../../../../assets/tmp/img/Seal/SAVIS_GROUP_SEAL.png', (img: any) => {
    //   const seal = img.set({
    //     top: 5,
    //     left: 0,
    //     cornerSize: 8,
    //     transparentCorners: false,
    //     hasRotatingPoint: false,
    //     selectable: false,
    //     hasControls: false,
    //     id: 'seal',
    //   });
    //   img.scaleToWidth(150);
    //   img.scaleToHeight(150);

    //   this.canvas.add(seal);
    //   this.canvas.renderAll();
    // });
  }

  getObjectFromCanvasById(id: any): void {
    const canvasObject = this.canvas.getObjects().filter((item: any) => {
      return item.id === id;
    });
    return canvasObject[0];
  }

  removeObjectFromCanvas(name: any): void {
    const canvasObject = this.getObjectFromCanvasById(name);
    this.canvas.remove(canvasObject);
  }

  handleFileInput(files: FileList): void {
    this.canvas.clear();
    this.fileToUpload = files.item(0);

    const reader = new FileReader();
    reader.onload = (f: any) => {
      const image = new Image();
      image.src = f.target.result;
      image.onload = (i: any) => {
        // Lấy kích thước thật của ảnh
        this.imageWidth = i.target.naturalWidth;
        this.imageHeight = i.target.naturalHeight;
        // Tính tỷ lệ kích thước thật của ảnh với kích thước mặc định khung canvas
        this.ratio = 250 / i.target.naturalWidth;
      };

      const data = f.target.result;
      fabric.Image.fromURL(data, (img: any) => {
        const oImg = img.set({ left: 0, top: 0, angle: 0, width: this.imageWidth, height: this.imageHeight }).scale(this.ratio);
        this.canvas.add(oImg).renderAll();
        this.canvas.setActiveObject(oImg);
      });
    };
    reader.readAsDataURL(this.fileToUpload);
  }

  ngOnInit(): void {
    this.initRightOfUser();
  }

  initRightOfUser(): void {
    this.btnUpload.grandAccess = this.aclService.canAbility('DOCUMENT_UPLOAD_ATTACHMENT');
  }

  initCanvas() {
    setTimeout(() => {
      this.canvas = new fabric.Canvas('canvas-draw', {
        isDrawingMode: true,
      });
      this.canvas.freeDrawingBrush.color = '#002ABE';
      this.canvas.freeDrawingBrush.width = 2.5;
      this.fetchListSignOfUser();
    }, 500);
  }
  public initData(data: any[], type: any = null, userId: string = ''): void {
    this.listFileAttachment = [];
    this.listInfoSignIndex = [];
    this.initCanvas();
    this.userId = userId;
    this.isVisible = true;
    this.type = '1';
    this.listDocument = data;
    this.signSelected = null;
  }

  handleFileChange(data: any): void {
    if (data.type === 'success') {
      this.listFileAttachment.push({
        objectName: data.file?.response?.data?.objectName,
        bucketName: data.file?.response?.data?.bucketName,
      });

      this.fileList = [data.file];
      this.uploadFile.Id = data.file?.response?.data?.Id;
      this.uploadFile.userId = data.file?.response?.data?.userId;
      this.uploadFile.fileBucketName = data.file?.response?.data?.bucketName;
      this.uploadFile.fileObjectName = data.file?.response?.data?.objectName;
      this.uploadFile.fileType = data.file?.response?.data?.fileType;
      this.uploadFile.filename = data.file?.response?.data?.fileName;

      this.fileUploadError = '';
      this.isErrorUpload = false;
    } else {
      this.fileUploadError = data.file?.error?.error?.message;
      this.isErrorUpload = true;
    }
  }

  processingWorkflow(): void {
    this.isLoading = true;
    const dataURL = this.canvas.toDataURL('image/png');

    /*
    const listId: string[] = this.listDocument.map((entity: any) => {
      return entity.id;
    });

    const data = {
      listDocumentId: listId,
      base64Image: dataURL,
      signType: this.option.type,
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
        const dataResult = res.data;
        console.log(dataResult);
        this.closeModalReloadData(dataResult);
      },
      (err: any) => {
        if (err.error) {
          this.notification.error(`Có lỗi xảy ra`, `${err.error.message}`);
        } else {
          this.notification.error(`Có lỗi xảy ra`, `${err.status}`);
        }
      },
    );
     */
    const model = {
      dataUrl: dataURL,
      listFileAttachment: this.listFileAttachment,
    };
    this.closeModalReloadData(model);
    this.isLoading = false;
    this.idSign = '';
    return dataURL;
  }
}
