import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ACLService } from '@delon/acl';
import { ButtonModel } from '@model';
import { DocumentApiService } from '@service';
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
  selector: 'app-document-sign',
  templateUrl: './document-sign.component.html',
  styleUrls: ['./document-sign.component.less'],
})
export class DocumentSignComponent implements OnInit {
  // @Input() item: any;
  @Input() isVisible = false;
  // @Input() option: any;
  @Output() eventEmmit = new EventEmitter<any>();

  listDocument: any[] = [];

  moduleName = 'CHỮ KÝ TAY';

  title = 'CHỮ KÝ TAY';

  btnReset: ButtonModel;
  btnSave: ButtonModel;
  btnCancel: ButtonModel;

  canvas: any;
  isLoading = false;
  option: any = {};

  type = '1';
  signText = '';

  fileToUpload: File | any;
  ratio: any = 1;
  imageWidth: any = 300;
  imageHeight: any = 160;

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private documentApiService: DocumentApiService,
    private aclService: ACLService,
    private notification: NzNotificationService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
  ) {
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
  }

  closeModalReloadData(data: any): void {
    this.isVisible = false;
    this.eventEmmit.emit({ type: 'success', dataResult: data });
  }

  getFileUrl(id: string): string {
    return getUrlDownloadFile('', '');
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
    // this.btnSave.grandAccess = this.aclService.canAbility('UNIT-CREATE');
    // this.btnEdit.grandAccess = this.aclService.canAbility('UNIT-EDIT');
    // this.btnSaveAndCreate.grandAccess = this.aclService.canAbility('UNIT-CREATE');
  }

  public initData(data: any[], type: any = null, option: any = {}): void {
    this.isVisible = true;
    this.listDocument = data;
    this.option = option;
    // if (option.type === 1) {
    //   this.btnSave.title = 'Ký chứng thực';
    // } else if (option.type === 2) {
    //   this.btnSave.title = 'Ký phê duyệt';
    // } else {
    //   this.btnSave.title = 'Ký review';
    // }
    setTimeout(() => {
      this.canvas = new fabric.Canvas('canvas-draw', {
        isDrawingMode: true,
      });

      this.canvas.freeDrawingBrush.color = '#002ABE';
      this.canvas.freeDrawingBrush.width = 2.5;

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
    }, 500);
  }

  processingWorkflow(): Subscription {
    this.isLoading = true;
    const dataURL = this.canvas.toDataURL('image/png');
    // console.log(dataURL);

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
    return promise;
  }
}
