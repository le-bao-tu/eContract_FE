/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DocumentOtpSignComponent } from './document-otp-sign.component';

describe('DocumentOtpSignComponent', () => {
  let component: DocumentOtpSignComponent;
  let fixture: ComponentFixture<DocumentOtpSignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentOtpSignComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentOtpSignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
