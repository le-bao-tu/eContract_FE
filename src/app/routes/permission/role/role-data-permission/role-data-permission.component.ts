import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ArrayService } from '@delon/util';
import { ButtonModel } from '@model';
import { CertifyTypeApiService, OrganizationApiService } from '@service';
import { cleanForm, REGEX_CODE, REGEX_NAME } from '@util';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzFormatEmitEvent, NzTreeNode } from 'ng-zorro-antd/tree';
import { Subscription } from 'rxjs';
import { RoleApiService } from 'src/app/services/api/role-api.service';

@Component({
  selector: 'app-role-data-permission',
  templateUrl: './role-data-permission.component.html',
  styleUrls: ['./role-data-permission.component.less'],
})
export class RoleDataPermissionComponent implements OnInit {
  @Input() isVisibleModalPermission = false;
  @Output() eventEmmit = new EventEmitter<any>();

  btnSave: ButtonModel;
  btnCancel: ButtonModel;

  tittle = '';

  isLoading = false;

  documentTypes: any[] = [];

  organizationDataDoc: NzTreeNode[] = [];
  organizationDataUser: NzTreeNode[] = [];
  expandAllOrgDoc = false;
  expandAllOrgUser = false;
  checkStrictlyOrgDoc = true;
  checkStrictlyOrgUser = true;

  docTypeIds: any[] = [];
  orgDocIds: any[] = [];
  orgUserIds: any[] = [];
  roleId: any;

  levelExpand = 2;

  orgDocCheckedLength = 0;
  orgUserCheckedLength = 0;

  orgDocSearchValue: any;
  orgUserSearchValue: any;

  listOrg: any[] = [];
  listDocType: any[] = [];

