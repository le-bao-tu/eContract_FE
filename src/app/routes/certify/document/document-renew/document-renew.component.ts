import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModel } from '@model';
import { DocumentApiService } from '@service';
import { Constants, LIST_NOTIFY_TYPE } from '@util';
import { differenceInCalendarDays, setHours } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import { NotifyConfigApiService } from 'src/app/services/api/notify-config-api.service';

import * as moment from 'moment';

@Component({
  selector: 'app-document-renew',
  templateUrl: './document-renew.component.html',
  styleUrls: ['./document-renew.component.less'],
})
export class DocumentRenewComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private notifyConfigApiService: NotifyConfigApiService,
    private documentApiService: DocumentApiService,
  ) {
    this.btnCancel = {
      title: 'Đóng',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.handleCancel();
      },
    };

    this.btnSave = {
      title: 'Lưu',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.save();
      },
    };

    this.btnSaveAndNotify = {
      title: 'Lưu và Gửi TB',
      titlei18n: '',
      visible: true,
      enable: false,
      grandAccess: true,
      click: ($event: any) => {
        this.save();
      },
    };

    this.form = this.fb.group({
      signExpireAtDate: [null, [Validators.required]],
      notifyConfigId: [{ value: null }],
      lastReasonReject: ['', [Validators.required]],
      userIds: [null]
    });

    this.tomorrow.setDate(this.tomorrow.getDate() + 1);
  }
  @Input() title = '';
  @Input() item: any;
  @Input() isVisible = false;
  @Output() eventEmmit = new EventEmitter<any>();

  isContinue = false;
  isLoading = false;
  isReloadGrid = false;
  isSaveAndNotify = true;
  listNotifyConfig: any[] = [];

  btnCancel: ButtonModel;
  btnSave: ButtonModel;
  btnSaveAndNotify: ButtonModel;
  form: FormGroup;
  nextDate: Date = new Date();
  now: Date = new Date();
  tomorrow: Date = new Date();
  isHasMaxDate = false;

  items: any[] = [];
  listNotifyType: any[] = LIST_NOTIFY_TYPE.filter((x) => x.value === Constants.LIST_NOTIFY_TYPE_RENEW);
  listUserNotify: any[] = [];

  ngOnInit(): void {
    this.initListNotifyConfig();
  }

  disabledSignExpireAtDate = (current: Date): boolean => {
    if (!this.isHasMaxDate) {
      return differenceInCalendarDays(this.tomorrow, current) > 0;
    }
    return differenceInCalendarDays(this.tomorrow, current) > 0 || differenceInCalendarDays(current, this.nextDate) > 0;
  };

  loadUserNotify(docIds: any[]) {
    let model = {
      documentIds: docIds
    };
    this.documentApiService.getUserInFlowByListDocument(model).subscribe(
      (res: any) => {
        if (res.code !== 200) {
          this.messageService.error(`${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.messageService.error(`${res.message}`);
          return;
        }

        this.listUserNotify = res.data;
      },
      (err: any) => console.log('err: ', err)
    )
  }

  initData(data: any, docIds?: any[]): void {
    this.form.reset();
    this.title = 'Cập nhật trạng thái hợp đồng';
    this.isVisible = true;
    this.btnSaveAndNotify.enable = false;

    const today = new Date();
    this.nextDate.setDate(today.getDate() + 365);

    if (docIds) {
      this.documentApiService.getMaxSignExpiredByListDocumentIds(docIds).subscribe(
        (res) => {
          if (res.data) {
            this.isHasMaxDate = true;
            this.nextDate = new Date(today.setDate(today.getDate() + res.data));
            this.form.get('signExpireAtDate')?.setValue(this.nextDate);
          } else {
            this.isHasMaxDate = false;
            this.form.get('signExpireAtDate')?.setValue('');
          }
        },
        (err) => {
          this.isHasMaxDate = false;
        },
      );

      this.items = docIds;

      this.loadUserNotify(docIds);
    } else {
      this.documentApiService.getById(data.id).subscribe(
        (res) => {
          if (res.data && res.data.signExpireAfterDay) {
            this.isHasMaxDate = true;
            this.nextDate = new Date(today.setDate(today.getDate() + res.data.signExpireAfterDay));
            this.form.get('signExpireAtDate')?.setValue(this.nextDate);
          } else {
            this.isHasMaxDate = false;
            this.form.get('signExpireAtDate')?.setValue('');
          }
        },
        (err) => {
          this.isHasMaxDate = false;
        },
      );

      this.items = [data.id];
      this.loadUserNotify([data.id]);
    }
  }

  initListNotifyConfig(): any {
    const promise = this.notifyConfigApiService.getListCombobox().subscribe(
      (res: any) => {
        this.isLoading = false;
        if (res.code !== 200) {
          this.messageService.error(`${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.messageService.error(`${res.message}`);
          return;
        }

        this.listNotifyConfig = res.data.filter((x: any) => this.listNotifyType.map((x1) => x1.value).includes(x.notifyType));
      },
      (err: any) => {
        this.isLoading = false;
        if (err.error) {
          this.messageService.error(`${err.error.message}`);
        } else {
          this.messageService.error(`${err.status}`);
        }
      },
    );
    return promise;
  }

  handleCancel(): void {
    this.isVisible = false;
    if (this.isReloadGrid) {
      this.eventEmmit.emit({ type: 'success' });
    } else {
      this.eventEmmit.emit({ type: 'close' });
    }
  }

  resetForm(): void {
    this.form.reset();
    this.form.get('signExpireAtDate')?.setValue(null);
    this.form.get('notifyConfigId')?.setValue(null);
    this.form.get('lastReasonReject')?.setValue('');
  }

  closeModalReloadData(): void {
    this.isVisible = false;
    this.eventEmmit.emit({ type: 'success' });
  }

  save(): Subscription | undefined {
    const data = {
      documentIds: this.items,
      ...this.form.value,
    };
    // if (data.signExpireAtDate === '') {
    //   data.signExpireAtDate = new Date(new Date().setDate(new Date().getDate() + 7));
    // }

    data.signExpireAtDate = moment(data.signExpireAtDate).format('YYYY-MM-DDTHH:mm:ss');

    const promise = this.documentApiService.updateSignExpireAtDate(data).subscribe(
      (res: any) => {
        this.isLoading = false;
        if (res.code !== 200) {
          this.messageService.error(`${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.messageService.error(`${res.message}`);
          return;
        }
        this.messageService.success(`${res.message}`);
        this.isReloadGrid = true;
        this.closeModalReloadData();
      },
      (err: any) => {
        this.isLoading = false;
        if (err.error) {
          this.messageService.error(`${err.error.message}`);
        } else {
          this.messageService.error(`${err.status}`);
        }
      },
    );

    return promise;
  }

  notifyConfigChange($event: any) {
    if ($event) {
      this.btnSaveAndNotify.enable = true;
    } else {
      this.btnSaveAndNotify.enable = false;
    }
  }
}
