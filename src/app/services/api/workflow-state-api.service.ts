import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { QueryFilerModel } from '@model';
import { workflowStateRouter } from '@util';
// RxJS
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkflowStateApiService {
  constructor(private http: _HttpClient) {}

  create(model: any): Observable<any> {
    return this.http.post(environment.API_URL + workflowStateRouter.create, model);
  }

  update(model: any): Observable<any> {
    return this.http.put(environment.API_URL + workflowStateRouter.update, model);
  }

  getById(id: string): Observable<any> {
    return this.http.get(environment.API_URL + workflowStateRouter.getById + id);
  }

  delete(list: [string]): Observable<any> {
    const option = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: list,
    };
    return this.http.request('delete', environment.API_URL + workflowStateRouter.delete, option);
  }

  getFilter(model: QueryFilerModel): Observable<any> {
    return this.http.post(environment.API_URL + workflowStateRouter.getFilter, model);
  }

  getListCombobox(): Observable<any> {
    return this.http.get(environment.API_URL + workflowStateRouter.getListCombobox);
  }
}
