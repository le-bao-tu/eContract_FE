import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { authWSO2 } from '@util';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Wso2Service {
  constructor(private http: _HttpClient) {}
  getAccessToken(authorization_code: any): Observable<any> {
    const url = environment.BASE_WSO2_API + `${authorization_code}` + authWSO2.authenticationInfoByCode;
    return this.http.get(url);
  }
  getRefreshToken(refresh_token_code: any): Observable<any> {
    const url = environment.BASE_WSO2_API + `${refresh_token_code}` + authWSO2.refreshUrl;
    return this.http.get(url);
  }
}
