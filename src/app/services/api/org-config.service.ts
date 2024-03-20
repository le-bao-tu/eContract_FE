import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { orgConfigRouter } from '@util';
// RxJS
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class OrgConfigService {
  constructor(private http: _HttpClient) {}
  createOrUpdate(model: any): Observable<any> {
    return this.http.post(environment.API_URL + orgConfigRouter.createOrUpdate, model);
  }
  getById(id: string): Observable<any> {
    return this.http.get(environment.API_URL + orgConfigRouter.getById + id);
  }

}
