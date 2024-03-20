import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { QueryFilerModel } from '@model';
import { documentTemplateRouter } from '@util';
// RxJS
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DocumentTemplateApiService {
  constructor(private http: _HttpClient) { }

  create(model: any): Observable<any> {
    return this.http.post(environment.API_URL + documentTemplateRouter.create, model);
  }

  duplicate(model: any): Observable<any> {
    return this.http.post(environment.API_URL + documentTemplateRouter.duplicate, model);
  }

  createMany(model: any[]): Observable<any> {
    return this.http.post(environment.API_URL + documentTemplateRouter.createMany, model);
  }

  update(model: any): Observable<any> {
    return this.http.put(environment.API_URL + documentTemplateRouter.update, model);
  }

  updateMetaDataConfig(model: any): Observable<any> {
    return this.http.put(environment.API_URL + documentTemplateRouter.updateMetaDataConfig, model);
  }

  getById(id: string): Observable<any> {
    return this.http.get(environment.API_URL + documentTemplateRouter.getById + id);
  }

  delete(list: [string]): Observable<any> {
    const option = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: list,
    };
    return this.http.request('delete', environment.API_URL + documentTemplateRouter.delete, option);
  }

  getFilter(model: QueryFilerModel): Observable<any> {
    return this.http.post(environment.API_URL + documentTemplateRouter.getFilter, model);
  }

  getListDocumentTemplateByGroupCode(model: any): Observable<any> {
    return this.http.post(environment.API_URL + documentTemplateRouter.getListDocumentTemplateByGroupCode, model);
  }

  getAll(): Observable<any> {
    return this.http.get(environment.API_URL + documentTemplateRouter.getAll);
  }

  getListCombobox(): Observable<any> {
    return this.http.get(environment.API_URL + documentTemplateRouter.getListCombobox);
  }

  getByType(value: string): Observable<any> {
    return this.http.get(environment.API_URL + documentTemplateRouter.getByType + `?id=` + value);
  }
}
