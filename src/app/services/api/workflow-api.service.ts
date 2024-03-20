import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { QueryFilerModel } from '@model';
import { workflowRouter } from '@util';
// RxJS
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkflowApiService {
  constructor(private http: _HttpClient) {}

  create(model: any): Observable<any> {
    return this.http.post(environment.API_URL + workflowRouter.create, model);
  }

  createMany(model: any[]): Observable<any> {
    return this.http.post(environment.API_URL + workflowRouter.createMany, model);
  }

  update(model: any): Observable<any> {
    return this.http.put(environment.API_URL + workflowRouter.update, model);
  }

  getById(id: string): Observable<any> {
    return this.http.get(environment.API_URL + workflowRouter.getById + id);
  }

  delete(list: [string]): Observable<any> {
    const option = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: list,
    };
    return this.http.request('delete', environment.API_URL + workflowRouter.delete, option);
  }

  getFilter(model: QueryFilerModel): Observable<any> {
    return this.http.post(environment.API_URL + workflowRouter.getFilter, model);
  }

  getAll(): Observable<any> {
    return this.http.get(environment.API_URL + workflowRouter.getAll);
  }

  getListCombobox(userId: any): Observable<any> {
    return this.http.get(environment.API_URL + workflowRouter.getListCombobox + '?userId=' + userId);
  }
}
