import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ArrayService } from '@delon/util';
import { ButtonModel } from '@model';
import { UserApiService } from '@service';
import { cleanForm, REGEX_CODE, REGEX_NAME } from '@util';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TransferChange, TransferItem, TransferSelectChange } from 'ng-zorro-antd/transfer';
import { NzTreeNode } from 'ng-zorro-antd/tree';
import { Subscription } from 'rxjs';
import { RoleApiService } from 'src/app/services/api/role-api.service';

@Component({
  selector: 'app-role-user',
  templateUrl: './role-user.component.html',
  styleUrls: ['./role-user.component.less'],
})
export class RoleUserComponent implements OnInit {
  @Input() isVisibleRoleUser = false;
  @Output() eventEmmit = new EventEmitter<any>();
  @Input() type = 'add';
  @Input() item: any;
  @Input() option: any;

  tittle = '';
  isReloadGrid = false;
  isLoading = false;

  regexCode = REGEX_CODE;
  regexName = REGEX_NAME;

  isInfo = false;
  isEdit = false;
  isAdd = false;

  btnSave: ButtonModel;
  btnCancel: ButtonModel;

  listUser: any[] = [];
  listOrg: any[] = [];
  listOrgTree: NzTreeNode[] = [];
  listUserTransfer: TransferItem[] = [];

  listUserTemp: any[] = [];
  listUserTransferTemp: any[] = [];

  listUserSelected: any[] = [];

  orgSelected: any;

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private roleApiService: RoleApiService,
    private arrayService: ArrayService,
    private userService: UserApiService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {
    //#region init button
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
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.handleCancel();
      },
    };

    //#endregion
  }

  ngOnInit() {}

  $asTransferItems = (data: unknown): TransferItem[] => data as TransferItem[];

  handleCancel(): void {
    this.isVisibleRoleUser = false;
    if (this.isReloadGrid) {
      this.eventEmmit.emit({ type: 'success' });
    } else {
      this.eventEmmit.emit({ type: 'close' });
    }
  }

  public initData(data: any, listUser: any[], listOrg: any[]): void {
    this.listUserSelected = [];
    this.listUser = listUser;
    this.listUserTemp = listUser;
    this.listOrg = listOrg;
    this.isVisibleRoleUser = true;
    this.item = data;
    this.tittle = `${this.i18n.fanyi('function.role.modal-user-role.header')}: ${data.code}`;
    this.initTreeData();
    this.getListUserIdByRoleId();
  }

  initTreeData() {
    const arrayTreeResult = this.listOrg.map((item: any, i: number, arr: any[]) => {
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

    this.listOrgTree = this.arrayService.arrToTreeNode(arrayTreeResult, {
      cb: (item, parent, deep) => {
        // item.expanded = deep <= 1;
        item.selected = item.id === 0;
      },
    });
  }

  initTransferData() {
    this.listUserTransfer = [];
    for (let i = 0; i < this.listUser.length; i++) {
      let user = this.listUser[i];
      this.listUserTransfer.push({
        key: i.toString(),
        id: user.id,
        title: user.name,
        name: user.name,
        code: user.code,
        organizationId: user.organizationId,
        checked: false,
        direction: this.listUserSelected.some((x) => x === user.id) ? 'right' : 'left',
      });
    }

    this.listUserTransferTemp = this.listUserTransfer;
  }

  getListUserIdByRoleId() {
    const model = {
      roleId: this.item.id,
    };

    this.userService.getListUserIdByRole(model).subscribe(
      (res) => {
        if (res.data && res.data.listUserId) this.listUserSelected = res.data.listUserId;

        this.initTransferData();
      },
      (err) => {
        this.initTransferData();
      },
    );
  }

  save() {
    let model = {
      roleId: this.item.id,
      userIds: this.listUserSelected,
    };

    this.userService.saveListUserRole(model).subscribe(
      (res) => {
        if (res.code !== 200) {
          this.messageService.error(`${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.messageService.error(`${res.message}`);
          return;
        }

        this.isVisibleRoleUser = false;
        this.messageService.success(`${res.message}`);
      },
      (err) => {
        if (err.error) {
          this.messageService.error(`${err.error.message}`);
        } else {
          this.messageService.error(`${err.status}`);
        }
      },
    );
  }

  onChangeOrg($event: any) {
    this.orgSelected = $event;
    if (this.orgSelected) {
      this.listUser = this.listUserTemp.filter((x) => x.organizationId === this.orgSelected);
      this.listUserTransfer = this.listUserTransferTemp.filter((x) => x.organizationId === this.orgSelected);
    } else {
      this.listUser = this.listUserTemp;
      this.listUserTransfer = this.listUserTransferTemp;
    }
  }

  selectUser(ret: TransferSelectChange): void {
    //console.log('nzSelectChange', ret);
  }

  changeUser(ret: TransferChange): void {
    // xóa khỏi danh sách user selected
    if (ret.to === 'left') {
      this.listUserSelected = this.listUserSelected.filter((x) => !ret.list.map((x1) => x1.id).includes(x));
    }
    // thêm vào danh sách user selected
    else if (ret.to === 'right') {
      this.listUserSelected = this.listUserSelected.concat(ret.list.map((x) => x.id));
    }

    const listKeys = ret.list.map((l) => l.key);
    const hasOwnKey = (e: TransferItem): boolean => e.hasOwnProperty('key');
    this.listUserTransfer = this.listUserTransfer.map((e) => {
      if (listKeys.includes(e.key) && hasOwnKey(e)) {
        if (ret.to === 'left') {
          delete e.hide;
          //this.listUserSelected = this.listUserSelected.filter((x) => !ret.list.map((x1) => x1.id).includes(x));
        } else if (ret.to === 'right') {
          e.hide = false;
          //this.listUserSelected = this.listUserSelected.concat(ret.list.map((x) => x.id));
        }
      }
      return e;
    });
  }

  searchUser($event: any) {
    //console.log('event: ', $event);
  }

  filterUserOption(inputValue: string, item: any): boolean {
    return item.name.indexOf(inputValue) > -1 || item.code.indexOf(inputValue) > -1;
  }
}
