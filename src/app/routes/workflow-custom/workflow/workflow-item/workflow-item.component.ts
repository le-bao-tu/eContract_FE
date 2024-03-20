import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { I18NService } from '@core';
import { ACLService } from '@delon/acl';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { ArrayService } from '@delon/util';
import { ButtonModel } from '@model';
import { OrganizationApiService, OrgConfigService, PositionApiService, UserApiService, WorkflowApiService } from '@service';
import { Constants, LIST_NOTIFY_TYPE, LIST_SIGN_TYPE, REGEX_CODE, REGEX_NAME, ROLE_SYS_ADMIN } from '@util';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTreeNode } from 'ng-zorro-antd/tree';
import { Subscription } from 'rxjs';
import { NotifyConfigApiService } from 'src/app/services/api/notify-config-api.service';
import { WorkflowStateApiService } from 'src/app/services/api/workflow-state-api.service';

@Component({
  selector: 'app-workflow-item',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './workflow-item.component.html',
  styleUrls: ['./workflow-item.component.less'],
})
export class WorkflowItemComponent implements OnInit {
  type = 'add';
  item: any;
  orgConfig: any;
  @Input() isVisible = false;
  option: any;
  @Output() eventEmmit = new EventEmitter<any>();
  lstUser: any = [];
  user_id: any = null;
  user_email: any = null;

  data: NzTreeNode[] = [];
  delDisabled = false;

  // Region autocomplete User List
  userNameInputValue?: string;
  userNameFilteredOptions: any[] = [];
  userNameOptions: any[] = [];

  listOfSignOption = LIST_SIGN_TYPE;

  listOfOrgs: any[] = [];
  listOfPositions: any[] = [];
  listWorkflowState: any[] = [];
  listNotifyConfig: any[] = [];
  listNotifyConfigRemind: any[] = [];
  listNotifyConfigExpired: any[] = [];
  listNotifyConfigDocumentCompleted: any[] = [];
  listNotifyConfigUserSignDone: any[] = [];

  form: FormGroup;
  moduleName = 'quy trình';

  isCheckRemindNotify = false;
  isCheckExpireNotify = false;

  isDisableExpireNotify = false;
  isDisableRemindNotify = false;
  isInfo = false;
  isEdit = false;
  isAdd = false;
  tittle = '';

  checkSysAdmin = false;
  isLoading = false;
  isReloadGrid = false;

  btnSave: ButtonModel;
  btnSaveAndCreate: ButtonModel;
  btnCancel: ButtonModel;
  btnEdit: ButtonModel;

  optionGroups: AutocompleteOptionGroups[] = [];

