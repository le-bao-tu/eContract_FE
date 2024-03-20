import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { I18NService } from '@core';
import { ACLService } from '@delon/acl';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { environment } from '@env/environment';
import { ButtonModel, GridModel, QueryFilerModel } from '@model';
import { UserSignConfigApiService } from '@service';
import { BtnCellRenderComponent, DeleteModalComponent } from '@shared';
import {
  LIST_SIGN_INFO,
  LIST_STATUS,
  nodeUploadRouter,
  OVERLAY_LOADING_TEMPLATE,
  OVERLAY_NOROW_TEMPLATE,
  PAGE_SIZE_OPTION_DEFAULT,
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
  selector: 'app-sign-config',
  templateUrl: './sign-config.component.html',
  styleUrls: ['./sign-config.component.less'],
})
export class SignConfigComponent implements OnInit, AfterViewInit {
  signPreview: SafeHtml = '<div class="container-sign-preview"></div>';

  regexCode = REGEX_CODE;

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
  signType: any[] = [];
  logoFileBase64: any;
  imageFileBase64: any;
  isLoading = false;
  isReloadGrid = false;
  fileList: any[] = [];
  isShowDelete = false;
  isLoadingDelete = false;
  signConfigId: any;
  signAppearanceLogo = false;
  signAppearanceImage = false;
  uploadUrl = environment.API_URL + nodeUploadRouter.uploadFileBinary;
  isSignDefault = false;
  btnSave: ButtonModel;
  btnClose: ButtonModel;
  btnRenew: ButtonModel;
  btnDelete: ButtonModel;
  btnEdit: ButtonModel;
  btnReload: ButtonModel;
  listSignInfo: any[] = LIST_SIGN_INFO;

  signConfigCode = '';
  scaleImage = 0;
  scaleText = 0;
  scaleLogo = 0;

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

  imageBase64Preview = '';
  logoBase64Preview = '';

