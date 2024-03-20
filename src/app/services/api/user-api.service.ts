import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { userRouter } from '@util';
// RxJS
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  constructor(private http: _HttpClient) { }

  getRightOfUser(userId: string, applicationId: string): Observable<any> {
    return this.http.get(environment.API_URL + userRouter.getListRightOfUser + `/${userId}/right?applicationId=${applicationId}`);
  }

  getRoleOfUser(userId: string, applicationId: string): Observable<any> {
    return this.http.get(environment.API_URL + userRouter.getListRoleOfUser + `/${userId}/role?applicationId=${applicationId}`);
  }
  changePassword(userUpdatePasswordModel: any): Observable<any> {
    return this.http.put(environment.API_URL + userRouter.changePassword, userUpdatePasswordModel);
  }

  create(model: any): Observable<any> {
    return this.http.post(environment.API_URL + userRouter.create, model);
  }

  update(model: any): Observable<any> {
    return this.http.put(environment.API_URL + userRouter.update, model);
  }

  updateUserPIN(model: any): Observable<any> {
    return this.http.put(environment.API_URL + userRouter.updateUserPIN, model);
  }

  getById(id: string): Observable<any> {
    return this.http.get(environment.API_URL + userRouter.getById + id);
  }

  delete(list: [string]): Observable<any> {
    const option = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: list,
    };
    return this.http.request('delete', environment.API_URL + userRouter.delete, option);
  }

  getFilter(model: any): Observable<any> {
    return this.http.post(environment.API_URL + userRouter.getFilter, model);
  }

  getAll(): Observable<any> {
    return this.http.get(environment.API_URL + userRouter.getAll);
  }

  getListCombobox(orgId: any): Observable<any> {
    if (orgId) {
      return this.http.get(environment.API_URL + userRouter.getListCombobox + '?orgId=' + orgId);
    } else {
      return this.http.get(environment.API_URL + userRouter.getListCombobox);
    }
  }

  getListComboboxByRootOrg(orgId: any): Observable<any> {
    if (orgId) {
      return this.http.get(environment.API_URL + userRouter.getListComboboxByRootOrg + '?orgId=' + orgId);
    } else {
      return this.http.get(environment.API_URL + userRouter.getListComboboxByRootOrg);
    }
  }

  getListComboboxFilterInternalUser(isInternalUser: any, orgId: any): Observable<any> {
    var url = environment.API_URL + userRouter.getListComboboxFilterInternalUser;

    if (isInternalUser) {
      url += `?isInternalUser=${isInternalUser}`;

      if (orgId) {
        url += `&orgId=${orgId}`;
      }
    } else {
      if (orgId) {
        url += `?orgId=${orgId}`;
      }
    }

    return this.http.get(url);
  }

  getUserRole(model: any): Observable<any> {
    return this.http.post(environment.API_URL + userRouter.getUserRole, model);
  }

  updateUserRole(model: any): Observable<any> {
    return this.http.post(environment.API_URL + userRouter.updateUserRole, model);
  }

  saveListUserRole(model: any): Observable<any> {
    return this.http.post(environment.API_URL + userRouter.saveListUserRole, model);
  }

  getListUserIdByRole(model: any): Observable<any> {
    return this.http.post(environment.API_URL + userRouter.getListUserIdByRole, model);
  }

  userConfig(model: any): Observable<any> {
    return this.http.post(environment.API_URL + userRouter.userConfig, model);
  }
}
