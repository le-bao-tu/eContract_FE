// Lưu các tham số dùng chung
import { environment } from '@env/environment';
import { QueryFilerModel } from '@model';
import { authWSO2 } from './api-router';

export const LIST_USER_STATUS = [
  { id: true, code: true, name: 'Đang hoạt động' },
  { id: false, code: false, name: 'Ngừng hoạt động' },
];

export const LIST_STATUS = [
  { id: true, code: true, name: 'Đang áp dụng' },
  { id: false, code: false, name: 'Ngừng áp dụng' },
];
export const LIST_STATUS_DEVICE = [
  { id: true, code: true, name: 'T' },
  { id: false, code: false, name: 'F' },
];
export const wso2Url =
  environment.BASE_WSO2_URL +
  authWSO2.authorize +
  environment.CLIENT_ID +
  authWSO2.redirect_uri +
  environment.BASE_CALLBACK_URL +
  authWSO2.scope;
export const REGEX_NAME =
  '^[a-zA-Z0-9_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽếềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳýỵỷỹ -]+';
export const REGEX_CODE = '^[a-zA-Z0-9_-]*$';
export const REGEX_PHONE = '([+]84[3|5|7|8|9]|84[3|5|7|8|9]|0[3|5|7|8|9])+([0-9]{8,10})';
export const REGEX_EMAIL =
  "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
export const QUERY_FILTER_DEFAULT: QueryFilerModel = {
  pageNumber: 1,
  pageSize: 20,
  textSearch: undefined,
};
export const ROLE_SYS_ADMIN = 'SYS_ADMIN';
export const ROLE_ORG_ADMIN = 'ORG_ADMIN';
export const ROLE_USER = 'USER';
export const LIST_IDENTITY_NUMBER_TYPE = [
  { value: 'CMT', label: 'CMT', displayName: 'chứng minh thư' },
  { value: 'CCCD', label: 'CCCD', displayName: 'căn cước công dân' },
  { value: 'HC', label: 'Hộ chiếu', displayName: 'hộ chiếu' },
];
export const LIST_SIGN_INFO = [
  { value: false, code: 'signedBy', index: 1, label: 'Ký bởi' },
  { value: false, code: 'organization', index: 2, label: 'Đơn vị' },
  { value: false, code: 'position', index: 3, label: 'Chức vụ' },
  { value: false, code: 'email', index: 4, label: 'Email' },
  { value: false, code: 'phoneNumber', index: 5, label: 'Điện thoại' },
  { value: false, code: 'timestamp', index: 6, label: 'Thời gian ký' },
  { value: false, code: 'reasonSign', index: 7, label: 'Lý do ký' },
  { value: false, code: 'SignedAt', index: 8, label: 'Vị trí' },
  { value: false, code: 'contact', index: 9, label: 'Liên lạc' },
];
export const LIST_SEX = [
  { value: 1, label: 'Nam' },
  { value: 2, label: 'Nữ' },
  { value: 3, label: 'Không xác định' },
];
export const LIST_METHOD = [
  { value: 1, label: 'Hard token' },
  { value: 2, label: 'Soft token' },
];
export const LIST_AGENT = [
  { value: 1, label: 'Savis' },
  { value: 2, label: 'Viettel' },
];
export const LIST_DEVICE = [
  { value: 'DEVICE_ANDROID', label: 'Android' },
  { value: 'DEVICE_IOS', label: 'iOS' },
  { value: 'DEVICE_MOBILE', label: 'Mobile' },
  { value: 'DEVICE_WEB', label: 'Web' },
  { value: 'DEVICE_3RD', label: '3rdApp' },
];
export const LIST_CERT_TYPE = [
  { value: 1, label: 'Cá nhân' },
  { value: 2, label: 'Cá nhân thuộc tổ chức' },
  { value: 3, label: 'Tổ chức' },
];
export const LIST_CA_SUPPLIER = [{ value: 1, label: 'TrustCA 256(SHA256)' }];
export const EMAIL_VALIDATION = '[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$';
export const LIST_STATUS_CERT = [
  { id: true, code: true, name: 'Đã cấp phát' },
  { id: false, code: false, name: 'Chưa cấp phát' },
];
export const LIST_FONT = ['Arial', 'Helvetica', 'Times New Roman', 'Calibri', 'Tahoma', 'Roboto'];
export const LIST_FONT_SIZE = [
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  39,
  40,
];

export const LIST_SIGN_TYPE = [
  // { label: 'Ký chứng thực', value: 1 },
  // { label: 'Ký phê duyệt', value: 2 },
  // { label: 'Ký review', value: 3 },
  { label: 'Ký số', value: 4 },
  { label: 'Ký điện tử an toàn', value: 5 },
  { label: 'Ký ADSS', value: 7 },
  { label: 'Ký HSM, USBToken', value: 8 },
  { label: 'Ký HSM, USBToken, ADSS', value: 9 },
  { label: 'Không cần ký', value: 6 },
];

export const LIST_EFORMCONFIG = [
  { label: 'Ký điện tử', value: 1 },
  { label: 'Ký chứng thư số cá nhân', value: 2 },
];

export const LIST_ACCOUNT_TYPE = [
  { label: 'HSM', value: 1 },
  { label: 'ADSS', value: 2 },
];

export const PAGE_SIZE_OPTION_DEFAULT = [5, 10, 20, 50, 100];