  listNotifyTypeRemind: any[] = LIST_NOTIFY_TYPE.filter((x) => x.value === Constants.LIST_NOTIFY_TYPE_REMIND);
  listNotifyTypeExpired: any[] = LIST_NOTIFY_TYPE.filter((x) => x.value === Constants.LIST_NOTIFY_TYPE_EXPIRED);
  listNotifyTypeComplete: any[] = LIST_NOTIFY_TYPE.filter((x) => x.value === Constants.LIST_NOTIFY_TYPE_COMPLETE);
  listNotifyTypeUserSignDone: any[] = LIST_NOTIFY_TYPE.filter((x) => x.value === Constants.LIST_NOTIFY_TYPE_USER_SIGN_DONE);

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private workflowApiService: WorkflowApiService,
    private workflowStateApiService: WorkflowStateApiService,
    private notifyConfigApiService: NotifyConfigApiService,
    private userApiService: UserApiService,
    private organizationApiService: OrganizationApiService,
    private orgConfigService: OrgConfigService,
    private positionApiService: PositionApiService,
    private aclService: ACLService,
    private arrayService: ArrayService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {
    //#region button
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
    this.btnSaveAndCreate = {
      title: 'Lưu & Thêm mới',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.save(true);
      },
    };
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
    this.btnEdit = {
      title: 'Cập nhật',
      titlei18n: `${this.i18n.fanyi('layout.button.btn-edit.label')}`,
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.updateFormToEdit();
      },
    };

    //#endregion button

    this.userNameFilteredOptions = this.userNameOptions;

    if (this.tokenService.get()?.token) {
      this.user_id = this.tokenService.get()?.id;
      this.user_email = this.tokenService.get()?.email;
    }
    this.form = this.fb.group({
      code: [{ value: null, disabled: false }, [Validators.required, Validators.pattern(REGEX_CODE)]],
      name: [{ value: null, disabled: false }, [Validators.required, Validators.pattern(REGEX_NAME)]],
      organizationName: [{ value: null, disabled: false }],
      order: [{ value: 0, disabled: false }],
      status: [{ value: true, disabled: false }],
      isSignOrgConfirm: [{ value: false, disabled: false }],
      isSignCertify: [{ value: false, disabled: false }],
      description: [{ value: null, disabled: false }],
      notifyConfigDocumentCompleteId: [{ value: null, disabled: false }],
      orgId: [{ value: null, disabled: false }, [Validators.required]],
      isUseEverify: [{ value: false, disabled: false }],
    });
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
    this.initListUsers();
    // this.initListOrgs();
    this.initOrgConfigByUser();
    this.initListPositions();
    this.initTreeData();
    this.initListWorkflowState();
    this.initListNotifyConfig();
  }

  initRightOfUser(): void {
    this.btnEdit.grandAccess = this.aclService.canAbility('WORKFLOW-EDIT');
    this.btnSave.grandAccess = this.aclService.canAbility('WORKFLOW-EDIT') || this.aclService.canAbility('WORKFLOW-ADD');
    this.btnSaveAndCreate.grandAccess = this.aclService.canAbility('WORKFLOW-ADD');
  }

  initOrgConfigByUser() {
    const orgID = this.tokenService.get()?.organizationId;
    const promise = this.orgConfigService.getById(orgID).subscribe(
      (res: any) => {
        this.isLoading = false;
        if (res.code !== 200) {
          this.messageService.error(`${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          // this.messageService.error(`${res.message}`);
          this.orgConfig = {};
          return;
        }

        this.orgConfig = res.data;
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

  initListWorkflowState() {
    const promise = this.workflowStateApiService.getListCombobox().subscribe(
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

        this.listWorkflowState = res.data;
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

  initListUsers(): Subscription | undefined {
    let orgId = this.tokenService.get()?.organizationId;
    if (this.tokenService.get()?.isSystemAdmin) {
      orgId = undefined;
    }
    const promise = this.userApiService.getListComboboxByRootOrg(orgId).subscribe(
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
        this.userNameOptions = dataResult;
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

  initListOrgs(): Subscription | undefined {
    const promise = this.organizationApiService.getListCombobox().subscribe(
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
        this.listOfOrgs = dataResult;
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

  initTreeData(): Subscription {
    const rs = this.organizationApiService.getListComboboxCurrentOrgOfUser().subscribe(
      (res: any) => {
        if (res.code !== 200) {
          this.messageService.error(`${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.messageService.error(`${res.message}`);
          return;
        }

        const dataResult = res.data;
        // console.log(dataResult);

        const arrayTreeResult = dataResult.map((item: any, i: number, arr: any[]) => {
          const checkIsLeft = arr.some((c) => c.parentId === item.id);

          return {
            id: item.id,
            parent_id: item.parentId,
            title: item.name,
            isLeaf: !checkIsLeft,
            expanded: false,
            selected: false,
          };
        });

        this.data = this.arrayService.arrToTreeNode(arrayTreeResult, {
          cb: (item, parent, deep) => {
            // item.expanded = deep <= 1;
            item.selected = item.id === 0;
          },
        });
      },
      (err: any) => {
        // console.log(err);
      },
    );
    return rs;
  }

  initListPositions(): Subscription | undefined {
    const promise = this.positionApiService.getListCombobox().subscribe(
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
        this.listOfPositions = dataResult;
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

  initListNotifyConfig() {
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

        // this.listNotifyConfig = res.data;
        this.listNotifyConfigRemind = res.data.filter((x: any) => this.listNotifyTypeRemind.map((x1) => x1.value).includes(x.notifyType));
        this.listNotifyConfigExpired = res.data.filter((x: any) => this.listNotifyTypeExpired.map((x1) => x1.value).includes(x.notifyType));
        this.listNotifyConfigDocumentCompleted = res.data.filter((x: any) =>
          this.listNotifyTypeComplete.map((x1) => x1.value).includes(x.notifyType),
        );
        this.listNotifyConfigUserSignDone = res.data.filter((x: any) =>
          this.listNotifyTypeUserSignDone.map((x1) => x1.value).includes(x.notifyType),
        );
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

  updateFormToEdit(): void {
    this.updateFormType('edit');
    this.form.get('name')?.enable();
    this.form.get('orgId')?.enable();
    this.form.get('status')?.enable();
    this.form.get('notifyConfigDocumentCompleteId')?.enable();
    this.form.get('isSignOrgConfirm')?.enable();
    this.form.get('isSignCertify')?.enable();
    this.form.get('isUseEverify')?.enable();
  }

  updateFormType(type: string): void {
    switch (type) {
      case 'add':
        this.isInfo = false;
        this.isEdit = false;
        this.isAdd = true;
        // this.tittle = `Thêm mới ${this.moduleName}`;
        this.tittle = `${this.i18n.fanyi('function.workflow.modal-item.header-add')}`;
        break;
      case 'info':
        this.isInfo = true;
        this.isEdit = false;
        this.isAdd = false;
        // this.tittle = `Chi tiết ${this.moduleName}`;
        this.tittle = `${this.i18n.fanyi('function.workflow.modal-item.header-info')}`;
        break;
      case 'edit':
        this.isInfo = false;
        this.isEdit = true;
        this.isAdd = false;
        // this.tittle = `Cập nhật ${this.moduleName}`;
        this.tittle = `${this.i18n.fanyi('function.workflow.modal-item.header-edit')}`;
        break;
      default:
        this.isInfo = false;
        this.isEdit = false;
        this.isAdd = true;
        // this.tittle = `Thêm mới ${this.moduleName}`;
        this.tittle = `${this.i18n.fanyi('function.workflow.modal-item.header-add')}`;
        break;
    }
  }

  public initData(data: any, type: any = null, option: any = {}): void {
    this.checkIsAdmin();
    this.isLoading = false;
    this.isReloadGrid = false;
    this.item = data;
    this.type = type;
    this.option = option;
    this.updateFormType(type);
    if (this.item.id === null || this.item.id === undefined) {
      this.form.reset();
      this.checkIsAdmin();
      this.form.get('status')?.setValue(true);
      this.form.get('isSignOrgConfirm')?.setValue(false);
      this.form.get('isSignCertify')?.setValue(false);
      this.form.get('isUseEverify')?.setValue(false);
      this.form.get('code')?.enable();
      this.form.get('name')?.enable();
      this.form.get('orgId')?.enable();
      this.form.get('status')?.enable();
      this.form.get('isSignOrgConfirm')?.enable();
      this.form.get('isSignCertify')?.enable();
      this.form.get('isUseEverify')?.enable();
      this.form.get('notifyConfigDocumentCompleteId')?.enable();

      // Khỏi tạo danh sách người tham gia
      // Nếu tài khoản đăng nhập có email thì hắn là người đầu tiên trong quy trình

      // B1 Check xem mail có trong danh bạ k
      const userUser = this.userNameOptions.find((c) => c.email === this.user_email);
      // B2 Add vào lstUser
      if (
        userUser !== undefined &&
        userUser !== null &&
        (this.user_email !== undefined || this.user_email !== null) &&
        this.option.type !== 'default'
      ) {
        this.lstUser = [
          {
            order: 0,
            type: this.listOfSignOption[0].value,
            name: '',
            state: '',
            aDSSProfileName: '',
            userId: userUser.id,
            userEmail: userUser.email,
            userName: userUser.name,
            userPhoneNumber: userUser.phoneNumber,
            userPositionName: userUser.positionName,
            selectedSignType: this.listOfSignOption[0],
            isSendMailNotiSign: false,
            isSendMailNotiResult: false,
            isDisabled: false,
            isAllowRenew: userUser.isAllowRenew,
            maxRenewTimes: userUser.maxRenewTimes,
          },
        ];
      } else {
        this.lstUser = [
          {
            order: 0,
            type: this.listOfSignOption[0].value,
            name: '',
            state: '',
            aDSSProfileName: '',
            userId: null,
            userName: '',
            userEmail: '',
            userPhoneNumber: '',
            userPositionName: '',
            selectedSignType: this.listOfSignOption[0],
            isSendMailNotiSign: false,
            isSendMailNotiResult: false,
            isDisabled: false,
            isAllowRenew: true,
            maxRenewTimes: null,
          },
        ];
      }
    } else {
      // Only view if Info
      if (this.type === 'info') {
        this.form.get('code')?.disable();
        this.form.get('name')?.disable();
        this.form.get('orgId')?.disable();
        // this.form.get('isSignOrgConfirm')?.disable();
        this.form.get('notifyConfigDocumentCompleteId')?.disable();
        // this.form.get('status')?.disable();
      } else {
        this.form.get('code')?.disable();
        this.form.get('name')?.enable();
        this.form.get('isSignOrgConfirm')?.enable();
        this.form.get('isSignCertify')?.enable();
        this.form.get('isUseEverify')?.enable();
        this.form.get('notifyConfigDocumentCompleteId')?.enable();
        // if (this.checkSysAdmin) {
        //   this.form.get('orgId')?.enable();
        // }
        this.form.get('status')?.enable();
      }

      // Get by Id
      this.workflowApiService.getById(this.item.id).subscribe((res) => {
        const detail = res.data;

        this.form.get('code')?.setValue(detail.code);
        this.form.get('name')?.setValue(detail.name);
        this.form.get('orgId')?.setValue(detail.organizationId);
        this.form.get('status')?.setValue(detail.status);
        this.form.get('isSignOrgConfirm')?.setValue(detail.isSignOrgConfirm);
        this.form.get('isSignCertify')?.setValue(detail.isSignCertify);
        this.form.get('isUseEverify')?.setValue(detail.isUseEverify);
        this.form.get('notifyConfigDocumentCompleteId')?.setValue(detail.notifyConfigDocumentCompleteId);

        const lstDetailUser = detail.listUser;

        this.lstUser = lstDetailUser;

        for (const user of this.lstUser) {
          const userSelected = this.userNameOptions.filter((item) => {
            return item.id === user.userId;
          });

          const wflStateSelected = this.listWorkflowState.filter((item) => {
            return item.code === user.state;
          });

          const objectt = this.listOfSignOption.filter((item) => {
            return item.value === user.type;
          });

          user.selectedUser = userSelected[0];
          user.selectedWFLState = wflStateSelected[0];
          user.selectedSignType = objectt[0];
          user.isDisabled = false;
          if (user.notifyConfigRemindId) {
            user.isDisableRemindNotify = true;
          } else {
            user.isDisableRemindNotify = false;
          }

          if (user.notifyConfigExpireId) {
            user.isDisableExpireNotify = true;
          } else {
            user.isDisableRemindNotify = false;
          }

          // user.userPositionName = this.listOfPositions.find((c) => c.id === user.positionId)?.name;
        }
        // console.log('test: ', this.lstUser);
      });
    }
  }

  checkIsAdmin(): any {
    this.checkSysAdmin = this.aclService.can(ROLE_SYS_ADMIN);
    if (!this.checkSysAdmin) {
      const tokenData = this.tokenService.get();
      this.form.get('orgId')?.setValue(tokenData?.organizationId);
    }
  }

  resetForm(): void {
    this.form.reset();
    this.form.get('status')?.setValue(true);
    this.form.get('isSignOrgConfirm')?.setValue(false);
    this.form.get('isSignCertify')?.setValue(false);
    this.form.get('isUseEverify')?.setValue(false);
    this.form.get('order')?.setValue(0);
  }

  closeModalReloadData(): void {
    this.isVisible = false;
    this.eventEmmit.emit({ type: 'success' });
  }

  onChangeUserName(value: any, i: number): void {
    if (value) {
      this.lstUser[i].userId = value.id;
      this.lstUser[i].userName = value.name;
      this.lstUser[i].userEmail = value.email;
      this.lstUser[i].userPhoneNumber = value.phoneNumber;
      this.lstUser[i].userPositionName = value.positionName;
    } else {
      this.lstUser[i].userId = null;
      this.lstUser[i].userName = null;
      this.lstUser[i].userEmail = null;
      this.lstUser[i].userPhoneNumber = null;
      this.lstUser[i].userPositionName = null;
    }
  }

  onChangeWorkflowState(value: any, i: number) {
    this.lstUser[i].stateId = value.id;
    this.lstUser[i].state = value.code;
    this.lstUser[i].stateName = value.name;
  }

  onChangeSignType(value: any, i: number): void {
    this.lstUser[i].type = Number(value.value);
  }

  onChangeRemindNotify(item: any): void {
    if (!item.isDisableRemindNotify) {
      item.notifyConfigRemindId = null;
    }
  }

  onChangeExpireNotify(item: any): void {
    if (!item.isDisableExpireNotify) {
      item.notifyConfigExpireId = null;
    }
  }

  removeUser($event: any, index: any): void {
    if (this.lstUser.length === 1) {
      return;
    }
    this.lstUser.splice(index, 1);
  }

  addUser($event: any): void {
    this.lstUser.push({
      order: 0,
      type: this.listOfSignOption[0].value,
      name: '',
      state: '',
      aDSSProfileName: '',
      userId: null,
      userName: '',
      userEmail: '',
      userPhoneNumber: '',
      userPositionName: '',
      selectedSignType: this.listOfSignOption[0],
      isSendMailNotiSign: false,
      isSendMailNotiResult: false,
      isDisabled: false,
    });
  }

  compareFn = (o1: any, o2: any) => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  save(isCreateAfter: boolean = false): Subscription | undefined {
    this.isLoading = true;
    // tslint:disable-next-line:forin
    for (const i in this.form.controls) {
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity();
    }
    if (!this.form.valid) {
      this.isLoading = false;
      this.messageService.error(`${this.i18n.fanyi('function.workflow.modal-item.error.message.form-invalid')}`);
      return;
    }

    const data = {
      id: this.item.id,
      code: this.form.controls.code.value.toString().toUpperCase(),
      name: this.form.controls.name.value,
      status: this.form.controls.status.value,
      isSignOrgConfirm: this.form.controls.isSignOrgConfirm.value,
      isSignCertify: this.form.controls.isSignCertify.value,
      notifyConfigDocumentCompleteId: this.form.controls.notifyConfigDocumentCompleteId.value,
      organizationId: this.form.controls.orgId.value,
      userId: null,
      listUser: this.lstUser,
      order: 0,
      description: '',
      isUseEverify: this.form.controls.isUseEverify.value,
    };

    let check = false;
    let mess = '';
    data.listUser.forEach((user: any) => {
      if (user.maxRenewTimes || user.maxRenewTimes === 0) {
        user.maxRenewTimes = parseInt(user.maxRenewTimes);
      } else {
        user.maxRenewTimes = null;
      }

      if (user.signExpireAfterDay === 0) {
        check = true;
        mess = `${this.i18n.fanyi('function.workflow.modal-item.sign-expire-after-day.message.invalid')}`;
        return;
      }
      if (user.signCloseAfterDay === 0) {
        check = true;
        mess = `${this.i18n.fanyi('function.workflow.modal-item.sign-close-after-day.message.invalid')}`;
        return;
      }
      if (user.maxRenewTimes === 0) {
        check = true;
        mess = `${this.i18n.fanyi('function.workflow.modal-item.max-renew-times.message.invalid')}`;
        return;
      }

      user.signExpireAfterDay = user.signExpireAfterDay ? user.signExpireAfterDay : undefined;
      user.signCloseAfterDay = user.signCloseAfterDay ? user.signCloseAfterDay : undefined;

      if (user.signExpireAfterDay !== null && user.signExpireAfterDay !== undefined && user.signExpireAfterDay <= 0) {
        check = true;
        mess = `${this.i18n.fanyi('function.workflow.modal-item.sign-expire-after-day.message.invalid')}`;
        return;
      }
      if (user.signCloseAfterDay !== null && user.signCloseAfterDay !== undefined && user.signCloseAfterDay <= 0) {
        check = true;
        mess = `${this.i18n.fanyi('function.workflow.modal-item.sign-close-after-day.message.invalid')}`;
        return;
      }
      if (user.maxRenewTimes !== null && user.maxRenewTimes !== undefined && user.maxRenewTimes <= 0) {
        check = true;
        mess = `${this.i18n.fanyi('function.workflow.modal-item.max-renew-times.message.invalid')}`;
        return;
      }

      if (
        user.signExpireAfterDay !== null &&
        user.signExpireAfterDay !== undefined &&
        user.signExpireAfterDay > 0 &&
        user.signCloseAfterDay !== null &&
        user.signCloseAfterDay !== undefined &&
        user.signCloseAfterDay > 0 &&
        user.signExpireAfterDay > user.signCloseAfterDay
      ) {
        check = true;
        mess = 'Ngày đóng hợp đồng phải lớn hơn ngày hết hạn ký';
        return;
      }
    });

    if (check) {
      this.isLoading = false;
      this.messageService.error(mess);
      return;
    }

    data.listUser.forEach((element: any) => {
      delete element.selectedSignType;
      delete element.selectedUser;
      delete element.selectedWFLState;
    });

    if (data.code === null || data.code === undefined || data.code === '') {
      this.isLoading = false;
      this.messageService.error(`Mã quy trình không được để trống!`);
      return;
    }
    if (data.name === null || data.name === undefined || data.name === '') {
      this.isLoading = false;
      this.messageService.error(`Tên quy trình không được để trống!`);
      return;
    }
    if (data.organizationId === null || data.organizationId === undefined || data.organizationId === '') {
      this.isLoading = false;
      this.messageService.error(`Bộ phận không được để trống!`);
      return;
    }

    if (this.option.type !== 'default') {
      data.userId = this.item.userId;
    }

    if (this.isAdd) {
      const promise = this.workflowApiService.create(data).subscribe(
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
      const promise = this.workflowApiService.update(data).subscribe(
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

  onChangeSignExpireAfterDay($event: any): any {
    console.log('object: ', $event);
  }

  onChangeSignCloseAfterDay($event: any): any {
    console.log('object: ', $event);
  }
}

export interface AutocompleteOptionGroups {
  title: string;
  href: string;
  count?: number;
  children?: AutocompleteOptionGroups[];
}
