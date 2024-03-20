import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ACLService } from '@delon/acl';
import { ButtonModel } from '@model';
import { DocumentApiService } from '@service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';

import { environment } from '@env/environment';
import { cleanForm, nodeUploadRouter } from '@util';

import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';

interface ItemData {
  id: string;
  name: string;
  email: string;
}

@Component({
  selector: 'app-document-send-mail',
  templateUrl: './document-send-mail.component.html',
  styleUrls: ['./document-send-mail.component.less'],
})
export class DocumentSendMailComponent implements OnInit {
  @Input() type = 'add';
  @Input() item: any;
  @Input() isVisible = false;
  @Input() option: any;
  @Output() eventEmmit = new EventEmitter<any>();

  moduleName = 'GỬI KẾT QUẢ CHỨNG NHẬN';

  isInfo = false;
  isEdit = false;
  isAdd = false;
  tittle = '';

  isLoading = false;
  isReloadGrid = false;

  btnSendMail: ButtonModel;
  btnCancel: ButtonModel;

  fileUrl = '';
  currentUserEmail = '';

  isSendPrivateMail = false;
  isSendMuiltipleMail = false;

  listItem: any[] = [];

  i = 0;
  editCache: { [key: string]: { edit: boolean; data: ItemData } } = {};
  listOfData: ItemData[] = [];

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private documentApiService: DocumentApiService,
    private aclService: ACLService,
    private notification: NzNotificationService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
  ) {
    this.currentUserEmail = this.tokenService.get()?.email;
    this.btnSendMail = {
      title: 'Gửi',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: (data: any) => {
        this.sendEmail();
      },
    };
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
  }

  handleCancel(): void {
    this.isVisible = false;
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
    // this.btnSave.grandAccess = this.aclService.canAbility('UNIT-CREATE');
    // this.btnEdit.grandAccess = this.aclService.canAbility('UNIT-EDIT');
    // this.btnSaveAndCreate.grandAccess = this.aclService.canAbility('UNIT-CREATE');
  }

  updateFormType(type: string): void {
    this.tittle = `${this.moduleName}`;
    switch (type) {
      case 'add':
        this.isInfo = false;
        this.isEdit = false;
        this.isAdd = true;
        break;
      case 'info':
        this.isInfo = true;
        this.isEdit = false;
        this.isAdd = false;
        break;
      case 'edit':
        this.isInfo = false;
        this.isEdit = true;
        this.isAdd = false;
        break;
      default:
        this.isInfo = false;
        this.isEdit = false;
        this.isAdd = true;
        break;
    }
  }

  public initData(data: any[], type: any = null, option: any = {}): void {
    this.isVisible = true;
    this.isLoading = false;
    this.isReloadGrid = false;
    this.listItem = data;
    // this.item = data;
    this.type = type;
    this.option = option;
    this.updateFormType(type);
    this.listOfData = [];
    this.addItem();
    // console.log(this.listItem);
  }

  sendEmail(): any {
    this.isLoading = true;
    const data = {
      isSendMuiltipleMail: this.isSendMuiltipleMail,
      isSendPrivateMail: this.isSendPrivateMail,
      listDocumentId: this.listItem,
      listEmail: this.listOfData,
    };
    if (!this.isSendMuiltipleMail && !this.isSendPrivateMail) {
      this.isLoading = false;
      this.messageService.error('Vui lòng chọn người nhận mail');
      return;
    }
    if (this.listItem.length === 0) {
      this.isLoading = false;
      this.messageService.error('Bạn chưa chọn hợp đồng để gửi. Vui lòng kiểm tra lại!');
      return;
    }
    // return;
    const promise = this.documentApiService.sendEmail(data).subscribe(
      (res: any) => {
        this.isLoading = false;
        if (res.code !== 200) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        this.messageService.success(res.message);
      },
      (err: any) => {
        this.isLoading = false;
        if (err.error) {
          this.notification.error(`Có lỗi xảy ra`, `${err.error.message}`);
        } else {
          this.notification.error(`Có lỗi xảy ra`, `${err.status}`);
        }
      },
    );
    return promise;
  }

  startEdit(id: string): void {
    this.editCache[id].edit = true;
  }

  addItem(): any {
    this.i++;
    this.listOfData = [
      ...this.listOfData,
      {
        id: `${this.i}`,
        name: ``,
        email: 'email@gmail.com',
      },
    ];
    this.updateEditCache();
  }

  deleteRow(id: string): void {
    this.listOfData = this.listOfData.filter((d) => d.id !== id);
  }

  cancelEdit(id: string): void {
    const index = this.listOfData.findIndex((item) => item.id === id);
    this.editCache[id] = {
      data: { ...this.listOfData[index] },
      edit: false,
    };
  }

  saveEdit(id: string): void {
    const index = this.listOfData.findIndex((item) => item.id === id);
    Object.assign(this.listOfData[index], this.editCache[id].data);
    this.editCache[id].edit = false;
  }

  updateEditCache(): void {
    this.listOfData.forEach((item) => {
      this.editCache[item.id] = {
        edit: false,
        data: { ...item },
      };
    });
  }

  closeModalReloadData(): void {
    this.isVisible = false;
    this.eventEmmit.emit({ type: 'success' });
  }
}
