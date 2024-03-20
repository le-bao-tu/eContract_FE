import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { QueryFilerModel } from '@model';
import { notifyConfigRouter } from '@util';
// RxJS
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotifyConfigApiService {
  constructor(private http: _HttpClient) { }

  create(model: any): Observable<any> {
    return this.http.post(environment.API_URL + notifyConfigRouter.create, model);
  }

  update(model: any): Observable<any> {
    return this.http.put(environment.API_URL + notifyConfigRouter.update, model);
  }

  getById(id: string): Observable<any> {
    return this.http.get(environment.API_URL + notifyConfigRouter.getById + id);
  }

  delete(list: [string]): Observable<any> {
    const option = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: list,
    };
    return this.http.request('delete', environment.API_URL + notifyConfigRouter.delete, option);
  }

  getFilter(model: QueryFilerModel): Observable<any> {
    return this.http.post(environment.API_URL + notifyConfigRouter.getFilter, model);
  }

  getListCombobox(): Observable<any> {
    return this.http.get(environment.API_URL + notifyConfigRouter.getListCombobox);
  }
}
