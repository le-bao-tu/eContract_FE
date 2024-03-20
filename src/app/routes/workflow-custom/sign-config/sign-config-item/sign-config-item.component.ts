import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { I18NService } from '@core';
import { ACLService } from '@delon/acl';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { environment } from '@env/environment';
import { ButtonModel, QueryFilerModel } from '@model';
import { UserSignConfigApiService } from '@service';
import { DeleteModalComponent } from '@shared';
import {
  LIST_SIGN_INFO,
  LIST_STATUS,
  nodeUploadRouter,
  OVERLAY_LOADING_TEMPLATE,
  OVERLAY_NOROW_TEMPLATE,
  QUERY_FILTER_DEFAULT,
  REGEX_CODE,
  ROLE_SYS_ADMIN,
} from '@util';
import 'fabric';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import PerfectScrollbar from 'perfect-scrollbar';
import { Subscription } from 'rxjs';
import { DocumentSignService } from 'src/app/services/api/document-sign.service';
declare const fabric: any;
@Component({
  selector: 'app-sign-config-item',
  templateUrl: './sign-config-item.component.html',
  styleUrls: ['./sign-config-item.component.less'],
})
export class SignConfigItemComponent implements OnInit, AfterViewInit {
  signPreview: SafeHtml = '<div class="container-sign-preview"></div>';
  imageBase64Preview = '';
  logoBase64Preview = '';
  fileUploadUrl = environment.API_URL + nodeUploadRouter.uploadFileUnsave;

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
  canvas: any;
  canvasLogo: any;
  form: FormGroup;
  moduleName = 'cấu hình mẫu chữ ký';
  modules = [ClientSideRowModelModule];
  checkSysAdmin = false;
  isInfo = false;
  isEdit = false;
  isAdd = false;
  tittle = 'Cấu hình mẫu chữ ký';
  defaultSrc = '../../../..//../assets/tmp/img/upload.png';
  bucketName = '';
  objectName = '';
  fileName = '';
  userId = '';
  userName = '';
  isCheckboxChecked = false;
  signType: any[] = [];
  logoFileBase64: any;
  imageFileBase64: any;
  isLoading = false;
  isReloadGrid = false;
  fileList: any[] = [];
  isShowDelete = false;
  isLoadingDelete = false;
  id: any;
  signAppearanceLogo = false;
  signAppearanceImage = false;
  uploadUrl = environment.API_URL + nodeUploadRouter.uploadFileBinary;
  isSignDefault = false;
  btnSave: ButtonModel;
  btnClose: ButtonModel;
  btnCancel: ButtonModel;
  btnEdit: ButtonModel;
  listSignInfo: any[] = LIST_SIGN_INFO;

  code = '';
  scaleImage = 0;
  scaleText = 0;
  scaleLogo = 0;
  scaleTextTemp = 0;

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
  regexCode = REGEX_CODE;

