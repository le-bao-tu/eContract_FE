import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { wardRouter } from '@util';
import { Observable } from 'rxjs';

import { HttpHeaders } from '@angular/common/http';
import { QueryFilerModel } from '@model';

@Injectable({
  providedIn: 'root',
})
export class WardApiService {
  constructor(private http: _HttpClient) {}

  create(model: any): Observable<any> {
    return this.http.post(environment.API_URL + wardRouter.create, model);
  }

  createMany(model: any[]): Observable<any> {
    return this.http.post(environment.API_URL + wardRouter.createMany, model);
  }

  update(model: any): Observable<any> {
    return this.http.put(environment.API_URL + wardRouter.update, model);
  }

  getById(id: string): Observable<any> {
    return this.http.get(environment.API_URL + wardRouter.getById + id);
  }

  delete(list: string[]): Observable<any> {
    const option = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: list,
    };
    return this.http.request('delete', environment.API_URL + wardRouter.delete, option);
  }

  getFilter(model: QueryFilerModel): Observable<any> {
    return this.http.post(environment.API_URL + wardRouter.getFilter, model);
  }

  getAll(): Observable<any> {
    return this.http.get(environment.API_URL + wardRouter.getAll);
  }
}
