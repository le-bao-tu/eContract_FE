import { ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentApiService, DocumentTemplateApiService, MinIOApiService } from '@service';
import { SettingModel } from './../../../../document-meta-data-config/models/setting';

import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { environment } from '@env/environment';
import { ButtonModel } from '@model';
import { SCHEMA_THIRDS_COMPONENTS } from '@shared';
import { base64ToArrayBuffer, getUrlDownloadFile, LIST_FONT, LIST_FONT_SIZE, nodeUploadRouter } from '@util';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-document-template-config',
  templateUrl: './document-template-config.component.html',
  styleUrls: ['./document-template-config.component.less'],
})
export class DocumentTemplateConfigComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private messageService: NzMessageService,
    private documentApiService: DocumentApiService,
    private minIOApiService: MinIOApiService,
    private documentTemplateApiService: DocumentTemplateApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private elem: ElementRef,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {
    this.option = this.getTextStyle();
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
  }

  isShowFormDynamicSign = false;
  isDynamicPosition = false;
  textAnchor: any;
  fromPage: any = 1;
  textFindedPosition: any = 1;
  dynamicFromAnchorLLX: any = 0;
  dynamicFromAnchorLLY: any = 0;
  signItemSelected: SettingModel | undefined;
  signItemSelectedIndex: any;

  id = '';
  private sub: any;
  tittle = 'CẤU HÌNH VỊ TRÍ HIỂN THỊ THÔNG TIN CỦA BIỂU MẪU: ';
  listItemSetting: SettingModel[] = [];
  listItemSettingCurrentPage: SettingModel[] = [];
  listMetaData: any[] = [];
  templateConfig: any;
  tempId = 0;
  isLoading = false;

  fileUrl = '';
  fileBase64: any;

  PDF_BORDER_PAGE = 9;

  selectedFont = 'Times New Roman';
  listFont = LIST_FONT;

  selectedFontSize = 14;
  listFontSize = LIST_FONT_SIZE;
  option: any;
  selectedFontWeight = 'normal';
  selectedFontStyle = 'normal';
  selectedTextDecoration = 'none';
  selectedTextAlign = 'left';
  selectedColor = '#000000';

  @ViewChild('pdfContainer') pdfViewer!: ElementRef;
  outSize = false;
  currentPage = 1;
  totalPage = 0;
  btnSave: ButtonModel;
  btnCancel: ButtonModel;
  checkedAllPage = false;
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
  changeFontWeight(font: string): void {
    if (this.selectedFontWeight === font) {
      this.selectedFontWeight = 'normal';
    } else {
      this.selectedFontWeight = font;
    }
    this.option = this.getTextStyle();
    this.documentApiService.changeOption(this.option);
  }

  changeFontStyle(font: string): void {
    if (this.selectedFontStyle === font) {
      this.selectedFontStyle = 'normal';
    } else {
      this.selectedFontStyle = font;
    }
    this.option = this.getTextStyle();
    this.documentApiService.changeOption(this.option);
  }

  changeTextDecoration(font: string): void {
    if (this.selectedTextDecoration === font) {
      this.selectedTextDecoration = 'none';
    } else {
      this.selectedTextDecoration = font;
    }
    this.option = this.getTextStyle();
    this.documentApiService.changeOption(this.option);
  }
  changeFont(event: any): void {
    this.option = this.getTextStyle();
    this.option.font = event;
    this.documentApiService.changeOption(this.option);
  }

  changeColor(event: any): void {
    this.option = this.getTextStyle();
    this.option.color = event;
    this.documentApiService.changeOption(this.option);
  }

  onSelectedItem(event: any): void {
    if (event.signType > 0 && !event.isSelected) {
      this.isShowFormDynamicSign = false;

      this.isDynamicPosition = false;
      this.textAnchor = '';
      this.fromPage = 1;
      this.textFindedPosition = 1;
      this.dynamicFromAnchorLLX = 0;
      this.dynamicFromAnchorLLY = 0;

      this.signItemSelected = undefined;
      this.signItemSelectedIndex = undefined;
    }

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
  changeSize(event: any): void {
    this.option = this.getTextStyle();
    this.option.fontSize = event;
    this.documentApiService.changeOption(this.option);
  }
  changeTextAlign(align: string): void {
    if (this.selectedTextDecoration === align) {
      this.selectedTextAlign = 'left';
    } else {
      this.selectedTextAlign = align;
    }
    this.option = this.getTextStyle();
    this.documentApiService.changeOption(this.option);
  }

  onPageChange(event: any, i: number): void {
    this.currentPage = this.currentPage + i;
    if (this.currentPage < 1) {
      this.currentPage = 1;
    } else if (this.currentPage > this.totalPage) {
      this.currentPage = this.totalPage;
    }
    this.onChangeItemOnPage();
  }

  handleCancel(): void {
    this.router.navigate(['/certify/document-template']);
  }

  onChangeItemOnPage(setting?: any): void {
    this.listItemSettingCurrentPage = this.listItemSetting.filter((x) => x.page === this.currentPage);

    if (setting && setting.signType > 0 && setting.page === this.currentPage) {
      this.isShowFormDynamicSign = true;

      this.isDynamicPosition = setting.isDynamicPosition;
      this.textAnchor = setting.textAnchor;
      this.fromPage = setting.fromPage;
      this.textFindedPosition = setting.textFindedPosition;
      this.dynamicFromAnchorLLX = setting.dynamicFromAnchorLLX;
      this.dynamicFromAnchorLLY = setting.dynamicFromAnchorLLY;

      this.signItemSelected = this.listItemSetting.find(x => x.signType > 0 && x.tempMetaDataId === setting.tempMetaDataId);
      this.signItemSelectedIndex = this.listItemSetting.findIndex(x => x.signType > 0 && x.tempMetaDataId === setting.tempMetaDataId);
    }

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

    const c = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.listItemSetting.forEach((x) => {
      if (x.signType !== 0 && x.signType !== undefined && x.signType !== null) {
        x.position = ++c[x.signType];
      }
    });
  }
  unique(array: any[]): any {
    const newArr: any[] = [];
    array.map((item, index) => {
      if (item.signType !== 1 && item.signType !== 2 && item.signType !== 3) {
        const rs = newArr.filter((x) => String(x.metaDataId).toLowerCase().trim() === String(item.metaDataId).toLowerCase().trim());
        if (rs.length === 0) {
          newArr.push(item);
        }
      } else {
        const rs = newArr.filter((x) => String(x.fixCode).toLowerCase().trim() === String(item.fixCode).toLowerCase().trim());
        if (rs.length === 0) {
          newArr.push(item);
        }
      }
    });
    return newArr;
  }
  addVungKy(type: any, name: string): void {
    // console.log(type);
    let typeName = '';
    switch (type) {
      case 1:
        typeName = 'KY_CHUNG_THUC';
        break;
      case 2:
        typeName = 'KY_PHE_DUYET';
        break;
      case 3:
        typeName = 'KY_REVIEW';
        break;
      case 4:
        typeName = 'KY_SO';
        break;
      case 5:
        typeName = 'KY_DIEN_TU';
        break;
      default:
        break;
    }
    const item = {
      signType: type,
      fixCode: typeName,
      metaDataName: name,
      checkAll: this.checkedAllPage,
      height: 92,
      width: 176,
    };
    this.addItem(item);
  }

  getFileUrl(file: any): string {
    if (file === null || file === undefined || file === '' || file === {}) {
      return '';
    }
    // this.updateFileBase64(file.fileBucketName, file.fileObjectName);
    return file.fileUrl;
    // return getUrlDownloadFile(file.fileBucketName, file.fileObjectName);
  }

  ngOnInit(): void {
    // tslint:disable-next-line: deprecation
    this.sub = this.route.params.subscribe((params) => {
      this.id = params.id;
      this.documentTemplateApiService.getById(this.id).subscribe((data: any) => {
        this.templateConfig = data.data;
        this.fileUrl = this.getFileUrl(this.templateConfig.documentFileTemplate[0]);
        this.tittle += this.templateConfig.name;
        this.listMetaData = this.templateConfig.documentMetaDataConfig;
        this.listItemSetting =
          this.templateConfig.documentFileTemplate[0].metaDataConfig != null || undefined
            ? this.templateConfig.documentFileTemplate[0].metaDataConfig
            : [];
        this.listItemSetting.forEach((element) => {
          // console.log(element);

          element.tempMetaDataId = String(this.tempId++);
        });
        // this.onChangeItemOnPage();
      });
      // In a real app: dispatch action to load the details here.
    });
  }

  onItemRemove(item: any): void {
    const index = this.listItemSetting.indexOf(item);
    if (index > -1) {
      this.listItemSetting.splice(index, 1);
    }
    this.onChangeItemOnPage();
  }

  afterPdfLoadComplete(event: any): void {
    this.totalPage = event?.numPages;
    this.listItemSettingCurrentPage = [];
    setTimeout(() => {
      this.onChangeItemOnPage();
    }, 1000);
  }

  pageInitialized(event: any): void { }

  pageRendered(event: any): void {
    this.onChangeItemOnPage();
    let height = document.getElementsByClassName('textLayer')[0].clientHeight;
    if (height) {
      height = height + 20;
    }
    document.getElementsByTagName('pdf-viewer')[0].setAttribute('style', 'display:block; height: ' + height + 'px;');
  }

  textLayerRendered(event: any): void { }

  getTextStyle(): any {
    const option = {
      font: this.selectedFont,
      fontWeight: this.selectedFontWeight,
      fontSize: this.selectedFontSize,
      textAlign: this.selectedTextAlign,
      fontStyle: this.selectedFontStyle,
      textDecoration: this.selectedTextDecoration,
      color: this.selectedColor,
    };
    return option;
  }
  onPdfError(event: any): void { }
  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: any): void {
    const rect = this.pdfViewer.nativeElement.getBoundingClientRect();
    let flag = false;
    const llx = rect.x;
    const lly = rect.y;
    // console.log(llx + ', ' + lly);
    this.listItemSettingCurrentPage.map((item) => {
      if (item.llx === llx && item.lly === lly) {
        flag = true;
      }
    });
    // if (flag === false) {
    //   console.log('click outside');
    // } else {
    //   console.log('click inside');
    // }
  }
  addItem(item: any): void {
    const rect = this.pdfViewer.nativeElement.getBoundingClientRect();
    // console.log(rect);

    // const parent = this.pdfViewer.nativeElement as HTMLElement;
    // console.log(parent);

    const elements = this.elem.nativeElement.querySelectorAll('.canvasWrapper');
    // console.log(elements[0].clientHeight);
    // console.log(elements[0].clientWidth);

    const newItem = new SettingModel(rect.x, rect.y, 'text');
    newItem.value = item.metaDataName;
    newItem.fixCode = item.fixCode;
    newItem.signType = item.signType;
    // console.log(item.signType);

    if (item.signType === 0 || item.signType === null || item.signType === undefined) {
      newItem.height = 50;
      newItem.width = 150;
    } else {
      newItem.height = item.height;
      newItem.width = item.width;
    }

    newItem.font = this.selectedFont;
    newItem.fontWeight = this.selectedFontWeight;
    newItem.fontSize = this.selectedFontSize;
    newItem.textAlign = this.selectedTextAlign;
    newItem.fontStyle = this.selectedFontStyle;
    newItem.textDecoration = this.selectedTextDecoration;
    newItem.color = this.selectedColor;

    newItem.borderWidthOfPage = this.PDF_BORDER_PAGE;
    newItem.pageHeight = elements[0].clientHeight;
    newItem.pageWidth = elements[0].clientWidth;

    newItem.llx = 50;
    newItem.lly = -rect.height + 50;

    newItem.metaDataId = item.metaDataId;
    newItem.metaDataCode = item.metaDataCode;
    if (!item.checkAll) {
      newItem.tempMetaDataId = String(this.tempId++);
      newItem.page = this.currentPage;
      this.listItemSetting.push(newItem);
    } else {
      for (let index = 1; index <= this.totalPage; index++) {
        const itemAdd = { ...newItem };
        itemAdd.page = index;
        itemAdd.tempMetaDataId = String(this.tempId++);

        this.listItemSetting.push(itemAdd);
      }
    }
    this.onChangeItemOnPage();
  }

  onItemSettingUpdate(setting: any): void {
    this.listItemSetting.forEach((item) => {
      if (item.tempMetaDataId === setting.tempMetaDataId) {
        Object.assign(item, setting);
      }
    });
    this.onChangeItemOnPage(setting);
  }

  // updateFileBase64(bucketName: string, objectName: string): void {
  //   const promise = this.minIOApiService.downloadFileBase64(bucketName, objectName).subscribe(
  //     (res: any) => {
  //       this.isLoading = false;
  //       if (res.code !== 200) {
  //         this.messageService.error(`${res.message}`);
  //         return;
  //       }
  //       if (res.data === null || res.data === undefined) {
  //         this.messageService.error(`${res.message}`);
  //         return;
  //       }
  //       // this.fileBase64 = res.data.fileData;
  //       this.fileBase64 = base64ToArrayBuffer(res.data.fileData);
  //       // this.handleCancel();
  //     },
  //     (err: any) => {
  //       this.isLoading = false;
  //       if (err.error) {
  //         this.messageService.error(`${err.error.message}`);
  //       } else {
  //         this.messageService.error(`${err.status}`);
  //       }
  //     },
  //   );
  // }  

  save(): void {
    this.templateConfig.documentFileTemplate[0].metaDataConfig = this.listItemSetting;
    const data = {
      id: this.templateConfig.documentFileTemplate[0].id,
      metaDataConfig: this.listItemSetting,
    };

    const promise = this.documentTemplateApiService.updateMetaDataConfig([data]).subscribe(
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
        // this.handleCancel();
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
  }

  onItemClick(setting: any): void {
    // console.log(setting);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  checkedDynamicSignChange($event: boolean) {
    if (this.signItemSelected) {
      this.signItemSelected.isDynamicPosition = $event;
      this.listItemSetting[this.signItemSelectedIndex] = this.signItemSelected;
    }
  }

  textAnchorChange($event: any) {
    if (this.signItemSelected) {
      this.signItemSelected.textAnchor = $event;
      this.listItemSetting[this.signItemSelectedIndex] = this.signItemSelected;
    }
  }

  fromPageChange($event: any) {
    if (this.signItemSelected) {
      this.signItemSelected.fromPage = parseInt($event);
      this.listItemSetting[this.signItemSelectedIndex] = this.signItemSelected;
    }
  }

  textFindedPositionChange($event: any) {
    if (this.signItemSelected) {
      this.signItemSelected.textFindedPosition = parseInt($event);
      this.listItemSetting[this.signItemSelectedIndex] = this.signItemSelected;
    }
  }

  dynamicFromAnchorLLXChange($event: any) {
    if (this.signItemSelected) {
      this.signItemSelected.dynamicFromAnchorLLX = parseFloat($event);
      this.listItemSetting[this.signItemSelectedIndex] = this.signItemSelected;
    }
  }

  dynamicFromAnchorLLYChange($event: any) {
    if (this.signItemSelected) {
      this.signItemSelected.dynamicFromAnchorLLY = parseFloat($event);
      this.listItemSetting[this.signItemSelectedIndex] = this.signItemSelected;
    }
  }
}
