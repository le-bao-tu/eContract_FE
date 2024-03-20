import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { QueryFilerModel } from '@model';
import { organizationRouter } from '@util';
// RxJS
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrganizationApiService {
  constructor(private http: _HttpClient) { }

  create(model: any): Observable<any> {
    return this.http.post(environment.API_URL + organizationRouter.create, model);
  }

  createMany(model: any[]): Observable<any> {
    return this.http.post(environment.API_URL + organizationRouter.createMany, model);
  }

  update(model: any): Observable<any> {
    return this.http.put(environment.API_URL + organizationRouter.update, model);
  }

  getById(id: string): Observable<any> {
    return this.http.get(environment.API_URL + organizationRouter.getById + id);
  }

  getOrgInfoByCurrentUser(): Observable<any> {
    return this.http.get(environment.API_URL + organizationRouter.getOrgInfoByCurrentUser);
  }

  delete(list: string[]): Observable<any> {
    const option = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: list,
    };
    return this.http.request('delete', environment.API_URL + organizationRouter.delete, option);
  }

  getFilter(model: QueryFilerModel): Observable<any> {
    return this.http.post(environment.API_URL + organizationRouter.getFilter, model);
  }

  getAll(): Observable<any> {
    return this.http.get(environment.API_URL + organizationRouter.getAll);
  }

  getListCombobox(): Observable<any> {
    return this.http.get(environment.API_URL + organizationRouter.getListCombobox);
  }

  getListComboboxCurrentOrgOfUser(): Observable<any> {
    return this.http.get(environment.API_URL + organizationRouter.getListComboboxCurrentOrgOfUser);
  }

  getListComboboxAll(status: boolean | null): Observable<any> {
    if (status == true || status == false) {
      return this.http.get(environment.API_URL + organizationRouter.getListComboboxAll + `?status=${status}`);
    }

    return this.http.get(environment.API_URL + organizationRouter.getListComboboxAll);
  }
}
