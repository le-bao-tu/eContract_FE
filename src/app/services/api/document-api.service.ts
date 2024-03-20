import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { QueryFilerModel } from '@model';
import { documentRouter } from '@util';
// RxJS
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DocumentApiService {
  private optionSource = new BehaviorSubject<boolean>(false);
  optionCurrent = this.optionSource.asObservable();
  constructor(private http: _HttpClient) { }
  changeOption(option: boolean): any {
    this.optionSource.next(option);
  }
  create(model: any): Observable<any> {
    return this.http.post(environment.API_URL + documentRouter.create, model);
  }

  createMany(model: any[]): Observable<any> {
    return this.http.post(environment.API_URL + documentRouter.createMany, model);
  }

  updateSignExpireAtDate(model: any): Observable<any> {
    return this.http.post(environment.API_URL + documentRouter.updateSignExpireAtDate, model);
  }

  updateStatusTocancel(model: any): Observable<any> {
    return this.http.post(environment.API_URL + documentRouter.updateStatusTocancel, model);
  }

  update(model: any): Observable<any> {
    return this.http.put(environment.API_URL + documentRouter.update, model);
  }

  getById(id: string): Observable<any> {
    return this.http.get(environment.API_URL + documentRouter.getById + id);
  }

  getMaxSignExpiredByListDocumentIds(ids: any): Observable<any> {
    return this.http.post(environment.API_URL + documentRouter.getMaxExpiredAfterDayByListDocumentId, ids);
  }

  getByListId(listId: string[]): Observable<any> {
    return this.http.post(environment.API_URL + documentRouter.getByListId, listId);
  }

  getDocumentWFLHistory(id: string): Observable<any> {
    return this.http.get(environment.API_URL + documentRouter.getDocumentWFLHistory + id);
  }

  delete(list: string[]): Observable<any> {
    const option = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: list,
    };
    return this.http.request('delete', environment.API_URL + documentRouter.delete, option);
  }

  sendToWF(list: string[]): Observable<any> {
    return this.http.post(environment.API_URL + documentRouter.sendToWorkflow, list);
  }

  sendEmail(data: any): Observable<any> {
    return this.http.post(environment.API_URL + documentRouter.sendEmail, data);
  }

  sendMailToUserSign(model: any): Observable<any> {
    return this.http.post(environment.API_URL + documentRouter.sendEmailToUserSignWithConfig, model);
  }

  processingWorkflow(data: any): Observable<any> {
    return this.http.post(environment.API_URL + documentRouter.processingWorkflow, data);
  }

  rejectDocument(list: any): Observable<any> {
    return this.http.post(environment.API_URL + documentRouter.rejectDocument, list);
  }

  approveDocument(list: any[]): Observable<any> {
    return this.http.post(environment.API_URL + documentRouter.approveDocument, list);
  }

  getFilter(model: QueryFilerModel): Observable<any> {
    return this.http.post(environment.API_URL + documentRouter.getFilter, model);
  }

  getAll(): Observable<any> {
    return this.http.get(environment.API_URL + documentRouter.getAll);
  }

  getListCombobox(): Observable<any> {
    return this.http.get(environment.API_URL + documentRouter.getListCombobox);
  }

  getListDocumentByListUserId(userIds: any[]): Observable<any> {
    return this.http.post(environment.API_URL + documentRouter.getListDocumentByListUserId, userIds);
  }

  generateImagePreview(listDocumentId: any[]): Observable<any> {
    return this.http.post(environment.API_URL + documentRouter.generateImagePreview, listDocumentId);
  }

  getUserInFlowByListDocument(model: any) {
    return this.http.post(environment.API_URL + documentRouter.getUserInFlowByListDocument, model);
  }
}
