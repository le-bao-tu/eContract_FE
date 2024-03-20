import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DocumentApiService } from '@service';
import { listeners } from 'cluster';
import { DEFAULT_INPUT_BACKGROUND_COLOR, INPUT_TYPE_CHECKBOX } from '../models/global';
import { SettingModel } from '../models/setting';

@Component({
  selector: 'app-config-item',
  templateUrl: './sv-config-item.component.html',
  styleUrls: ['./sv-config-item.component.css'],
})
export class SvConfigItemComponent implements OnInit, AfterViewInit {
  constructor(private documentApiService: DocumentApiService, private elementRef: ElementRef) {}
  title = 'example';
  text = '';
  isMoving = false;
  metaDataIdSelected = '';
  isSelected = false;
  isVisable = false;
  // selectedFontWeight = 'normal';
  // selectedFontStyle = 'normal';
  // selectedTextDecoration = 'none';
  // selectedTextAlign = 'left';
  @Input() bound: HTMLElement | undefined;
  @Input() setting!: SettingModel;
  @Input() listMetaDataSetting: any[] = [];
  @Input() position: number | undefined;
  @Input() option: any | undefined;
  @Input() BackgroundColor: string = DEFAULT_INPUT_BACKGROUND_COLOR;
  @Output() onSelectedItem = new EventEmitter<any>();
  @Output() onItemDragBegin = new EventEmitter<SettingModel>();
  @Output() onItemDragStop = new EventEmitter<SettingModel>();
  @Output() onItemResizeStop = new EventEmitter<SettingModel>();
  @Output() onItemSettingUpdate = new EventEmitter<SettingModel>();
  @Output() onItemMoving = new EventEmitter<SettingModel>();
  @Output() onRemove = new EventEmitter<number>();
  isOutside = false;
  @ViewChild('mydrag') el: ElementRef | undefined;
  listCurrentItem: any[] = [];
  // @HostListener('document:mousedown', ['$event'])
  // onGlobalClick(event: any): void {
  //   if (!this.elementRef.nativeElement.contains(event.target)) {
  //     // clicked outside => close dropdown list
  //     this.isOutside = true;
  //     console.log('outside');
  //   } else {
  //     this.isOutside = false;
  //   }
  // }
  ngOnInit(): void {
    if (this.setting.signType === 1) {
      this.setting.value = '';
      this.setting.backgroundColor = 'white';
      this.setting.disabled = true;
      this.setting.opacity = 0.7;
      this.setting.borderRadius = '6px';
      this.setting.border = 'solid 2px #0079c2';
      this.setting.backgroudImage = `url('../../../assets/tmp/img/bussiness/nutkichungthuc.png')`;
    } else if (this.setting.signType === 2) {
      this.setting.value = '';
      this.setting.disabled = true;
      this.setting.opacity = 0.7;
      this.setting.borderRadius = '6px';
      this.setting.border = 'solid 2px #0079c2';
      this.setting.backgroundColor = 'white';
      this.setting.backgroudImage = `url('../../../assets/tmp/img/bussiness/nutkypheduyet.png')`;
    } else if (this.setting.signType === 3) {
      this.setting.value = '';
      this.setting.backgroundColor = 'white';
      this.setting.disabled = true;
      this.setting.opacity = 0.7;
      this.setting.borderRadius = '6px';
      this.setting.border = 'solid 2px #0079c2';
      this.setting.backgroudImage = `url('../../../assets/tmp/img/bussiness/icon_ky_so_1.png')`;
    } else if (this.setting.signType === 4) {
      this.setting.value = '';
      this.setting.backgroundColor = 'white';
      this.setting.disabled = true;
      this.setting.opacity = 0.7;
      this.setting.borderRadius = '6px';
      this.setting.border = 'solid 2px #0079c2';
      this.setting.backgroudImage = `url('../../../assets/tmp/img/bussiness/icon_ky_so_1.png')`;
    } else if (this.setting.signType === 5) {
      this.setting.value = '';
      this.setting.backgroundColor = 'white';
      this.setting.disabled = true;
      this.setting.opacity = 0.7;
      this.setting.borderRadius = '6px';
      this.setting.border = 'solid 2px #0079c2';
      this.setting.backgroudImage = `url('../../../assets/tmp/img/bussiness/icon_ky_so_1.png')`;
    } else {
      this.setting.disabled = false;
      this.setting.backgroudImage = `unset`;
    }
    this.listMetaDataSetting.map((item, index) => {
      item.isSelected = false;
    });
    // console.log('hello');
    this.documentApiService.optionCurrent.subscribe((res: any) => {
      if (res) {
        this.listMetaDataSetting.map((item, index) => {
          if (item.tempMetaDataId === this.metaDataIdSelected && item.isSelected === true) {
            this.setting.font = res.font;
            this.setting.fontSize = res.fontSize;
            this.setting.fontStyle = res.fontStyle;
            this.setting.fontWeight = res.fontWeight;
            this.setting.textAlign = res.textAlign;
            this.setting.textDecoration = res.textDecoration;
            this.setting.color = res.color;
          }
        });
      }
    });
  }
  ngAfterViewInit(): void {
    // console.log(`hello ${this.bound}`);
  }
  handleCancel() {
    this.isVisable = false;
  }
  onSelectedSignArea(setting: SettingModel, event: any): any {
    const listMetaDataSettingSign = this.listMetaDataSetting.filter((x) => x.signType > 0);
    this.isVisable = true;
    this.isSelected = true;
    this.metaDataIdSelected = setting.tempMetaDataId;
    listMetaDataSettingSign.map((item, index) => {
      if (
        item.tempMetaDataId.toString().toLowerCase().trim() === setting.tempMetaDataId.toLowerCase().trim() &&
        item.isSelected === false
      ) {
        item.isSelected = true;
        item.backgroundColor = 'red';
      } else {
        item.isSelected = false;
        item.backgroundColor = 'white';
      }
    });
    const listModel: any[] = [];
    listMetaDataSettingSign.map((item) => {
      if (item.isSelected === true) {
        listModel.push(item);
      }
    });
    if (listModel.length === 1) {
      this.onSelectedItem.emit(listModel[0]);
    } else {
      this.onSelectedItem.emit({ signType: 4, isSelected: false });
    }
  }
  onSelected(setting: SettingModel, event: any): any {
    // this.listMetaDataSetting.map((item, index) => {
    //   item.isSelected = false;
    //   item.backgroundColor = 'rgba(235, 201, 7, 0.65)';
    // });
    this.isVisable = true;
    this.isSelected = true;
    this.metaDataIdSelected = setting.tempMetaDataId;
    this.listMetaDataSetting.map((item, index) => {
      if (
        item.tempMetaDataId.toString().toLowerCase().trim() === setting.tempMetaDataId.toLowerCase().trim() &&
        item.isSelected === false
      ) {
        item.isSelected = true;
        item.backgroundColor = 'red';
      } else if (
        item.tempMetaDataId.toString().toLowerCase().trim() === setting.tempMetaDataId.toLowerCase().trim() &&
        item.isSelected === true
      ) {
        item.isSelected = false;
        item.backgroundColor = 'rgba(235, 201, 7, 0.65)';
      }
    });
    const listModel: any[] = [];
    this.listMetaDataSetting.map((item) => {
      if (item.isSelected === true) {
        listModel.push(item);
      }
    });
    if (listModel.length === 1) {
      this.onSelectedItem.emit(listModel[0]);
    } else {
      this.onSelectedItem.emit({});
    }
  }
  onUnSelected(): any {
    this.isSelected = false;
  }
  onMoving(event: any): any {
    this.onItemMoving.emit(event);
  }

  onMoveEnd(event: any): any {
    this.setting.llx = event.x;
    this.setting.lly = event.y;
    this.onItemSettingUpdate.emit(this.setting);
  }

  onDragStart(event: any): any {
    this.isMoving = true;
    this.onItemDragBegin.emit();
  }

  onDragStop(event: any): any {
    this.isMoving = false;
    this.onItemDragStop.emit();
  }

  onResizeStop(event: any): any {
    this.setting.width = event.size.width;
    this.setting.height = event.size.height;
    this.onItemResizeStop.emit(event);
    this.onItemSettingUpdate.emit(this.setting);
  }

  onResizing(event: any): any {
    // this.setting.fontSize = event.size.height;
  }

  remove(setting: any): any {
    this.onRemove.emit(setting);
  }

  onTextBlur(): any {
    this.onItemSettingUpdate.emit(this.setting);
  }
  applySetting(setting: any): any {
    this.setting = setting;
    this.onItemSettingUpdate.emit(this.setting);
  }
}
