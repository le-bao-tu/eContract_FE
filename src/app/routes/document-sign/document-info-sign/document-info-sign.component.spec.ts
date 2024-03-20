/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DocumentInfoSignComponent } from './document-info-sign.component';

describe('DocumentInfoSignComponent', () => {
  let component: DocumentInfoSignComponent;
  let fixture: ComponentFixture<DocumentInfoSignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentInfoSignComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentInfoSignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