export const EXCEL_STYLES_DEFAULT = [
  {
    id: 'greenBackground',
    interior: {
      color: '#b5e6b5',
      pattern: 'Solid',
    },
  },
  {
    id: 'redFont',
    font: {
      fontName: 'Calibri Light',
      underline: 'Single',
      italic: true,
      color: '#ff0000',
    },
  },
  {
    id: 'darkGreyBackground',
    interior: {
      color: '#888888',
      pattern: 'Solid',
    },
    font: {
      fontName: 'Calibri Light',
      color: '#ffffff',
    },
  },
  {
    id: 'boldBorders',
    borders: {
      borderBottom: {
        color: '#000000',
        lineStyle: 'Continuous',
        weight: 3,
      },
      borderLeft: {
        color: '#000000',
        lineStyle: 'Continuous',
        weight: 3,
      },
      borderRight: {
        color: '#000000',
        lineStyle: 'Continuous',
        weight: 3,
      },
      borderTop: {
        color: '#000000',
        lineStyle: 'Continuous',
        weight: 3,
      },
    },
  },
  {
    id: 'header',
    interior: {
      color: '#CCCCCC',
      pattern: 'Solid',
    },
    alignment: {
      vertical: 'Center',
      horizontal: 'Center',
    },
    font: {
      bold: true,
      fontName: 'Calibri',
    },
    borders: {
      borderBottom: {
        color: '#5687f5',
        lineStyle: 'Continuous',
        weight: 1,
      },
      borderLeft: {
        color: '#5687f5',
        lineStyle: 'Continuous',
        weight: 1,
      },
      borderRight: {
        color: '#5687f5',
        lineStyle: 'Continuous',
        weight: 1,
      },
      borderTop: {
        color: '#5687f5',
        lineStyle: 'Continuous',
        weight: 1,
      },
    },
  },
  {
    id: 'dateFormat',
    dataType: 'dateTime',
    numberFormat: { format: 'mm/dd/yyyy;@' },
  },
  {
    id: 'twoDecimalPlaces',
    numberFormat: { format: '#,##0.00' },
  },
  {
    id: 'textFormat',
    dataType: 'string',
  },
  {
    id: 'bigHeader',
    font: { size: 25 },
  },
];
export const OVERLAY_LOADING_TEMPLATE = '<span class="ag-overlay-loading-center">Đang tải dữ liệu, vui lòng chờ!</span>';
export const OVERLAY_NOROW_TEMPLATE =
  '<span style="padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow;">Không có dữ liệu!</span>';
export class Constants {
  static SIGN_DIG_OR_HSM = 0 | 2;
  static SIGN_USB_TOKEN = 1;
  static SIGN_ADSS = 3;

  static SIGN_DIG = 0;
  static SIGN_HSM = 1;
  static REJECT_DOC = 2;

  static CERT_FAILED_TO_LOAD = 101; // "Không lấy được CTS trong thiết bị"
  static CERT_NOT_FOUND_WITH_SERIAL = 102; // "Không tìm thấy CTS có SerialNumber với SerialNumber truyền vào";
  static CERT_EXPIRED = 103; // "CTS hết hiệu lực
  static CERT_REVOKED = 104; // "CTS đã bị thu hồi"
  static CERT_NOT_TRUST_CHAIN = 105; // "CTS là giả mạo"

  static FILE_FAILED_TO_READ = 301; // Lỗi khi đọc file cần ký
  static FILE_ACCESS_DENIED = 302; // Không có quyền truy cập thư mục chứa file
  static FILE_NO_SUCH_FILE = 303; // Không tìm thấy file cần ký

  static SIGN_SUCCESS_IGNORE_TSA = 401; // Ký thành công và bỏ qua Timestamp
  static SIGN_SUCCESS_WITH_TSA = 402; // Ký thành công với Timestamp

  static ACCOUNT_TYPE_HSM = 1;
  static ACCOUNT_TYPE_ADSS = 2;

  static SIGN_TYPE_DIG = 1;
  static SIGN_TYPE_CTS = 2;

  static NOTIFY_CODE_LAMMOIHD = 'TB_LAMMOIHD';
  static NOTIFY_CODE_HUYHD = 'TB_HUYHD';
  static NOTIFY_CODE_TUCHOIHD = 'TB_TUCHOIHD';

  // static WF_SIGN_TYPE_ADSS = 7 || 9;

  static LIST_NOTIFY_TYPE_USER_SIGN_DONE = 2;
  static LIST_NOTIFY_TYPE_REMIND = 3;
  static LIST_NOTIFY_TYPE_EXPIRED = 4;
  static LIST_NOTIFY_TYPE_COMPLETE = 5;
  static LIST_NOTIFY_TYPE_REJECT = 6;
  static LIST_NOTIFY_TYPE_RENEW = 7;
}
export const LOCATION = '';

export const LIST_NOTIFY_TYPE = [
  // { label: 'Xác nhận ký', value: 1 },
  { label: 'Ký hợp đồng thành công', value: Constants.LIST_NOTIFY_TYPE_USER_SIGN_DONE },
  { label: 'Nhắc ký hợp đồng', value: Constants.LIST_NOTIFY_TYPE_REMIND },
  { label: 'Hết hạn ký hợp đồng', value: Constants.LIST_NOTIFY_TYPE_EXPIRED },
  { label: 'Hợp đồng ký hoàn thành', value: Constants.LIST_NOTIFY_TYPE_COMPLETE },
  { label: 'Hợp đồng bị từ chối', value: Constants.LIST_NOTIFY_TYPE_REJECT },
  { label: 'Làm mới hợp đồng', value: Constants.LIST_NOTIFY_TYPE_RENEW },
  // { label: 'Yêu cầu ký hợp đồng', value: 8 },
  // { label: 'Hợp đồng đã bị hủy', value: 9 },
  // { label: 'Thông báo ký hợp đồng', value: 10 },
];
