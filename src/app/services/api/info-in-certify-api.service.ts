import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { QueryFilerModel } from '@model';
import { infoInCertify } from '@util';
// RxJS
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InfoInCertifyApiService {
  constructor(private http: _HttpClient) {}

  create(model: any): Observable<any> {
    return this.http.post(environment.API_URL + infoInCertify.create, model);
  }

  createMany(model: any[]): Observable<any> {
    return this.http.post(environment.API_URL + infoInCertify.createMany, model);
  }

  update(model: any): Observable<any> {
    return this.http.put(environment.API_URL + infoInCertify.update, model);
  }

  getById(id: string): Observable<any> {
    return this.http.get(environment.API_URL + infoInCertify.getById + id);
  }

  delete(list: [string]): Observable<any> {
    const option = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: list,
    };
    return this.http.request('delete', environment.API_URL + infoInCertify.delete, option);
  }

  getFilter(model: QueryFilerModel): Observable<any> {
    return this.http.post(environment.API_URL + infoInCertify.getFilter, model);
  }

  getAll(): Observable<any> {
    return this.http.get(environment.API_URL + infoInCertify.getAll);
  }

  getListCombobox(): Observable<any> {
    return this.http.get(environment.API_URL + infoInCertify.getListCombobox);
  }
}
