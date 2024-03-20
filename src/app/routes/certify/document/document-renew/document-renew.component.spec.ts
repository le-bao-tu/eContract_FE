import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentRenewComponent } from './document-renew.component';

describe('DocumentRenewComponent', () => {
  let component: DocumentRenewComponent;
  let fixture: ComponentFixture<DocumentRenewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentRenewComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentRenewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
