import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnCreateComponent } from './btn-create.component';

describe('BtnCreateComponent', () => {
  let component: BtnCreateComponent;
  let fixture: ComponentFixture<BtnCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BtnCreateComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
