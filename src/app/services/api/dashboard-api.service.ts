import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { QueryFilerModel } from '@model';
import { homeRouter } from '@util';
// RxJS
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardApiService {
  constructor(private http: _HttpClient) {}

  getDashboardInfo(model: any): Observable<any> {
    return this.http.post(environment.API_URL + homeRouter.getDocumentInfo, model);
  }
}
