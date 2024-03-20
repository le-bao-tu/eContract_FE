import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { QueryFilerModel } from '@model';
import { userRoleRouter } from '@util';
// RxJS
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class UserRoleService {
  constructor(private http: _HttpClient) {}
  createOrUpdate(model: any): Observable<any> {
    return this.http.post(environment.API_URL + userRoleRouter.addRole, model);
  }
  getById(id: string): Observable<any> {
    return this.http.get(environment.API_URL + userRoleRouter.getById + id);
  }
  getByIdOwner(): Observable<any> {
    return this.http.get(environment.API_URL + userRoleRouter.getByIdOwner);
  }
}
