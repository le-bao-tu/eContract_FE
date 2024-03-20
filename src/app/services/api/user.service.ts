import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { QueryFilerModel } from '@model';
import { usersRouter } from '@util';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: _HttpClient) {}

  create(model: any): Observable<any> {
    return this.http.post(environment.API_URL + usersRouter.create, model);
  }

  createMany(model: any[]): Observable<any> {
    return this.http.post(environment.API_URL + usersRouter.createMany, model);
  }

  update(model: any): Observable<any> {
    return this.http.put(environment.API_URL + usersRouter.update, model);
  }

  updateStatus(id: any): Observable<any> {
    return this.http.get(environment.API_URL + usersRouter.updateStatus + '?userHSMAccountId=' + id);
  }

  updateUserProfile(model: any): Observable<any> {
    return this.http.put(environment.API_URL + usersRouter.updateUserProfile, model);
  }


  getById(id: string): Observable<any> {
    return this.http.get(environment.API_URL + usersRouter.getById + id);
  }

  getCurrentUserInfo(): Observable<any> {
    return this.http.get(environment.API_URL + usersRouter.getCurrentUserInfo);
  }

  getListUserDevice(id: any): Observable<any> {
    return this.http.get(environment.API_URL + usersRouter.getListUserDevice + id);
  }

  delete(list: [string]): Observable<any> {
    const option = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      method: 'DELETE',
      body: list,
    };
    return this.http.request('delete', environment.API_URL + usersRouter.delete, option);
  }

  lock(list: any): Observable<any> {
    const option = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: list,
    };
    return this.http.request('put', environment.API_URL + usersRouter.lock, option);
  }

  getFilter(model: QueryFilerModel): Observable<any> {
    return this.http.post(environment.API_URL + usersRouter.getFilter, model);
  }

  getUserHSMAccount(model: QueryFilerModel): Observable<any> {
    return this.http.post(environment.API_URL + usersRouter.getUserHSMAccount, model);
  }

  getAll(): Observable<any> {
    return this.http.get(environment.API_URL + usersRouter.getAll);
  }

  sendOTPAuth(): Observable<any> {
    return this.http.post(environment.API_URL + usersRouter.sendOTPAuth);
  }

  getUserPermission(): Observable<any> {
    return this.http.get(environment.API_URL + usersRouter.getUserPermission);
  }

  getListCombobox(): Observable<any> {
    return this.http.get(environment.API_URL + usersRouter.getListCombobox);
  }

  getUserOrOrgInfo(id: string | null, type: string | null): Observable<any> {
    return this.http.put(environment.API_URL + usersRouter.getUserOrOrgInfo + '?id=' + id + '&type=' + type);
  }
}
