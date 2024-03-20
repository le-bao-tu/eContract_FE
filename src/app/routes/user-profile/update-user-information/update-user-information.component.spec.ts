import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateUserInformationComponent } from './update-user-information.component';

describe('UpdateUserInformationComponent', () => {
  let component: UpdateUserInformationComponent;
  let fixture: ComponentFixture<UpdateUserInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateUserInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateUserInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
