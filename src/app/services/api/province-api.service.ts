import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { QueryFilerModel } from '@model';
import { provinceRouter } from '@util';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class ProvinceApiService {
  constructor(private http: _HttpClient) {}

  create(model: any): Observable<any> {
    return this.http.post(environment.API_URL + provinceRouter.create, model);
  }

  createMany(model: any[]): Observable<any> {
    return this.http.post(environment.API_URL + provinceRouter.createMany, model);
  }

  update(model: any): Observable<any> {
    return this.http.put(environment.API_URL + provinceRouter.update, model);
  }

  getById(id: string): Observable<any> {
    return this.http.get(environment.API_URL + provinceRouter.getById + id);
  }

  delete(list: string[]): Observable<any> {
    const option = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: list,
    };
    return this.http.request('delete', environment.API_URL + provinceRouter.delete, option);
  }

  getFilter(model: QueryFilerModel): Observable<any> {
    return this.http.post(environment.API_URL + provinceRouter.getFilter, model);
  }

  getAll(): Observable<any> {
    return this.http.get(environment.API_URL + provinceRouter.getAll);
  }

  getListCombobox(districtId: any = null): Observable<any> {
    let url = `${environment.API_URL + provinceRouter.getListCombobox}`;
    if (districtId) { url = `${environment.API_URL + provinceRouter.getListCombobox}?districtId=${districtId}`; }
    return this.http.get(url);
  }
}
