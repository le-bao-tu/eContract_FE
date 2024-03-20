/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DocumentListCertComponent } from './document-list-cert.component';

describe('DocumentListCertComponent', () => {
  let component: DocumentListCertComponent;
  let fixture: ComponentFixture<DocumentListCertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentListCertComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentListCertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
