import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { QueryFilerModel } from '@model';
import { nodeUploadRouter } from '@util';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MinIOApiService {
  constructor(private http: _HttpClient) {}

  downloadFileBase64(bucketName: string, objectName: string): Observable<any> {
    return this.http.get(environment.API_URL + nodeUploadRouter.downloadFileBase64 + `?bucketName=${bucketName}&objectName=${objectName}`);
  }
  downloadFile(bucketName: string, objectName: string): Observable<any> {
    return this.http.get(environment.API_URL + nodeUploadRouter.downloadFile + `?bucketName=${bucketName}&objectName=${objectName}`);
  }
}
