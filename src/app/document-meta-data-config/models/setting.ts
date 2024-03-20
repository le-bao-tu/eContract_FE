import {
  DEFAULT_INPUT_TYPE_CHECKBOX_HEIGHT,
  DEFAULT_INPUT_TYPE_CHECKBOX_WIDTH,
  DEFAULT_INPUT_TYPE_DATE_HEIGHT,
  DEFAULT_INPUT_TYPE_DATE_WIDTH,
  DEFAULT_INPUT_TYPE_TEXT_HEIGHT,
  DEFAULT_INPUT_TYPE_TEXT_WIDTH,
  DEFAULT_SETTING_COLOR,
  DEFAULT_SETTING_FONT_COLOR,
  DEFAULT_SETTING_FONT_SIZE,
  DEFAULT_SETTING_FONT_STYLE,
  DEFAULT_SETTING_FONT_TYPE,
  DEFAULT_SETTING_HINT_CHECKBOX_DATA,
  DEFAULT_SETTING_HINT_DATE_DATA,
  DEFAULT_SETTING_HINT_TEXT_DATA,
  INPUT_TYPE_CHECKBOX,
  INPUT_TYPE_DATETIME,
} from './global';

export class SettingModel {
  metaDataId: string;
  metaDataCode: string;
  tempMetaDataId: string;
  type: string;
  signType = 0;
  isShow: boolean;
  page = 1;
  width: number;
  height: number;
  font: string;
  fontColor: string;
  fontSize: number;
  fontWeight: string;
  textAlign = 'left';
  fontStyle = 'Arial';
  textDecoration = 'none';
  color = '#000000';
  fixCode: string | undefined;
  value: string | boolean | Date;
  llx: number;
  lly: number;
  borderWidthOfPage = 0;
  pageHeight = 0;
  pageWidth = 0;
  isDynamicPosition: boolean = false;
  textAnchor: string = '';
  fromPage: number = 1;
  textFindedPosition: number = 1;
  dynamicFromAnchorLLX: number = 0;
  dynamicFromAnchorLLY: number = 0;
  [key: string]: any;

  constructor(leftToPdf: number, topToPdf: number, type: string) {
    this.metaDataId = '';
    this.metaDataCode = '';
    this.tempMetaDataId = '';
    this.type = type;
    this.isShow = false;
    if (type === INPUT_TYPE_CHECKBOX) {
      this.width = DEFAULT_INPUT_TYPE_CHECKBOX_WIDTH;
      this.height = DEFAULT_INPUT_TYPE_CHECKBOX_HEIGHT;
      this.value = DEFAULT_SETTING_HINT_CHECKBOX_DATA;
    } else if (type === INPUT_TYPE_DATETIME) {
      this.width = DEFAULT_INPUT_TYPE_DATE_WIDTH;
      this.height = DEFAULT_INPUT_TYPE_DATE_HEIGHT;
      this.value = DEFAULT_SETTING_HINT_DATE_DATA;
    } else {
      this.width = DEFAULT_INPUT_TYPE_TEXT_WIDTH;
      this.height = DEFAULT_INPUT_TYPE_TEXT_HEIGHT;
      this.value = DEFAULT_SETTING_HINT_TEXT_DATA;
    }
    this.font = DEFAULT_SETTING_FONT_TYPE;
    this.fontColor = DEFAULT_SETTING_FONT_COLOR;
    this.fontWeight = DEFAULT_SETTING_FONT_STYLE;
    this.fontSize = DEFAULT_SETTING_FONT_SIZE;
    this.color = DEFAULT_SETTING_COLOR;
    this.llx = leftToPdf;
    this.lly = topToPdf;
  }
}
