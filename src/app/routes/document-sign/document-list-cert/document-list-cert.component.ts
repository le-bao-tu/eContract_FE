import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModel } from '@model';
import { Constants } from '@util';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-document-list-cert',
  templateUrl: './document-list-cert.component.html',
  styleUrls: ['./document-list-cert.component.scss'],
})
export class DocumentListCertComponent implements OnInit {
  // @Input() item: any;
  @Input() isVisible = false;
  // @Input() option: any;
  isLoading = false;
  option: any = {};
  title = 'Xác nhận chứng thư số';
  @Output() eventEmmit = new EventEmitter<any>();
  btnSave: ButtonModel;
  otp: any;
  dataShow: any;
  listCert: any;
  radioValue: any;
  constructor(private fb: FormBuilder, private msg: NzMessageService) {
    this.btnSave = {
      title: 'Xác nhận ký hợp đồng',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.access_Sign();
      },
    };
  }

  ngOnInit(): any {}
  public initData(data: any[]): void {
    this.isVisible = true;
    // console.log(data);
    this.listCert = data;
    this.radioValue = this.listCert[0].serial;
  }
  handleCancel(): void {
    if (this.isLoading) {
      return;
    }
    this.isVisible = false;
    this.eventEmmit.emit({ type: 'close' });
  }
  sendOTP(): any {
    this.eventEmmit.emit({ type: 'sendOTP' });
  }
  access_Sign(): void {
    this.isLoading = true;
    this.isVisible = false;
    let dataRs = this.listCert.find((item: any) => {
      return item.serial === this.radioValue;
    });
    // console.log(dataRs);
    this.eventEmmit.emit({ type: 'access_Sign', dataResult: dataRs });
    this.isLoading = false;
    return this.radioValue;
  }
}
