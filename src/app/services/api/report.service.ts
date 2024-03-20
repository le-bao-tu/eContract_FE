import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { reportRouter } from '@util';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  constructor(private http: _HttpClient) {}

  getReportDocumentByOrgID(model: any): Observable<any> {
    return this.http.post(environment.API_URL + reportRouter.GetReportDocumentByOrgID, model);
  }
}
