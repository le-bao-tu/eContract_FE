import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModel } from '@model';
import { Constants } from '@util';
import moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-document-otp-sign',
  templateUrl: './document-otp-sign.component.html',
  styleUrls: ['./document-otp-sign.component.scss'],
})
export class DocumentOtpSignComponent implements OnInit {
  // @Input() item: any;
  @Input() isVisible = false;
  // @Input() option: any;
  isLoading = false;
  option: any = {};
  title = '';
  @Output() eventEmmit = new EventEmitter<any>();
  btnSave: ButtonModel;
  otp: any = null;
  dataShow: any;
  form: FormGroup;
  dataHSM: any;
  showInput = true;
  idHSM: any;

  timeSendOTP: Date = new Date();

  countDown: Subscription | null | undefined;
  counter = 180;
  tick = 1000;

  constructor(private fb: FormBuilder, private msg: NzMessageService) {
    this.form = this.fb.group({
      comment: [null, [Validators.maxLength(100)]],
    });
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
    this.countDown = timer(0, this.tick).subscribe(() => --this.counter);
  }

  ngOnInit(): any { }
  public initData(data: number, list?: any): void {
    this.isVisible = true;
    this.otp = '';
    this.showInput = true;
    this.dataHSM = '';
    if (data === Constants.SIGN_HSM || data === Constants.SIGN_ADSS) {
      if (data === Constants.SIGN_HSM) {
        (this.title = 'Xác nhận chứng thư số HSM'),
          (this.dataShow = {
            message: 'Vui lòng chọn chứng thư số HSM',
            type: 'PIN',
          });
      } else {
        (this.title = 'Xác nhận ký ADSS'),
          (this.dataShow = {
            message: 'Vui lòng chọn ký chứng thư số ADSS',
            type: 'PIN',
          });
      }
      if (list) {
        this.dataHSM = list;
        this.idHSM = this.dataHSM[0].id;
        if (this.dataHSM[0]?.isHasUserPIN) {
          this.showInput = false;
        } else {
          this.showInput = true;
        }
      }
    } else if (data === Constants.SIGN_DIG) {
      this.timeSendOTP = new Date();
      this.counter = 180;
      (this.title = 'Xác nhận mã OTP'),
        (this.dataShow = {
          message: 'Vui lòng nhập mã OTP đã được gửi về mail hoặc số điện thoại',
          type: 'OTP',
        });
    } else if (data === Constants.REJECT_DOC) {
      (this.title = 'Lý do từ chối'), (this.btnSave.title = 'Từ chối');
      this.dataShow = {
        message: 'Vui lòng nhập lý do từ chối',
        type: 'REJECT',
        error: 'Vui lòng nhập lý do dưới 100 ký tự!',
      };
    }
  }
  handleCancel(): void {
    if (this.isLoading) {
      return;
    }
    this.isVisible = false;
    // this.countDown = null;
    this.eventEmmit.emit({ type: 'close' });
  }

  formatSecondToHHMM(value: number): string {
    const minutes: number = Math.floor(value / 60);
    return ('00' + minutes).slice(-2) + ':' + ('00' + Math.floor(value - minutes * 60)).slice(-2);
  }

  sendOTP(): any {
    const now = moment(new Date()); // todays date
    const end = moment(this.timeSendOTP); // another date
    const duration = moment.duration(now.diff(end));
    const seconds = duration.asSeconds();

    if (seconds > 180) {
      this.counter = 180;
      this.timeSendOTP = new Date();
      this.eventEmmit.emit({ type: 'sendOTP' });
    } else {
      const s = Math.floor(180 - seconds);
      this.msg.warning(`Vui lòng chờ thêm ${this.formatSecondToHHMM(s)} để gửi lại OTP!`);
    }
  }
  access_Sign(): void {
    this.isLoading = true;
    if (this.otp == '' && this.showInput) {
      this.isVisible = false;
      this.msg.error('Vui lòng nhập mã!');
    } else if (this.otp != null) {
      this.isVisible = false;
      let outputdata;
      if (this.dataShow.type == 'PIN') {
        // Nếu là ký HSM
        outputdata = {
          hsmAcountId: this.idHSM,
          userPin: this.otp,
        };
      } else {
        // Nếu là ký điện tử
        outputdata = this.otp;
      }
      this.eventEmmit.emit({ type: 'access_Sign', dataResult: outputdata });
    } else if (this.dataShow.type === 'REJECT') {
      this.isVisible = false;
      this.eventEmmit.emit({ type: 'reject_Sign', dataResult: this.form.value.comment });
    } else {
      this.msg.error(`Vui lòng nhập mã ${this.dataShow.type}`);
    }

    this.isLoading = false;
    // return this.otp;
  }
  onChangeSign(event: any) {
    const dataDefault = this.dataHSM.find((item: any) => {
      return item.id == event;
    });

    if (dataDefault.isHasUserPIN) {
      this.showInput = false;
    } else {
      this.showInput = true;
    }
  }
}
