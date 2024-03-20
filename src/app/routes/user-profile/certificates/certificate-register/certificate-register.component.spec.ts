import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateRegisterComponent } from './certificate-register.component';

describe('CertificateRegisterComponent', () => {
  let component: CertificateRegisterComponent;
  let fixture: ComponentFixture<CertificateRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CertificateRegisterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CertificateRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