  backgroundImageUrl = '';
  moreInfo = '';
  isVisibleDeleteBackgroundImg = false;

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private userSignConfigService: UserSignConfigApiService,
    private aclService: ACLService,
    private documentSignService: DocumentSignService,
    private domSanitizer: DomSanitizer,
    private elementRef: ElementRef,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    @Inject(DOCUMENT) private doc: any,
  ) {
    //#region ag-grid
    this.columnDefs = [
      {
        field: 'name',
        headerName: `${this.i18n.fanyi('function.sign-config.modal-item.name')}`,
        minWidth: 100,
        flex: 1,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
      },
      {
        field: 'username',
        headerName: `${this.i18n.fanyi('function.sign-config.modal-item.username')}`,
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
      // flex: 1,
      minWidth: 120,
      resizable: true,
    };
    this.frameworkComponents = {
      btnCellRenderer: BtnCellRenderComponent,
    };
    // this.excelStyles = [...EXCEL_STYLES_DEFAULT];
    //#endregion ag-grid
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
    this.btnRenew = {
      title: 'Tải lại',
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
    this.form = this.fb.group({});
  }
  onEditItem(item: any): any {
    this.isAdd = false;
    this.signConfigId = item.id;
    this.signConfigCode = item.code;
    this.scaleImage = item.scaleImage;
    this.scaleText = item.scaleText;
    this.scaleLogo = item.scaleLogo;
    this.signAppearanceImage = item.signAppearanceImage;
    this.signAppearanceLogo = item.signAppearanceLogo;
    this.listSignInfo = JSON.parse(item.listSignInfoJson);
    this.isSignDefault = item.isSignDefault;
    this.initImage(item.imageFileBase64, 'image');
    this.initImage(item.logoFileBase64, 'logo');
    this.logoBase64Preview = item.logoFileBase64;
    this.imageBase64Preview = item.imageFileBase64;

    this.moreInfo = item.moreInfo;
    this.backgroundImageUrl = item.backgroundImageFileBase64;
    if (this.backgroundImageUrl) {
      this.isVisibleDeleteBackgroundImg = true;
    } else {
      this.isVisibleDeleteBackgroundImg = false;
    }

    // this.listSignInfo.push(LIST_SIGN_INFO.find(x => x.code === 'backgroundImage'))
    this.createSignPreview();
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
  ngOnInit(): void {
    this.initRightOfUser();
    this.checkSysAdmin = this.aclService.can(ROLE_SYS_ADMIN);
  }
  initRightOfUser(): void {}

  updateFormToAdd(): void {
    this.resetForm();
    this.isInfo = false;
    this.isEdit = false;
    this.isAdd = true;
    this.tittle = `${this.i18n.fanyi('function.sign-config.modal-item.header')}`;
  }

  updateFormToEdit(data: any): void {
    this.resetForm();
    this.isInfo = false;
    this.isEdit = true;
    this.isAdd = false;
    this.tittle = `Cập nhật ${this.moduleName}`;
  }

  updateFormToInfo(data: any): void {
    this.resetForm();
    this.isInfo = true;
    this.isEdit = false;
    this.isAdd = false;
    this.tittle = `Chi tiết ${this.moduleName}`;
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
  createSignPreview() {
    const contentTextSign = this.listSignInfo
      .filter((x) => x.value)
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
    }, 500);
    this.resetForm();
    this.isLoading = false;
    this.isReloadGrid = false;
    this.type = type;
    this.option = option;
    if (data.id) {
      this.userId = data.id;
      this.userName = data.userName;
      this.filter.userId = data.id;
    }
    this.updateFormType(type);
    this.signConfigCode = '';
    this.scaleImage = 0;
    this.scaleText = 0;
    this.scaleLogo = 0;
  }

  resetForm(): void {
    if (this.canvas && this.canvasLogo) {
      this.canvas.clear();
      this.canvasLogo.clear();
    }
    this.signAppearanceImage = false;
    this.signAppearanceLogo = false;
    this.listSignInfo.map((item) => (item.value = false));
    this.isSignDefault = false;
    this.moreInfo = '';
    this.backgroundImageUrl = '';
    this.signConfigCode = '';
    this.signPreview = '<div class="container-sign-preview"></div>';
    this.logoBase64Preview = '';
    this.imageBase64Preview = '';
    this.signConfigId = undefined;
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
    throw new Error('Method not implemented.');
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
  signInfoChange($event: any, code: string = '') {
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

    if (code === 'backgroundImage' && !$event) {
      this.backgroundImageUrl = '';
    }

    this.createSignPreview();
  }
  save(isCreateAfter: boolean = false): Subscription | undefined {
    this.isLoading = true;

    if (!this.signConfigCode || (this.signConfigCode && this.signConfigCode.trim() === '')) {
      this.isLoading = false;
      this.messageService.error(`${this.i18n.fanyi('function.sign-config.modal-item.code.required.message')}`);
      return;
    }
    if (this.signConfigCode && !/^[a-zA-Z0-9_-]*$/.test(this.signConfigCode)) {
      this.isLoading = false;
      this.messageService.error(`${this.i18n.fanyi('function.sign-config.modal-item.code.pattern.message')}`);
      return;
    }
    // if (!this.logoFileBase64 && !this.imageFileBase64) {
    //   this.isLoading = false;
    //   this.messageService.error(`Chữ ký tải lên không được để trống!`);
    //   return;
    // }
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
      id: this.signConfigId,
      code: this.signConfigCode.toUpperCase(),
      scaleImage: this.scaleImage,
      scaleText: this.scaleText,
      scaleLogo: this.scaleLogo,
      userId: this.userId,
      isSignDefault: this.isSignDefault,
      signAppearanceImage: this.signAppearanceImage,
      signAppearanceLogo: this.signAppearanceLogo,
      listSignInfoJson: JSON.stringify(this.listSignInfo),
      imageFileBase64: this.canvas.toDataURL('image/png'),
      logoFileBase64: this.canvasLogo.toDataURL('image/png'),
      appearenceSignType: this.signType.toString(),
      moreInfo: this.moreInfo,
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
    const rs = this.userSignConfigService.getFilter(this.filter).subscribe(
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

  private getBase64(img: File, callback: (img: string) => void): void {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result!.toString()));
    reader.readAsDataURL(img);
  }

  deleteBackgroundImage($event: any) {
    this.backgroundImageUrl = '';
    this.isVisibleDeleteBackgroundImg = false;
  }
}
