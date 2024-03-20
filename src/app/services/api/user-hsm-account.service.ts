import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { QueryFilerModel } from '@model';
import { userHSMAccountRouter } from '@util';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserHSMAccountApiService {
  constructor(private http: _HttpClient) { }

  create(model: any): Observable<any> {
    return this.http.post(environment.API_URL + userHSMAccountRouter.create, model);
  }

  update(model: any): Observable<any> {
    return this.http.put(environment.API_URL + userHSMAccountRouter.update, model);
  }

  delete(list: string[]): Observable<any> {
    const option = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: list,
    };
    return this.http.request('delete', environment.API_URL + userHSMAccountRouter.delete, option);
  }

  getFilter(model: QueryFilerModel): Observable<any> {
    return this.http.post(environment.API_URL + userHSMAccountRouter.getFilter, model);
  }

  getListCombobox(userId: string): Observable<any> {
    return this.http.get(environment.API_URL + userHSMAccountRouter.getListCombobox + '?userId=' + userId);
  }

  getListComboboxHSMValid(userId: string): Observable<any> {
    return this.http.get(environment.API_URL + userHSMAccountRouter.getListComboboxHSMValid + '?userId=' + userId);
  }

  getInfoCertificate(userHSMAccountId: string): Observable<any> {
    return this.http.get(environment.API_URL + userHSMAccountRouter.getInfoCertificate + userHSMAccountId);
  }

  updateStatus(id: any): Observable<any> {
    return this.http.get(environment.API_URL + userHSMAccountRouter.updateStatus + '?userHSMAccountId=' + id);
  }
  // 14-6-2022 da sua de lay chung thu so
  getHSMAccount(model: QueryFilerModel): Observable<any> {
    return this.http.post(environment.API_URL + userHSMAccountRouter.getHSMAccount, model);
  }
}
