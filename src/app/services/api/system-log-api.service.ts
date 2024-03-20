import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { QueryFilerModel } from '@model';
import { systemLogRouter } from '@util';
// RxJS
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SystemLogApiService {
  constructor(private http: _HttpClient) {}

  getById(id: string): Observable<any> {
    return this.http.get(environment.API_URL + systemLogRouter.getById + id);
  }

  getFilter(model: QueryFilerModel): Observable<any> {
    return this.http.post(environment.API_URL + systemLogRouter.getFilter, model);
  }

  getByDocument(id: string): Observable<any> {
    return this.http.get(environment.API_URL + systemLogRouter.getByDocument + `?documentId=${id}`);
  }

  getAllActionCodeForCombobox(): Observable<any> {
    return this.http.get(environment.API_URL + systemLogRouter.getAllActionCodeForCombobox);
  }
}
