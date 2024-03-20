import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { QueryFilerModel } from '@model';
import { rightRouter } from '@util';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RightApiService {
  constructor(private http: _HttpClient) {}

  create(model: any): Observable<any> {
    return this.http.post(environment.API_URL + rightRouter.create, model);
  }

  update(model: any): Observable<any> {
    return this.http.put(environment.API_URL + rightRouter.update, model);
  }

  getById(id: string): Observable<any> {
    return this.http.get(environment.API_URL + rightRouter.getById + id);
  }

  delete(list: string[]): Observable<any> {
    const option = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: list,
    };
    return this.http.request('delete', environment.API_URL + rightRouter.delete, option);
  }

  getFilter(model: QueryFilerModel): Observable<any> {
    return this.http.post(environment.API_URL + rightRouter.getFilter, model);
  }

  getListCombobox(): Observable<any> {
    return this.http.get(environment.API_URL + rightRouter.getListCombobox);
  }
}
