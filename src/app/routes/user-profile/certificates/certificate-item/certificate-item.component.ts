import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { I18NService } from '@core';
import { ACLService } from '@delon/acl';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ButtonModel, GridModel, QueryFilerModel } from '@model';
import { CertifyTypeApiService, UserHSMAccountApiService, UserService } from '@service';
import { QUERY_FILTER_DEFAULT, REGEX_CODE, REGEX_NAME } from '@util';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
// import { EventEmitter } from 'stream';

@Component({
  selector: 'app-certificate-item',
  templateUrl: './certificate-item.component.html',
  styleUrls: ['./certificate-item.component.less'],
})
export class CertificateItemComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private certifyTypeApiService: CertifyTypeApiService,
    private aclService: ACLService,
    private userService: UserService,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private userHSMAccountRouter: UserHSMAccountApiService,
  ) {
    this.btnCancel = {
      title: 'Đóng',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-cancel.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.handleCancel();
      },
    };
  }
  @Input() type = 'info';
  @Input() item: any;
  @Input() isVisible = false;
  @Input() option: any;
  isReloadGrid = false;
  @Output() eventEmmit = new EventEmitter<any>();

  form!: FormGroup;
  btnCancel!: ButtonModel;
  isInfo = false;
  isEdit = false;
  isAdd = false;
  tittle = '';
  data = {};
  regexCode = REGEX_CODE;
  regexName = REGEX_NAME;
  isLoading = false;
  isCustomer = false;
  isFromDocument: any = false;
  filter: QueryFilerModel = { ...QUERY_FILTER_DEFAULT };
  grid: GridModel = {
    dataCount: 0,
    rowData: [],
    totalData: 0,
  };

  ngOnInit(): void {}
  public async initData(item: any, type: string): Promise<any> {
    this.isVisible = true;
    this.isLoading = false;
    this.isReloadGrid = false;
    this.tittle = `${this.i18n.fanyi('layout.grid.certificate-item.title')}`;
    let res = await this.getInfoCertificate(item.id);

    if (res.data) this.data = Object.assign([], res.data);
  }

  public async getInfoCertificate(userHSMAccountId: string): Promise<any> {
    return await this.userHSMAccountRouter.getInfoCertificate(userHSMAccountId).toPromise();
  }

  onModalEventEmmit(event: any) {
    // console.log(event);
  }

  handleCancel(): void {
    this.isVisible = false;
    if (this.isReloadGrid) {
      this.eventEmmit.emit({ type: 'success' });
    } else {
      this.eventEmmit.emit({ type: 'close' });
    }
  }
}
