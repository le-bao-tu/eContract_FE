import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { districtRouter } from '@util';
import { Observable } from 'rxjs';

import { HttpHeaders } from '@angular/common/http';
import { QueryFilerModel } from '@model';

@Injectable({
  providedIn: 'root',
})
export class DistrictApiService {
  constructor(private http: _HttpClient) {}

  create(model: any): Observable<any> {
    return this.http.post(environment.API_URL + districtRouter.create, model);
  }

  createMany(model: any[]): Observable<any> {
    return this.http.post(environment.API_URL + districtRouter.createMany, model);
  }

  update(model: any): Observable<any> {
    return this.http.put(environment.API_URL + districtRouter.update, model);
  }

  getById(id: string): Observable<any> {
    return this.http.get(environment.API_URL + districtRouter.getById + id);
  }

  delete(list: string[]): Observable<any> {
    const option = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: list,
    };
    return this.http.request('delete', environment.API_URL + districtRouter.delete, option);
  }

  getFilter(model: QueryFilerModel): Observable<any> {
    return this.http.post(environment.API_URL + districtRouter.getFilter, model);
  }

  getAll(): Observable<any> {
    return this.http.get(environment.API_URL + districtRouter.getAll);
  }

  getListCombobox(provinceId: any = null): Observable<any> {
    let url = `${environment.API_URL + districtRouter.getListCombobox}`;
    if (provinceId) { url = `${environment.API_URL + districtRouter.getListCombobox}?provinceId=${provinceId}`; }

    return this.http.get(url);
  }
}
