import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { authenticationRouter } from '@util';
// RxJS
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class AuthenticationApiService {
  constructor(private http: _HttpClient) {}

  login(model: any): Observable<any> {
    let path = authenticationRouter.getToken;
    if (environment.AUTH_TYPE === 'ad') {
      path = authenticationRouter.getTokenAuthenWithAD;
    }
    return this.http.post(environment.API_URL + path, model);
  }
}
