import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { QueryFilerModel } from '@model';
import { userSignConfigRouter } from '@util';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserSignConfigApiService {
  constructor(private http: _HttpClient) {}

  create(model: any): Observable<any> {
    return this.http.post(environment.API_URL + userSignConfigRouter.create, model);
  }
  update(model: any): Observable<any> {
    return this.http.put(environment.API_URL + userSignConfigRouter.update, model);
  }
  delete(list: string[]): Observable<any> {
    const option = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: list,
    };
    return this.http.request('delete', environment.API_URL + userSignConfigRouter.delete, option);
  }

  getFilter(model: QueryFilerModel): Observable<any> {
    return this.http.post(environment.API_URL + userSignConfigRouter.getFilter, model);
  }
  getListCombobox(userId: string): Observable<any> {
    return this.http.get(environment.API_URL + userSignConfigRouter.getListCombobox + '?userId=' + userId);
  }
  getListComboboxSign(userId: string): Observable<any> {
    return this.http.get(environment.API_URL + userSignConfigRouter.getListComboboxSign + '?_allow_anonymous=true&userId=' + userId);
  }
}
