import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { authWSO2 } from '@util';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  constructor(private http: _HttpClient) {}
  getEnvironment(): Observable<any> {
    const url = `assets/env.json`;
    return this.http.get(url);
  }
}
