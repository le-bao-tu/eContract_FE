import { FormGroup } from '@angular/forms';
import { environment } from '@env/environment';

// Lưu các hàm dùng chung
export const stringToBoolean = (item: string) => {
  switch (item) {
    case 'Bắt buộc':
    case 'Sử dụng':
    case 'Hoạt động':
    case 'Đang áp dụng':
    case 'true':
    case 'yes':
    case '1':
      return true;
    case 'Không sử dụng':
    case 'Không hoạt động':
    case 'Ngừng áp dụng':
    case 'false':
    case 'no':
    case '0':
    case null:
      return false;
    default:
      return Boolean(item);
  }
};

export const numberWithCommas = (item: string) => {
  return item.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const cleanForm = (formGroup: FormGroup) => {
  Object.keys(formGroup.controls).forEach((key) => {
    if (typeof formGroup.get(key)?.value === 'string') {
      // console.log(formGroup.get(key)?.value);
      formGroup.get(key)?.setValue(formGroup.get(key)?.value.trim());
    }
  });
};

export const convertPixelToMilimet = (px: number) => {
  return px * 0.2645833333;
};

export const convertMilimetToPixcel = (mm: number) => {
  return mm * 3.7795275591;
};

export const getUrlDownloadFile = (bucketName: string, objectName: string) => {
  return ``;
};

export const base64ToArrayBuffer = (base64: string) => {
  let binary_string = base64.replace(/\\n/g, '');
  binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
};

export const getLocation = () => {
  const geolocation = navigator.geolocation;
  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };
  let lat = 0;
  let long = 0;
  if (geolocation) {
    geolocation.getCurrentPosition(
      // tslint:disable-next-line:only-arrow-functions
      (position: any) => {
        if (position?.coords) {
          lat = position?.coords?.latitude;
          long = position?.coords?.longitude;
          sessionStorage.setItem('location', btoa(JSON.stringify({ latitude: lat, longitude: long })));
        }
      },
      (err: any) => {},
      options,
    );
  } else {
    console.log('Trình duyệt của bạn không hỗ trợ Geolocation.');
  }
};

export const getOperatingSystem = () => {
  const navigator: any = window.navigator;
  const operatingSystem = {
    appCodeName: navigator.appCodeName,
    appName: navigator.appName,
    appVersion: navigator.appVersion,
    userAgent: navigator.userAgent,
    language: navigator.language,
    oscpu: navigator.oscpu,
    deviceMemory: navigator.deviceMemory,
    platform: navigator.platform,
    vendor: navigator.vendor,
    vendorSub: navigator.vendorSub,
    Product: navigator.product,
    productSub: navigator.productSub,
    cookieEnabled: navigator.cookieEnabled,
  };
  const operatingSystemBase64 = btoa(JSON.stringify(operatingSystem));
  sessionStorage.setItem('operating-system', operatingSystemBase64);
};