  backgroundImageUrl = '';
  isVisibleDeleteBackgroundImg = false;

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private userSignConfigService: UserSignConfigApiService,
    private aclService: ACLService,
    private documentSignService: DocumentSignService,
    private domSanitizer: DomSanitizer,
    private elementRef: ElementRef,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {
    if (this.tokenService.get()?.token) {
      this.userId = this.tokenService.get()?.id;
    }
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
    this.btnCancel = {
      title: 'Huỷ bỏ',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.updateFormToAdd();
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
      code: [{ value: null }, [Validators.required, Validators.pattern(this.regexCode)]],
      isSignDefault: [true],
      moreInfo: [''],
    });
  }

  initImage(src: any, type: any): any {
    const image = new Image();
    image.src = src;
    image.onload = (i: any) => {
      // Lấy kích thước thật của ảnh
      this.imageWidth = i.target.naturalWidth;
      this.imageHeight = i.target.naturalHeight;
      // Tính tỷ lệ kích thước thật của ảnh với kích thước mặc định khung canvas
      this.ratio = 250 / i.target.naturalWidth;
    };

    const data = src;
    fabric.Image.fromURL(data, (img: any) => {
      const oImg = img.set({ left: 0, top: 0, angle: 0, width: this.imageWidth, height: this.imageHeight }).scale(1);
      this.setImageToCanvas(oImg, type, src);
    });
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
      content = 'Bạn có chắc chắn muốn xóa các bản ghi này không?';
    } else {
      content = 'Bạn có chắc chắn muốn xóa bản ghi này không?';
    }
    this.isShowDelete = true;
    this.deleteModal.initData(selectedRows, content);
  }

  onResetSearch(reloadData: boolean): void {
    this.filter.pageNumber = 1;
    this.filter.textSearch = undefined;
    this.filter.status = null;
    if (reloadData) {
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

  ngOnInit(): void {
    this.initRightOfUser();
    this.checkSysAdmin = this.aclService.can(ROLE_SYS_ADMIN);
  }

  initRightOfUser(): void {
    this.btnEdit.grandAccess = this.aclService.canAbility('SIGN-CONFIG-EDIT');
    this.btnSave.grandAccess = this.aclService.canAbility('SIGN-CONFIG-EDIT') || this.aclService.canAbility('SIGN-CONFIG-ADD');
  }

  updateFormToAdd(): void {
    this.form.reset();
    this.resetForm();
    this.form.enable();
    this.isInfo = false;
    this.isEdit = false;
    this.isAdd = true;
    // this.tittle = `Thêm mới ${this.moduleName}`;
    this.tittle = `${this.i18n.fanyi('function.sign-config.modal-item.header-add')}`;
  }

  updateFormToEdit(data: any): void {
    // this.resetForm();
    this.form.get('code')?.disable();
    this.isInfo = false;
    this.isEdit = true;
    this.isAdd = false;
    // this.tittle = `Cập nhật ${this.moduleName}`;
    this.tittle = `${this.i18n.fanyi('function.sign-config.modal-item.header-edit')}`;
  }

  updateFormToInfo(data: any): void {
    this.resetForm();
    // this.form.disable();
    this.form.get('code')?.disable();
    this.isInfo = true;
    this.isEdit = false;
    this.isAdd = false;
    // this.tittle = `Chi tiết ${this.moduleName}`;
    this.tittle = `${this.i18n.fanyi('function.sign-config.modal-item.header-info')}`;
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

  handleChange(info: { file: NzUploadFile }, type: any): void {
    if (info.file.status === 'error' || info.file.status === 'done') {
      const originFileObj = info.file?.originFileObj as Blob;
      const reader = new FileReader();
      reader.readAsDataURL(originFileObj);
      reader.onload = () => {
        const imgBase64 = reader.result as string;
        const image = new Image();
        image.src = imgBase64;
        image.onload = (i: any) => {
          this.imageWidth = i.target.naturalWidth;
          this.imageHeight = i.target.naturalHeight;
          this.ratio = 250 / i.target.naturalWidth;
        };

        const data = imgBase64.replace('data:image/png;base64, ', '');
        fabric.Image.fromURL(reader.result, (img: any) => {
          const oImg = img.set({ left: 0, top: 0, angle: 0, width: this.imageWidth, height: this.imageHeight }).scale(this.ratio);
          this.setImageToCanvas(oImg, type, data);
        });
        if (type === 'image') {
          this.signAppearanceImage = true;
          this.imageBase64Preview = imgBase64;
        }
        if (type === 'logo') {
          this.signAppearanceLogo = true;
          this.logoBase64Preview = imgBase64;
        }

        this.createSignPreview();
      };
    }
  }

  changeSignAppearance(event: any, type: any): any {
    switch (type) {
      case 'logo':
        this.signAppearanceLogo = event;
        if (!event) {
          this.canvasLogo.clear();
          this.logoBase64Preview = '';
        }
        break;
      case 'image':
        this.signAppearanceImage = event;
        if (!event) {
          this.canvas.clear();
          this.imageBase64Preview = '';
        }
        break;
      default:
        if (!event) {
          this.canvas.clear();
        }
        break;
    }
    this.createSignPreview();
  }

  setImageToCanvas(oImg: any, type: any, data: any): any {
    this.signType.push(type);
    switch (type) {
      case 'logo':
        this.canvasLogo.clear();
        this.logoFileBase64 = data;
        this.canvasLogo.add(oImg).renderAll();
        this.canvasLogo.setActiveObject(oImg);
        break;
      case 'image':
        this.canvas.clear();
        this.imageFileBase64 = data;
        this.canvas.add(oImg).renderAll();
        this.canvas.setActiveObject(oImg);
        break;
      default:
        this.canvas.clear();
        this.logoFileBase64 = data;
        this.canvas.add(oImg).renderAll();
        this.canvas.setActiveObject(oImg);
        break;
    }
  }

  public initData(data: any, type: any = null, option: any = {}): void {
    this.signPreview = '<div class="container-sign-preview"></div>';
    this.logoBase64Preview = '';
    this.imageBase64Preview = '';
    setTimeout(() => {
      this.initCanvas();
      this.initImage(data?.imageFileBase64, 'image');
      this.initImage(data?.logoFileBase64, 'logo');
    }, 500);
    this.resetForm();

    this.isLoading = false;
    this.isReloadGrid = false;
    this.type = type;
    this.option = option;

    this.updateFormType(type);
    this.id = data?.id;
    this.scaleImage = 0;
    this.scaleText = 0;
    this.scaleLogo = 0;
    this.form.get('code')?.setValue(data?.code);
    this.form.get('isSignDefault')?.setValue(data?.isSignDefault);

    this.signAppearanceImage = data?.signAppearanceImage;
    this.signAppearanceLogo = data?.signAppearanceLogo;
    if (data && data.listSignInfoJson) {
      this.listSignInfo = JSON.parse(data?.listSignInfoJson);
    }

    // this.updateListSignInfoByCode(JSON.parse(data?.listSignInfoJson));

    if (type === 'info' || type === 'edit') {
      this.logoBase64Preview = data?.logoFileBase64;
      this.imageBase64Preview = data?.imageFileBase64;

      this.form.get('moreInfo')?.setValue(data?.moreInfo);
      this.backgroundImageUrl = data?.backgroundImageFileBase64;

      this.createSignPreview();
    }

    if (this.backgroundImageUrl) {
      this.isVisibleDeleteBackgroundImg = true;
    } else {
      this.isVisibleDeleteBackgroundImg = false;
    }
  }

  updateListSignInfoByCode(listSignInfo: any) {
    this.listSignInfo.forEach((x) => {
      if (x.code === 'signedBy') {
        x.value = listSignInfo.find((y: any) => y.code === 'signedBy').value;
      }
      if (x.code === 'organization') {
        x.value = listSignInfo.find((y: any) => y.code === 'organization').value;
      }
      if (x.code === 'position') {
        x.value = listSignInfo.find((y: any) => y.code === 'position').value;
      }
      if (x.code === 'email') {
        x.value = listSignInfo.find((y: any) => y.code === 'email').value;
      }
      if (x.code === 'phoneNumber') {
        x.value = listSignInfo.find((y: any) => y.code === 'phoneNumber').value;
      }
      if (x.code === 'timestamp') {
        x.value = listSignInfo.find((y: any) => y.code === 'timestamp').value;
      }
      if (x.code === 'reasonSign') {
        x.value = listSignInfo.find((y: any) => y.code === 'reasonSign').value;
      }
      if (x.code === 'SignedAt') {
        x.value = listSignInfo.find((y: any) => y.code === 'SignedAt').value;
      }
      if (x.code === 'contact') {
        x.value = listSignInfo.find((y: any) => y.code === 'contact').value;
      }
    });
  }

  resetForm(): void {
    if (this.canvas && this.canvasLogo) {
      this.canvas.clear();
      this.canvasLogo.clear();
    }
    this.form.get('code')?.setValue('');
    this.signAppearanceImage = false;
    this.signAppearanceLogo = false;
    this.listSignInfo.map((item) => (item.value = false));
    this.form.get('isSignDefault')?.setValue(false);
    this.backgroundImageUrl = '';
    this.form.get('moreInfo')?.setValue('');
  }

  closeModalReloadData(): void {
    this.isVisible = false;
    this.eventEmmit.emit({ type: 'success' });
  }

  onDeleteEventEmmit(event: any): void {
    if (event.type === 'success') {
    } else if (event.type === 'confirm') {
      this.deleteModal.updateIsLoading(true);
      this.deleteListItem(event.listId);
    }
  }

  onCellDoubleClicked($event: any): void {
    this.updateFormType('edit');
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.approvePerfectScrollbar();
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

  initCanvas(): any {
    this.canvas = new fabric.Canvas('canvas-draw-image', {
      isDrawingMode: false,
    });
    this.canvas.freeDrawingBrush.color = '#002ABE';
    this.canvas.freeDrawingBrush.width = 2.5;
    this.canvasLogo = new fabric.Canvas('canvas-draw-logo', {
      isDrawingMode: false,
    });
    this.canvasLogo.freeDrawingBrush.color = '#002ABE';
    this.canvasLogo.freeDrawingBrush.width = 2.5;
  }

  ngAfterViewInit(): void {
    // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    // Add 'implements AfterViewInit' to the class.
    // this.initCanvas();
  }

  deleteListItem(listId: [string]): Subscription {
    this.isLoadingDelete = true;
    const promise = this.userSignConfigService.delete(listId).subscribe(
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

  signInfoChange($event: any, code?: string) {
    let isCheckboxChecked = false;
    this.listSignInfo.forEach((element) => {
      if (element.value) {
        isCheckboxChecked = true;
      }
    });

    if (isCheckboxChecked && this.signAppearanceImage) {
      this.scaleImage = 0.4;
      this.scaleText = 0.6;
    }
    if (isCheckboxChecked && !this.signAppearanceImage) {
      this.scaleText = 1;
      this.scaleImage = 0;
    }
    if (!isCheckboxChecked && !this.signAppearanceImage) {
      this.scaleText = 0;
      this.scaleImage = 0;
    }
    if (!isCheckboxChecked && this.signAppearanceImage) {
      this.scaleText = 0;
      this.scaleImage = 1;
    }

    if (code && code === 'backgroundImage' && !$event) {
      this.backgroundImageUrl = '';
    }

    this.createSignPreview();
  }

  save(isCreateAfter: boolean = false): Subscription | undefined {
    this.isLoading = true;
    if (!this.signAppearanceImage && this.signInfoChange(false)) {
      this.scaleImage = 0;
      this.scaleText = 0;
    }
    if (this.signAppearanceImage && this.signInfoChange(false)) {
      this.scaleImage = 1;
      this.scaleText = 0;
    }
    if (!this.signAppearanceImage && this.signInfoChange(true)) {
      this.scaleImage = 1;
      this.scaleText = 0;
    }

    if (!this.signAppearanceLogo) {
      this.scaleLogo = 0;
    } else {
      this.scaleLogo = 1;
    }

    const data = {
      id: this.id,
      code: this.form.controls.code.value.toUpperCase(),
      scaleImage: this.scaleImage,
      scaleText: this.scaleText,
      scaleLogo: this.scaleLogo,
      userId: this.userId,
      isSignDefault: this.form.controls.isSignDefault.value,
      signAppearanceImage: this.signAppearanceImage,
      signAppearanceLogo: this.signAppearanceLogo,
      listSignInfoJson: JSON.stringify(this.listSignInfo),
      imageFileBase64: this.canvas.toDataURL('image/png'),
      logoFileBase64: this.canvasLogo.toDataURL('image/png'),
      appearenceSignType: this.signType.toString(),
      moreInfo: this.form.controls.moreInfo.value,
      backgroundImageFileBase64: this.backgroundImageUrl,
    };

    if (this.isAdd) {
      const promise = this.userSignConfigService.create(data).subscribe(
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
      const promise = this.userSignConfigService.update(data).subscribe(
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

  createSignPreview() {
    const contentTextSign = this.listSignInfo
      .filter((x) => x.value && x.code !== 'backgroundImage')
      .map((x) => x.label + ': ...')
      .join('<br/>');
    const logo = this.logoBase64Preview
      ? `<img class="image-size-sign-preview" src='${this.logoBase64Preview}'/>`
      : `<div class="image-empty-sign-preview"></div>`;
    const image = this.imageBase64Preview
      ? `<img class="image-size-sign-preview" src='${this.imageBase64Preview}'/>`
      : `<div class="image-empty-sign-preview"></div>`;
    if (this.signAppearanceLogo && this.signAppearanceImage && this.listSignInfo.some((x) => x.value)) {
      this.signPreview = `
        <div class="container-sign-preview">
          <div class="image-sign-preview-left">
            ${logo}
          </div>          
          <div class="container-sign-preview-right">
            <div class="image-sign-preview-right">
              ${image}
            </div>              
            <div class="container-sign-preview-content-text-right">${contentTextSign}</div>
          </div>
        </div>`;
    } else {
      if (this.signAppearanceImage && this.signAppearanceLogo) {
        this.signPreview = `
          <div class="container-sign-preview">  
            <div class="image-sign-preview-left">
              ${logo} 
            </div>                               
            <div class="container-sign-preview-right">
              ${image}
            </div>
          </div>`;
      } else if (this.signAppearanceImage && this.listSignInfo.some((x) => x.value)) {
        this.signPreview = `
          <div class="container-sign-preview">       
            <div class="image-sign-preview-right">
              ${image}
            </div>                          
            <div class="container-sign-preview-content-text-right">${contentTextSign}</div>  
          </div>`;
      } else if (this.signAppearanceLogo && this.listSignInfo.some((x) => x.value)) {
        this.signPreview = `
          <div class="container-sign-preview">         
            <div class="image-sign-preview-left">
              ${logo}
            </div>                                    
            <div class="container-sign-preview-right">
                <span class="span-sign-preview">${contentTextSign}</span>
            </div>                                
          </div>`;
      } else {
        if (this.signAppearanceLogo) {
          this.signPreview = `<div class="container-sign-preview">
              ${logo}
            </div>`;
        } else if (this.signAppearanceImage) {
          this.signPreview = `<div class="container-sign-preview">
              ${image}
            </div>`;
        } else if (this.listSignInfo.some((x) => x.value)) {
          this.signPreview = `<div class="container-sign-preview-content-text">${contentTextSign}</div>`;
        } else {
          this.signPreview = '<div class="container-sign-preview"></div>';
        }
      }
    }
  }

  private getBase64(img: File, callback: (img: string) => void): void {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result!.toString()));
    reader.readAsDataURL(img);
  }

  handleFileChange(info: { file: NzUploadFile }, type: any): void {
    if (info.file.status === 'error' || info.file.status === 'done') {
      const originFileObj = info.file?.originFileObj as Blob;
      const reader = new FileReader();
      reader.readAsDataURL(originFileObj);
      reader.onload = () => {
        const imgBase64 = reader.result as string;
        const image = new Image();
        image.src = imgBase64;

        this.getBase64(info.file!.originFileObj!, (img: string) => {
          this.backgroundImageUrl = img;
        });
        this.isVisibleDeleteBackgroundImg = true;
      };
    }
  }

  deleteBackgroundImage($event: any) {
    this.backgroundImageUrl = '';
    this.isVisibleDeleteBackgroundImg = false;
  }
}
