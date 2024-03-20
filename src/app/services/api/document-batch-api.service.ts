import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { QueryFilerModel } from '@model';
import { documentBatchRouter } from '@util';
// RxJS
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DocumentBatchApiService {
  constructor(private http: _HttpClient) {}

  create(model: any): Observable<any> {
    return this.http.post(environment.API_URL + documentBatchRouter.create, model);
  }

  getById(id: string): Observable<any> {
    return this.http.get(environment.API_URL + documentBatchRouter.getById + id);
  }

  delete(list: [string]): Observable<any> {
    const option = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: list,
    };
    return this.http.request('delete', environment.API_URL + documentBatchRouter.delete, option);
  }

  generateCertificate(data: any): Observable<any> {
    return this.http.post(environment.API_URL + documentBatchRouter.generateCertificate, data);
  }

  // getFilter(model: QueryFilerModel): Observable<any> {
  //   return this.http.post(environment.API_URL + documentBatchRouter.getFilter, model);
  // }

  // getAll(): Observable<any> {
  //   return this.http.get(environment.API_URL + documentBatchRouter.getAll);
  // }

  getListCombobox(): Observable<any> {
    return this.http.get(environment.API_URL + documentBatchRouter.getListCombobox);
  }
}
