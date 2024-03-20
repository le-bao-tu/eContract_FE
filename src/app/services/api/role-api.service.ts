import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { QueryFilerModel } from '@model';
import { roleRouter } from '@util';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoleApiService {
  constructor(private http: _HttpClient) {}

  create(model: any): Observable<any> {
    return this.http.post(environment.API_URL + roleRouter.create, model);
  }

  update(model: any): Observable<any> {
    return this.http.put(environment.API_URL + roleRouter.update, model);
  }

  getById(id: string): Observable<any> {
    return this.http.get(environment.API_URL + roleRouter.getById + id);
  }

  delete(list: string[]): Observable<any> {
    const option = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: list,
    };
    return this.http.request('delete', environment.API_URL + roleRouter.delete, option);
  }

  getFilter(model: QueryFilerModel): Observable<any> {
    return this.http.post(environment.API_URL + roleRouter.getFilter, model);
  }

  getListCombobox(): Observable<any> {
    return this.http.get(environment.API_URL + roleRouter.getListCombobox);
  }

  savePermission(model: any): Observable<any> {
    return this.http.post(environment.API_URL + roleRouter.savePermission, model);
  }

  getDataPermission(model: any): Observable<any> {
    return this.http.post(environment.API_URL + roleRouter.getDataPermission, model);
  }

  getListRightIdByRole(model: any): Observable<any> {
    return this.http.post(environment.API_URL + roleRouter.getListRightIdByRole, model);
  }

  updateRightByRole(model: any): Observable<any> {
    return this.http.post(environment.API_URL + roleRouter.updateRightByRole, model);
  }

  getListMenuIdByRole(model: any): Observable<any> {
    return this.http.post(environment.API_URL + roleRouter.getListNavigationIdByRole, model);
  }

  updateMenuByRole(model: any): Observable<any> {
    return this.http.post(environment.API_URL + roleRouter.updateNavigationByRole, model);
  }
}
