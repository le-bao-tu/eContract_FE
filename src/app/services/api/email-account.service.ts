import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { emailAccountRouter } from '@util';
// RxJS
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class EmaillAccountService {
  constructor(private http: _HttpClient) {}
  getListCombobox(): Observable<any> {
    return this.http.get(environment.API_URL + emailAccountRouter.getListCombobox);
  }
}
