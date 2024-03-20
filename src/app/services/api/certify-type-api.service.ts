import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { QueryFilerModel } from '@model';
import { certifyTypeRouter } from '@util';
// RxJS
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CertifyTypeApiService {
  constructor(private http: _HttpClient) { }
  create(model: any): Observable<any> {
    return this.http.post(environment.API_URL + certifyTypeRouter.create, model);
  }

  createMany(model: any[]): Observable<any> {
    return this.http.post(environment.API_URL + certifyTypeRouter.createMany, model);
  }

  update(model: any): Observable<any> {
    return this.http.put(environment.API_URL + certifyTypeRouter.update, model);
  }

  getById(id: string): Observable<any> {
    return this.http.get(environment.API_URL + certifyTypeRouter.getById + id);
  }

  delete(list: [string]): Observable<any> {
    const option = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: list,
    };
    return this.http.request('delete', environment.API_URL + certifyTypeRouter.delete, option);
  }

  getFilter(model: QueryFilerModel): Observable<any> {
    return this.http.post(environment.API_URL + certifyTypeRouter.getFilter, model);
  }

  getAll(): Observable<any> {
    return this.http.get(environment.API_URL + certifyTypeRouter.getAll);
  }

  getListCombobox(): Observable<any> {
    return this.http.get(environment.API_URL + certifyTypeRouter.getListCombobox);
  }

  getAllListCombobox(): Observable<any> {
    return this.http.get(environment.API_URL + certifyTypeRouter.getAllListCombobox);
  }

  getListComboboxAllStatus(): Observable<any> {
    return this.http.get(environment.API_URL + certifyTypeRouter.getListComboboxAllStatus);
  }
}