  constructor(
    private messageService: NzMessageService,
    private roleApiService: RoleApiService,
    private arrayService: ArrayService,
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

  docTypeConvertToTree() {
    const arrayTreeResult = this.listDocType.map((item: any, i: number, arr: any[]) => {
      const checkIsLeft = arr.some((c) => c.parentId === item.id);

      const checked = this.docTypeIds.some((x) => x === item.id);

      return {
        id: item.id,
        parent_id: item.parentId,
        title: item.name,
        isLeaf: !checkIsLeft,
        expanded: false,
        selected: false,
        checked,
      };
    });

    this.documentTypes = this.arrayService.arrToTreeNode(arrayTreeResult, {
      cb: (item, parent, deep) => {
        // item.expanded = deep <= 1;
        item.selected = item.id === 0;
      },
    });
  }

  organizationConvertToTree() {
    const arrayTreeResultOrgDoc = this.listOrg.map((item: any, i: number, arr: any[]) => {
      const checkIsLeft = arr.some((c) => c.parentId === item.id);

      const checked = this.orgDocIds.some((x) => x === item.id);

      return {
        id: item.id,
        parent_id: item.parentId,
        title: item.name,
        isLeaf: !checkIsLeft,
        expanded: false,
        selected: false,
        checked: checked,
      };
    });

    const arrayTreeResultOrgUser = this.listOrg.map((item: any, i: number, arr: any[]) => {
      const checkIsLeft = arr.some((c) => c.parentId === item.id);

      const checked = this.orgUserIds.some((x) => x === item.id);

      return {
        id: item.id,
        parent_id: item.parentId,
        title: item.name,
        isLeaf: !checkIsLeft,
        expanded: false,
        selected: false,
        checked: checked,
      };
    });

    this.organizationDataDoc = this.arrayService.arrToTreeNode(arrayTreeResultOrgDoc, {
      cb: (item, parent, deep) => {
        item.expanded = deep <= this.levelExpand;
        item.selected = item.id === 0;
      },
    });

    this.organizationDataUser = this.arrayService.arrToTreeNode(arrayTreeResultOrgUser, {
      cb: (item, parent, deep) => {
        item.expanded = deep <= this.levelExpand;
        item.selected = item.id === 0;
      },
    });
  }

  handleCancel(): void {
    this.isVisibleModalPermission = false;
    this.eventEmmit.emit({ type: 'close' });
  }

  public initData(data: any, listDocType: any[], listOrganization: any[]) {
    this.listDocType = listDocType;
    this.listOrg = listOrganization;
    this.orgDocCheckedLength = 0;
    this.orgUserCheckedLength = 0;

    this.isVisibleModalPermission = true;
    this.roleId = data.id;
    this.tittle = `${this.i18n.fanyi('function.role.modal-permission.header')}: ${data.code}`;
    this.getDataPermission();
  }

  getDataPermission() {
    const model = {
      id: this.roleId,
    };
    this.roleApiService.getDataPermission(model).subscribe(
      (res) => {
        this.docTypeIds = res.data.listDocumentTypeId;
        this.orgUserIds = res.data.listUserInfoOfOrganizationId;
        this.orgDocIds = res.data.listDocumentOfOrganizationId;

        this.orgDocCheckedLength = this.orgDocIds.filter((v, i, a) => a.indexOf(v) === i).length;
        this.orgUserCheckedLength = this.orgUserIds.filter((v, i, a) => a.indexOf(v) === i).length;

        this.docTypeConvertToTree();
        this.organizationConvertToTree();
      },
      (err) => {
        console.log(err);
      },
    );
  }

  nzEventDocType(event: NzFormatEmitEvent): void {
    if (event.checkedKeys && event.checkedKeys.length > 0) {
      this.docTypeIds = this.docTypeIds.concat(event.checkedKeys.map((x) => x.origin.id)).filter((v, i, a) => a.indexOf(v) === i);
    } else {
      this.docTypeIds = this.docTypeIds.filter((x) => x !== event.node?.key);
    }
  }

  nzEventOrgDoc(event: NzFormatEmitEvent): void {
    if (event.checkedKeys && event.checkedKeys.length > 0) {
      this.orgDocIds = this.orgDocIds.concat(event.checkedKeys.map((x) => x.origin.id)).filter((v, i, a) => a.indexOf(v) === i);
      this.orgDocCheckedLength = this.orgDocIds.length;
    } else {
      this.orgDocIds = this.orgDocIds.filter((x) => x !== event.node?.key);
      this.orgDocCheckedLength = this.orgDocIds.length;
    }
  }

  nzEventOrgUser(event: NzFormatEmitEvent): void {
    if (event.checkedKeys && event.checkedKeys.length > 0) {
      this.orgUserIds = this.orgUserIds.concat(event.checkedKeys.map((x) => x.origin.id)).filter((v, i, a) => a.indexOf(v) === i);
      this.orgUserCheckedLength = this.orgUserIds.length;
    } else {
      this.orgUserIds = this.orgUserIds.filter((x) => x !== event.node?.key);
      this.orgUserCheckedLength = this.orgUserIds.length;
    }
  }

  save() {
    const model = {
      listDocumentTypeId: this.docTypeIds.filter((v, i, a) => a.indexOf(v) === i),
      listDocumentOfOrganizationId: this.orgDocIds.filter((v, i, a) => a.indexOf(v) === i),
      listUserInfoOfOrganizationId: this.orgUserIds.filter((v, i, a) => a.indexOf(v) === i),
      id: this.roleId,
    };
    this.roleApiService.savePermission(model).subscribe(
      (res) => {
        if (res.code !== 200) {
          this.messageService.error(`${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.messageService.error(`${res.message}`);
          return;
        }
        this.messageService.success(`${res.message}`);
        this.isVisibleModalPermission = false;
      },
      (err) => {
        console.log(err);
      },
    );
  }

  nzEventOrgDocSearch($event: any) {
    if ($event.matchedKeys.length < 1) {
      this.docTypeConvertToTree();
    }
  }

  nzEventOrgUserSearch($event: any) {
    if ($event.matchedKeys.length < 1) {
      this.docTypeConvertToTree();
    }
  }
}
