import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { QueryFilerModel } from '@model';
import { servicePackageRouter } from '@util';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServicePackageService {
  constructor(private http: _HttpClient) {}

  create(model: any): Observable<any> {
    return this.http.post(environment.API_URL + servicePackageRouter.create, model);
  }

  createMany(model: any[]): Observable<any> {
    return this.http.post(environment.API_URL + servicePackageRouter.createMany, model);
  }
  getGenerateCode(): Observable<any> {
    return this.http.get(environment.API_URL + servicePackageRouter.generateCode);
  }
  update(model: any): Observable<any> {
    return this.http.put(environment.API_URL + servicePackageRouter.update, model);
  }

  getById(id: string): Observable<any> {
    return this.http.get(environment.API_URL + servicePackageRouter.getById + id);
  }

  delete(list: [string]): Observable<any> {
    const option = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: list,
    };
    return this.http.request('delete', environment.API_URL + servicePackageRouter.delete, option);
  }

  getFilter(model: QueryFilerModel): Observable<any> {
    return this.http.post(environment.API_URL + servicePackageRouter.getFilter, model);
  }

  getAll(): Observable<any> {
    return this.http.get(environment.API_URL + servicePackageRouter.getAll);
  }

  getListCombobox(): Observable<any> {
    return this.http.get(environment.API_URL + servicePackageRouter.getListCombobox);
  }
}
