import { Component, OnDestroy, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { IAfterGuiAttachedParams } from 'ag-grid-community';

@Component({
  selector: 'app-document-cell-render',
  templateUrl: './document-cell-render.component.html',
})
export class DocumentCellRenderComponent implements ICellRendererAngularComp, OnInit, OnDestroy {
  constructor() {}

  params: any;

  totalDocument = 0;
  documents: any[] = [];

  refresh(params: any): boolean {
    throw new Error('Method not implemented.');
  }
  afterGuiAttached?(params?: IAfterGuiAttachedParams): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {}

  agInit(params: any): void {
    this.params = params;

    if (this.params.data && this.params.data.documents) {
      this.documents = this.params.data.documents.documents;
      this.totalDocument = this.documents.length;
    }
  }

  ngOnDestroy(): any {
    // no need to remove the button click handler
    // https://stackoverflow.com/questions/49083993/does-angular-automatically-remove-template-event-listeners
  }

  btnDocumentInfoClick($event: any): any {
    this.params.btnDocumentInfoClick(this.params.data);
  }

  btnDocumentDropdownClick(item: any) {
    this.params.btnDocumentDropdownClick(item);
  }
}
