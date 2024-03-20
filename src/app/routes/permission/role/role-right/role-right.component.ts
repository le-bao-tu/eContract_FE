import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ArrayService } from '@delon/util';
import { ButtonModel } from '@model';
import { CertifyTypeApiService, CommunicationService, OrganizationApiService } from '@service';
import { cleanForm, REGEX_CODE, REGEX_NAME } from '@util';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzFormatEmitEvent, NzTreeNode } from 'ng-zorro-antd/tree';
import { Subscription } from 'rxjs';
import { RoleApiService } from 'src/app/services/api/role-api.service';

@Component({
  selector: 'app-role-right',
  templateUrl: './role-right.component.html',
  styleUrls: ['./role-right.component.less'],
})
export class RoleRightComponent implements OnInit {
  @Input() isVisibleModalRight = false;
  @Output() eventEmmit = new EventEmitter<any>();

  btnSave: ButtonModel;
  btnCancel: ButtonModel;

  tittle = '';

  isLoading = false;

  roleId: any;

  listRight: any[] = [];
  treeRightData: NzTreeNode[] = [];
  searchRightValue: any;
  rightIdSelected: any[] = [];

  constructor(
    private messageService: NzMessageService,
    private roleApiService: RoleApiService,
    private arrayService: ArrayService,
    private com: CommunicationService,
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

  ngOnInit() { }

  handleCancel(): void {
    this.isVisibleModalRight = false;
    this.eventEmmit.emit({ type: 'close' });
  }

  public initData(data: any, listRight: any[]) {
    this.listRight = listRight;

    this.isVisibleModalRight = true;
    this.roleId = data.id;
    this.tittle = `${this.i18n.fanyi('function.role.modal-right.header')}: ${data.code}`;
    this.getRightByRole();
  }

  initRightTree() {
    const roots = this.listRight.map((item: any) => item.groupName).filter((v: any, i: any, a: any) => a.indexOf(v) === i);
    const rootsObj = [];
    for (const item of roots) {
      const rootObj = {
        groupName: null,
        name: item,
        code: item,
        id: item,
      };
      rootsObj.push(rootObj);
    }

    const arrayTreeResult = this.listRight.concat(rootsObj).map((item: any, i: number, arr: any[]) => {
      const checkIsLeft = arr.some((c) => c.groupName === item.id);

      const checked = this.rightIdSelected.some((x) => x === item.id);

      return {
        id: item.id,
        parent_id: item.groupName,
        title: item.name,
        isLeaf: !checkIsLeft,
        expanded: true,
        selected: false,
        checked,
        disabled: checkIsLeft,
        disableCheckbox: checkIsLeft,
      };
    });

    this.treeRightData = this.arrayService.arrToTreeNode(arrayTreeResult, {
      cb: (item, parent, deep) => {
        // item.expanded = deep <= 1;
        item.selected = item.id === 0;
      },
    });
  }

  getRightByRole() {
    const model = {
      roleId: this.roleId,
    };
    this.roleApiService.getListRightIdByRole(model).subscribe(
      (res) => {
        if (res.data) {
          this.rightIdSelected = res.data.rightIds;
        }

        this.initRightTree();
      },
      (err) => {
        this.initRightTree();
        console.log(err);
      },
    );
  }

  save() {
    const model = {
      roleId: this.roleId,
      rightIds: this.rightIdSelected.filter((v, i, a) => a.indexOf(v) === i),
    };
    this.roleApiService.updateRightByRole(model).subscribe(
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
        this.isVisibleModalRight = false;
      },
      (err) => {
        if (err.error) {
          this.messageService.error(`${err.error.message}`);
        } else {
          this.messageService.error(`${err.status}`);
        }
      },
    );

    this.com.changeMessage("RightChanged");
  }

  nzEventRightChange(event: NzFormatEmitEvent): void {
    if (event.checkedKeys && event.checkedKeys.length > 0) {
      this.rightIdSelected = this.rightIdSelected.concat(event.checkedKeys.map((x) => x.origin.id)).filter((v, i, a) => a.indexOf(v) === i);
    } else {
      this.rightIdSelected = this.rightIdSelected.filter((x) => x !== event.node?.key);
    }
  }
}
