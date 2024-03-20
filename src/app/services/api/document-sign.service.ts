import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { QueryFilerModel } from '@model';
import { documentSignRouter, documentTemplateRouter, getUrlDownloadFile, nodeUploadRouter } from '@util';
// RxJS
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DocumentSignService {
  constructor(private http: _HttpClient) { }
  signClientUSB(param: any): Observable<any> {
    const paramFormdata = new FormData();
    for (const key in param) {
      if (Array.isArray(param[key])) {
        param[key].forEach((element: any) => {
          paramFormdata.append(key, element);
        });
      } else {
        paramFormdata.append(key, param[key]);
      }
    }
    const option = {
      headers: new HttpHeaders(),
      body: paramFormdata,
    };
    const url = environment.CLIENT_HOST + 'api/v1/sign/base64';
    return this.http.request('post', url + '?_allow_anonymous=true', option).pipe(
      catchError((err) => {
        console.error(err);
        throw err;
      }),
    );
  }
  signHSM(model: any): Observable<any> {
    return this.http.post(environment.API_URL + documentSignRouter.signHSM + '?_allow_anonymous=true', model).pipe(
      catchError((err) => {
        console.error(err);
        throw err;
      }),
    );
  }
  signADSS(model: any): Observable<any> {
    return this.http.post(environment.API_URL + documentSignRouter.signADSS + '?_allow_anonymous=true', model).pipe(
      catchError((err) => {
        console.error(err);
        throw err;
      }),
    );
  }
  signMultiUsbToken(model: any): Observable<any> {
    const option = {
      headers: new HttpHeaders(),
      body: model,
    };
    const url = environment.CLIENT_HOST + 'api/v1/sign/pdf/bulk';
    return this.http.request('post', url + '?_allow_anonymous=true', option).pipe(
      catchError((err) => {
        console.error(err);
        throw err;
      }),
    );
  }
  signDigital(model: any, type: number = 0): Observable<any> {
    return this.http.post(environment.API_URL + documentSignRouter.signDigital + '?_allow_anonymous=true', model).pipe(
      catchError((err) => {
        console.error(err);
        throw err;
      }),
    );
  }
  signDigitalMail(model: any, type: number = 0): Observable<any> {
    return this.http.post(environment.API_URL + documentSignRouter.signDigitalMail + '?_allow_anonymous=true', model).pipe(
      catchError((err) => {
        console.error(err);
        throw err;
      }),
    );
  }
  signUSBTOKEN(model: any): Observable<any> {
    return this.http.post(environment.API_URL + documentSignRouter.signUSBToken + '?_allow_anonymous=true', model).pipe(
      catchError((err) => {
        console.error(err);
        throw err;
      }),
    );
  }
  signUSBTOKENHash(model: any): Observable<any> {
    return this.http.post(environment.CLIENT_HOST + documentSignRouter.signUSBTokenHash + '?_allow_anonymous=true', model).pipe(
      catchError((err) => {
        console.error(err);
        throw err;
      }),
    );
  }
  signMultiUSBTOKEN(model: any): Observable<any> {
    return this.http.post(environment.API_URL + documentSignRouter.signMultiUSBToken + '?_allow_anonymous=true', model).pipe(
      catchError((err) => {
        console.error(err);
        throw err;
      }),
    );
  }
  rejectDoc(value: any): Observable<any> {
    const option = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: value,
    };
    return this.http.request('put', environment.API_URL + documentSignRouter.rejectDoc + '?_allow_anonymous=true', option).pipe(
      catchError((err) => {
        console.error(err);
        throw err;
      }),
    );
  }
  sendOTP(value: string): Observable<any> {
    const option = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(value),
    };
    return this.http.request('post', environment.API_URL + documentSignRouter.sendOTP + '?_allow_anonymous=true', option).pipe(
      catchError((err) => {
        console.error(err);
        throw err;
      }),
    );
  }
  sendOTPAccessDocument(value: string): Observable<any> {
    const option = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(value),
    };
    return this.http
      .request('post', environment.API_URL + documentSignRouter.sendOTPAccessDocument + '?_allow_anonymous=true', option)
      .pipe(
        catchError((err) => {
          console.error(err);
          throw err;
        }),
      );
  }
  getDocument(model: any): Observable<any> {
    const params = new HttpParams().set('documentCode', model.documentCode).set('account', model.account).set('otp', model.otp);
    return this.http.get(environment.API_URL + documentSignRouter.getDocument + '?_allow_anonymous=true', params).pipe(
      catchError((err) => {
        console.error(err);
        throw err;
      }),
    );
  }
  getCoordinate(value: string): Observable<any> {
    const params = new HttpParams().set('documentId', value);
    return this.http.get(environment.API_URL + documentSignRouter.getCoordinate + '?_allow_anonymous=true', params).pipe(
      catchError((err) => {
        console.error(err);
        throw err;
      }),
    );
  }
  getMultiCoordinate(model: any): Observable<any> {
    return this.http.post(environment.API_URL + documentSignRouter.getMultiCoordinate + '?_allow_anonymous=true', model).pipe(
      catchError((err) => {
        console.error(err);
        throw err;
      }),
    );
  }
  getUrlDownloadFileBase64(bucketName: string, objectName: string): Observable<any> {
    const params = new HttpParams().set('bucketName', bucketName).set('objectName', objectName);
    return this.http.get(environment.API_URL + nodeUploadRouter.downloadFileBase64 + '?_allow_anonymous=true', params).pipe(
      catchError((err) => {
        console.error(err);
        throw err;
      }),
    );
  }
  checkCert(): any {
    const clientHost = environment.CLIENT_HOST + 'api/v1/cert';
    return this.http.get(clientHost + '?_allow_anonymous=true').pipe(
      catchError((err) => {
        console.error(err);
        throw err;
      }),
    );
  }
  getHash(data: any): Observable<any> {
    const clientHost = environment.API_URL + 'api/v1/sign-hash/hash-files';
    // const clientHost = 'http://10.0.20.32:9094/api/v1/hash/param-minio-usb'
    return this.http.post(clientHost + '?_allow_anonymous=true', data).pipe(
      catchError((err) => {
        console.error(err);
        throw err;
      }),
    );
  }
  getHashMail(data: any): Observable<any> {
    const clientHost = environment.API_URL + 'api/v1/sign-hash/hash-files-from-sign-page';
    // const clientHost = 'http://10.0.20.32:9094/api/v1/hash/param-minio-usb'
    return this.http.post(clientHost + '?_allow_anonymous=true', data).pipe(
      catchError((err) => {
        console.error(err);
        throw err;
      }),
    );
  }
  attachV2(data: any): Observable<any> {
    const clientHost = environment.API_URL + 'api/v1/sign-hash/attach-files';
    // const clientHost = 'http://10.0.20.32:9094/api/v1/attach/minio'
    return this.http.post(clientHost + '?_allow_anonymous=true', data).pipe(
      catchError((err) => {
        console.error(err);
        throw err;
      }),
    );
  }
  attachMail(data: any): Observable<any> {
    const clientHost = environment.API_URL + 'api/v1/sign-hash/attach-files-from-sign-page';
    // const clientHost = 'http://10.0.20.32:9094/api/v1/attach/minio'
    return this.http.post(clientHost + '?_allow_anonymous=true', data).pipe(
      catchError((err) => {
        console.error(err);
        throw err;
      }),
    );
  }
}
