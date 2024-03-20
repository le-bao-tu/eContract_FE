import { Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { I18NService } from '@core';
import { ACLService } from '@delon/acl';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { ButtonModel } from '@model';
import { cleanForm, Constants, LIST_NOTIFY_TYPE, REGEX_CODE, REGEX_NAME } from '@util';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import { NotifyConfigApiService } from 'src/app/services/api/notify-config-api.service';

@Component({
  selector: 'app-notify-config-item',
  templateUrl: './notify-config-item.component.html',
  styleUrls: ['./notify-config-item.component.less'],
})
export class NotifyConfigItemComponent implements OnInit {
  @Input() type = 'add';
  @Input() item: any;
  @Input() isVisible = false;
  @Input() option: any;
  @Output() eventEmmit = new EventEmitter<any>();

  form: FormGroup;
  // moduleName = 'thông báo nhắc nhở';

  listTag: any = [
    {
      name: 'userFullName',
      color: 'geekblue',
    },
    {
      name: 'documentCode',
      color: 'geekblue',
    },
    {
      name: 'documentName',
      color: 'geekblue',
    },
    {
      name: 'expireTime',
      color: 'geekblue',
    },
    {
      name: 'expireDate',
      color: 'geekblue',
    },
  ];

  elementFocus = '';

  isInfo = false;
  isEdit = false;
  isAdd = false;
  tittle = '';

  isLoading = false;
  isReloadGrid = false;

  btnSave: ButtonModel;
  btnCancel: ButtonModel;
  btnEdit: ButtonModel;

  regexCode = REGEX_CODE;
  regexName = REGEX_NAME;

  listNotifyType: any[] = LIST_NOTIFY_TYPE;
  visibleTimeAndDaySendBefore: boolean = false;

  @ViewChild('smsTemplate') smsTemplate!: ElementRef;
  @ViewChild('emailTitleTemplate') emailTitleTemplate!: ElementRef;
  @ViewChild('emailBodyTemplate') emailBodyTemplate!: ElementRef;
  @ViewChild('notificationTitleTemplate') notificationTitleTemplate!: ElementRef;
  @ViewChild('notificationBodyTemplate') notificationBodyTemplate!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private notifyConfigApiService: NotifyConfigApiService,
    private aclService: ACLService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {
    this.btnSave = {
      title: 'Lưu',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-save.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.save();
      },
    };
    this.btnCancel = {
      title: 'Đóng',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-cancel.label')}`,
      visible: true,
      enable: this.isInfo,
      grandAccess: true,
      click: ($event: any) => {
        this.handleCancel();
      },
    };
    this.btnEdit = {
      title: 'Cập nhật',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-edit.label')}`,
      visible: true,
      enable: this.isInfo,
      grandAccess: true,
      click: ($event: any) => {
        this.updateFormToEdit();
      },
    };

    this.form = this.fb.group({
      code: [null, [Validators.required, Validators.pattern(this.regexCode)]],
      notifyType: [null, [Validators.required]],
      timeSendNotifyView: [null],
      daySendNotiBefore: [null],
      isRepeat: [false],
      isSendSMS: [false],
      smsTemplate: [null],
      isSendEmail: [false],
      emailTitleTemplate: [null],
      emailBodyTemplate: [null],
      isSendNotification: [false],
      notificationTitleTemplate: [null],
      notificationBodyTemplate: [null],
      status: [true],
    });
  }

  handleCancel(): void {
    this.isVisible = false;
    this.form.get('code')?.enable();
    this.form.get('notifyType')?.enable();
    if (this.isReloadGrid) {
      this.eventEmmit.emit({ type: 'success' });
    } else {
      this.eventEmmit.emit({ type: 'close' });
    }
  }

  ngOnInit(): void {
    this.initRightOfUser();
  }

  initRightOfUser(): void {
    this.btnEdit.grandAccess = this.aclService.canAbility('NOTIFY-CONFIG-EDIT');
    this.btnSave.grandAccess = this.aclService.canAbility('NOTIFY-CONFIG-ADD') || this.aclService.canAbility('NOTIFY-CONFIG-EDIT');
  }

  updateFormToEdit(): void {
    this.updateFormType('edit');
    this.form.get('name')?.enable();
    this.form.get('order')?.enable();
    this.form.get('status')?.enable();
    this.form.get('description')?.enable();
    this.form.get('timeSendNotifyView')?.enable();
    this.form.get('daySendNotiBefore')?.enable();
    this.form.get('isRepeat')?.enable();
    this.form.get('isSendSMS')?.enable();
    this.form.get('smsTemplate')?.enable();
    this.form.get('isSendEmail')?.enable();
    this.form.get('emailTitleTemplate')?.enable();
    this.form.get('emailBodyTemplate')?.enable();
    this.form.get('isSendNotification')?.enable();
    this.form.get('notificationTitleTemplate')?.enable();
    this.form.get('notificationBodyTemplate')?.enable();
    this.setDisableAreaSMS(this.form.get('isSendSMS')?.value);
    this.setDisableEmailCheckbox(this.form.get('isSendEmail')?.value);
    this.setDisableNotificationCheckbox(this.form.get('isSendNotification')?.value);
  }

  updateFormType(type: string): void {
    switch (type) {
      case 'add':
        this.isInfo = false;
        this.isEdit = false;
        this.isAdd = true;
        // this.tittle = `Thêm mới ${this.moduleName}`;
        this.tittle = `${this.i18n.fanyi('function.notify-config.modal-item.header-add')}`;
        break;
      case 'info':
        this.isInfo = true;
        this.isEdit = false;
        this.isAdd = false;
        // this.tittle = `Chi tiết ${this.moduleName}`;
        this.tittle = `${this.i18n.fanyi('function.notify-config.modal-item.header-info')}`;
        break;
      case 'edit':
        this.isInfo = false;
        this.isEdit = true;
        this.isAdd = false;
        // this.tittle = `Cập nhật ${this.moduleName}`;
        this.tittle = `${this.i18n.fanyi('function.notify-config.modal-item.header-edit')}`;
        break;
      default:
        this.isInfo = false;
        this.isEdit = false;
        this.isAdd = true;
        // this.tittle = `Thêm mới ${this.moduleName}`;
        this.tittle = `${this.i18n.fanyi('function.notify-config.modal-item.header-add')}`;
        break;
    }
  }

  public initData(data: any, type: any = null, option: any = {}): void {
    this.isLoading = false;
    this.isReloadGrid = false;
    this.item = data;
    this.type = type;
    this.option = option;
    this.updateFormType(type);
    if (this.item.id === null || this.item.id === undefined) {
      this.visibleTimeAndDaySendBefore = false;
      this.form.reset();
      this.form.get('isRepeat')?.setValue(false);
      this.form.get('isSendSMS')?.setValue(false);
      this.form.get('isSendEmail')?.setValue(false);
      this.form.get('isSendNotification')?.setValue(false);
      this.form.get('status')?.setValue(true);
      this.form.get('timeSendNotifyView')?.enable();
      this.form.get('daySendNotiBefore')?.enable();
      this.form.get('isRepeat')?.enable();
      this.form.get('isSendSMS')?.enable();
      this.form.get('smsTemplate')?.enable();
      this.form.get('isSendEmail')?.enable();
      this.form.get('emailTitleTemplate')?.enable();
      this.form.get('emailBodyTemplate')?.enable();
      this.form.get('isSendNotification')?.enable();
      this.form.get('notificationTitleTemplate')?.enable();
      this.form.get('notificationBodyTemplate')?.enable();
      this.form.get('status')?.enable();
    } else {
      this.form.get('code')?.disable();
      this.form.get('code')?.setValue(data?.code);

      this.form.get('notifyType')?.disable();
      this.form.get('notifyType')?.setValue(data?.notifyType);

      this.form.get('notifyType')?.setValue(data?.notifyType);

      if (data?.timeSendNotify && data?.timeSendNotify !== 'NaN:NaN') {
        this.form.get('timeSendNotifyView')?.setValue(data?.timeSendNotifyView);
      }

      if (this.isInfo) {
        this.form.get('timeSendNotifyView')?.disable();
      } else {
        this.form.get('timeSendNotifyView')?.enable();
      }

      this.form.get('daySendNotiBefore')?.setValue(data?.daySendNotiBefore);
      if (this.isInfo) {
        this.form.get('daySendNotiBefore')?.disable();
      } else {
        this.form.get('daySendNotiBefore')?.enable();
      }

      this.form.get('isRepeat')?.setValue(data?.isRepeat);
      if (this.isInfo) {
        this.form.get('isRepeat')?.disable();
      } else {
        this.form.get('isRepeat')?.enable();
      }

      this.form.get('isSendSMS')?.setValue(data?.isSendSMS);
      if (this.isInfo) {
        this.form.get('isSendSMS')?.disable();
      } else {
        this.form.get('isSendSMS')?.enable();
      }

      this.form.get('smsTemplate')?.setValue(data?.smsTemplate);
      if (this.isInfo) {
        this.form.get('smsTemplate')?.disable();
      } else {
        this.form.get('smsTemplate')?.enable();
      }

      this.form.get('isSendEmail')?.setValue(data?.isSendEmail);
      if (this.isInfo) {
        this.form.get('isSendEmail')?.disable();
      } else {
        this.form.get('isSendEmail')?.enable();
      }

      this.form.get('emailTitleTemplate')?.setValue(data?.emailTitleTemplate);
      if (this.isInfo) {
        this.form.get('emailTitleTemplate')?.disable();
      } else {
        this.form.get('emailTitleTemplate')?.enable();
      }

      this.form.get('emailBodyTemplate')?.setValue(data?.emailBodyTemplate);
      if (this.isInfo) {
        this.form.get('emailBodyTemplate')?.disable();
      } else {
        this.form.get('emailBodyTemplate')?.enable();
      }

      this.form.get('isSendNotification')?.setValue(data?.isSendNotification);
      if (this.isInfo) {
        this.form.get('isSendNotification')?.disable();
      } else {
        this.form.get('isSendNotification')?.enable();
      }

      this.form.get('notificationTitleTemplate')?.setValue(data?.notificationTitleTemplate);
      if (this.isInfo) {
        this.form.get('notificationTitleTemplate')?.disable();
      } else {
        this.form.get('notificationTitleTemplate')?.enable();
      }

      this.form.get('notificationBodyTemplate')?.setValue(data?.notificationBodyTemplate);
      if (this.isInfo) {
        this.form.get('notificationBodyTemplate')?.disable();
      } else {
        this.form.get('notificationBodyTemplate')?.enable();
      }

      this.form.get('status')?.setValue(data?.status);
      if (this.isInfo) {
        this.form.get('status')?.disable();
        this.form.get('notifyType')?.disable();
      } else {
        this.form.get('status')?.enable();
        this.form.get('notifyType')?.enable();
      }
    }

    this.setDisableAreaSMS(this.form.controls.isSendSMS.value);
    this.setDisableEmailCheckbox(this.form.controls.isSendEmail.value);
    this.setDisableNotificationCheckbox(this.form.controls.isSendNotification.value);
  }

  resetForm(): void {
    this.form.reset();
    this.form.get('isRepeat')?.setValue(false);
    this.form.get('isSendSMS')?.setValue(false);
    this.form.get('isSendEmail')?.setValue(false);
    this.form.get('isSendNotification')?.setValue(false);
    this.form.get('status')?.setValue(true);
  }

  setDisableAreaSMS(value: boolean): void {
    if (!this.isInfo) {
      if (value) {
        this.form.get('smsTemplate')?.enable();
      } else {
        this.form.get('smsTemplate')?.setValue(null);
        this.form.get('smsTemplate')?.disable();
      }
    }
  }

  setDisableEmailCheckbox(value: boolean): void {
    if (!this.isInfo) {
      if (value) {
        this.form.get('emailTitleTemplate')?.enable();
        this.form.get('emailBodyTemplate')?.enable();
        this.form.get('selectedTagEmail')?.enable();
      } else {
        this.form.get('emailTitleTemplate')?.setValue(null);
        this.form.get('emailBodyTemplate')?.setValue(null);
        this.form.get('selectedTagEmail')?.setValue(null);
        this.form.get('emailTitleTemplate')?.disable();
        this.form.get('emailBodyTemplate')?.disable();
        this.form.get('selectedTagEmail')?.disable();
      }
    }
  }

  setDisableNotificationCheckbox(value: boolean): void {
    if (!this.isInfo) {
      if (value) {
        this.form.get('notificationTitleTemplate')?.enable();
        this.form.get('notificationBodyTemplate')?.enable();
        this.form.get('selectedTagNotify')?.enable();
      } else {
        this.form.get('notificationTitleTemplate')?.setValue(null);
        this.form.get('notificationBodyTemplate')?.setValue(null);
        this.form.get('selectedTagNotify')?.setValue(null);
        this.form.get('notificationTitleTemplate')?.disable();
        this.form.get('notificationBodyTemplate')?.disable();
        this.form.get('selectedTagNotify')?.disable();
      }
    }
  }

  closeModalReloadData(): void {
    this.isVisible = false;
    this.form.get('code')?.enable();
    this.form.get('notifyType')?.enable();
    this.eventEmmit.emit({ type: 'success' });
  }

  save(isCreateAfter: boolean = false): Subscription | undefined {
    this.isLoading = true;

    cleanForm(this.form);
    // tslint:disable-next-line:forin
    for (const i in this.form.controls) {
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity();
    }

    if (!this.form.controls.isSendSMS.value && !this.form.controls.isSendEmail.value && !this.form.controls.isSendNotification.value) {
      this.isLoading = false;
      this.messageService.error(`${this.i18n.fanyi('function.notify-config.modal-item.options-empty.error.message')}`);
      return;
    }

    if (this.form.controls.isSendSMS.value && !this.form.controls.smsTemplate.value) {
      this.form.controls.smsTemplate.markAsDirty();
      this.form.controls.smsTemplate.updateValueAndValidity();
      this.form.controls.smsTemplate.setErrors({ required: 'Trường thông tin bắt buộc!' });
    }

    if (this.form.controls.isSendEmail.value) {
      if (!this.form.controls.emailTitleTemplate.value) {
        this.form.controls.emailTitleTemplate.markAsDirty();
        this.form.controls.emailTitleTemplate.updateValueAndValidity();
        this.form.controls.emailTitleTemplate.setErrors({ required: 'Trường thông tin bắt buộc!' });
      }
      if (!this.form.controls.emailBodyTemplate.value) {
        this.form.controls.emailBodyTemplate.markAsDirty();
        this.form.controls.emailBodyTemplate.updateValueAndValidity();
        this.form.controls.emailBodyTemplate.setErrors({ required: 'Trường thông tin bắt buộc!' });
      }
    }

    if (this.form.controls.isSendNotification.value) {
      if (!this.form.controls.notificationTitleTemplate.value) {
        this.form.controls.notificationTitleTemplate.markAsDirty();
        this.form.controls.notificationTitleTemplate.updateValueAndValidity();
        this.form.controls.notificationTitleTemplate.setErrors({ required: 'Trường thông tin bắt buộc!' });
      }
      if (!this.form.controls.notificationBodyTemplate.value) {
        this.form.controls.notificationBodyTemplate.markAsDirty();
        this.form.controls.notificationBodyTemplate.updateValueAndValidity();
        this.form.controls.notificationBodyTemplate.setErrors({ required: 'Trường thông tin bắt buộc!' });
      }
    }

    if (!this.form.valid) {
      this.isLoading = false;
      this.messageService.error(`${this.i18n.fanyi('function.notify-config.modal-item.error.message.form-invalid')}`);
      return;
    }

    let timeSendNotify: any = undefined;
    if (this.form.controls.timeSendNotifyView.value) {
      var hour = new Date(this.form.controls.timeSendNotifyView.value).getHours();
      var minute = new Date(this.form.controls.timeSendNotifyView.value).getMinutes();

      timeSendNotify = `${hour < 10 ? '0' + hour.toString() : hour.toString()}:${minute < 10 ? '0' + minute.toString() : minute.toString()
        }`;
    }

    const data = {
      id: this.item.id,
      code: this.form.controls.code.value.toUpperCase(),
      daySendNotiBefore: this.form.controls.daySendNotiBefore.value,
      timeSendNotify: timeSendNotify,
      isRepeat: this.form.controls.isRepeat.value,
      isSendSMS: this.form.controls.isSendSMS.value,
      smsTemplate: this.form.controls.smsTemplate.value,
      isSendEmail: this.form.controls.isSendEmail.value,
      emailTitleTemplate: this.form.controls.emailTitleTemplate.value,
      emailBodyTemplate: this.form.controls.emailBodyTemplate.value,
      isSendNotification: this.form.controls.isSendNotification.value,
      notificationTitleTemplate: this.form.controls.notificationTitleTemplate.value,
      notificationBodyTemplate: this.form.controls.notificationBodyTemplate.value,
      status: this.form.controls.status.value,
      notifyType: this.form.controls.notifyType.value
    };

    // if (data.timeSendNotify) {
    //   data.timeSendNotify = `${data.timeSendNotify.getHours()}:${data.timeSendNotify.getMinutes()}`;
    // }

    if (data.code === null || data.code === undefined || data.code === '') {
      this.isLoading = false;
      this.messageService.error(`Mã thông báo không được để trống!`);
      return;
    }

    if (this.isAdd) {
      const promise = this.notifyConfigApiService.create(data).subscribe(
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
          const dataResult = res.data;
          this.messageService.success(`${res.message}`);
          this.isReloadGrid = true;
          if (isCreateAfter) {
            this.resetForm();
          } else {
            this.closeModalReloadData();
          }
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
    } else if (this.isEdit) {
      const promise = this.notifyConfigApiService.update(data).subscribe(
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
          const dataResult = res.data;
          this.messageService.success(`${res.message}`);
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
    } else {
      return;
    }
  }

  setContentSMS(index: any): void {
    if (!this.form.get('isSendSMS')?.value || this.isInfo) {
      return;
    }
    const tag = this.listTag[index]?.name;
    let smsContent = '';

    const cusorPosition = this.smsTemplate.nativeElement.selectionStart;
    if (this.form.get('smsTemplate')?.value) {
      smsContent = [
        this.form.get('smsTemplate')?.value.slice(0, cusorPosition),
        `{{${tag}}}`,
        this.form.get('smsTemplate')?.value.slice(cusorPosition),
      ].join('');
    } else {
      smsContent += `{{${tag}}}`;
    }

    this.form.get('smsTemplate')?.setValue(smsContent);
  }

  setContentEmail(index: any): void {
    if (!this.form.get('isSendEmail')?.value || this.isInfo) {
      return;
    }
    let emailTitle = '';
    let emailBody = '';
    const tag = this.listTag[index]?.name;
    if (this.elementFocus === 'emailTitleTemplate') {
      const cusorPosition = this.emailTitleTemplate.nativeElement.selectionStart;
      if (this.form.get('emailTitleTemplate')?.value) {
        emailTitle = [
          this.form.get('emailTitleTemplate')?.value.slice(0, cusorPosition),
          `{{${tag}}}`,
          this.form.get('emailTitleTemplate')?.value.slice(cusorPosition),
        ].join('');
      } else {
        emailTitle += `{{${tag}}}`;
      }

      this.form.get('emailTitleTemplate')?.setValue(emailTitle);
    } else {
      const cusorPosition = this.emailBodyTemplate.nativeElement.selectionStart;
      if (this.form.get('emailBodyTemplate')?.value) {
        emailBody = [
          this.form.get('emailBodyTemplate')?.value.slice(0, cusorPosition),
          `{{${tag}}}`,
          this.form.get('emailBodyTemplate')?.value.slice(cusorPosition),
        ].join('');
      } else {
        emailBody += `{{${tag}}}`;
      }

      this.form.get('emailBodyTemplate')?.setValue(emailBody);
    }
  }

  setContentNotify(index: any): void {
    if (!this.form.get('isSendNotification')?.value || this.isInfo) {
      return;
    }

    let notifyTitle = '';
    let notifyBody = '';
    const tag = this.listTag[index]?.name;
    if (this.elementFocus === 'notificationTitleTemplate') {
      const cusorPosition = this.notificationTitleTemplate.nativeElement.selectionStart;
      if (this.form.get('notificationTitleTemplate')?.value) {
        notifyTitle = [
          this.form.get('notificationTitleTemplate')?.value.slice(0, cusorPosition),
          `{{${tag}}}`,
          this.form.get('notificationTitleTemplate')?.value.slice(cusorPosition),
        ].join('');
      } else {
        notifyTitle += `{{${tag}}}`;
      }

      this.form.get('notificationTitleTemplate')?.setValue(notifyTitle);
    } else {
      const cusorPosition = this.notificationBodyTemplate.nativeElement.selectionStart;
      if (this.form.get('notificationBodyTemplate')?.value) {
        notifyBody = [
          this.form.get('notificationBodyTemplate')?.value.slice(0, cusorPosition),
          `{{${tag}}}`,
          this.form.get('notificationBodyTemplate')?.value.slice(cusorPosition),
        ].join('');
      } else {
        notifyBody += `{{${tag}}}`;
      }

      this.form.get('notificationBodyTemplate')?.setValue(notifyBody);
    }
  }

  focusElement(event: any): void {
    this.elementFocus = event.srcElement.name;
  }

  notifyTypeChange($event: any) {
    if ($event === Constants.LIST_NOTIFY_TYPE_REMIND) {
      this.visibleTimeAndDaySendBefore = true;
    } else {
      this.visibleTimeAndDaySendBefore = false;
      this.form.get('isRepeat')?.setValue(false);
      this.form.get('timeSendNotifyView')?.setValue(null);
      this.form.get('daySendNotiBefore')?.setValue(null);
    }
  }
}
