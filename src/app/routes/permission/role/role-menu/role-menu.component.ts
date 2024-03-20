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
  selector: 'app-role-menu',
  templateUrl: './role-menu.component.html',
  styleUrls: ['./role-menu.component.less'],
})
export class RoleMenuComponent implements OnInit {
  @Input() isVisibleModalMenu = false;
  @Output() eventEmmit = new EventEmitter<any>();

  btnSave: ButtonModel;
  btnCancel: ButtonModel;

  tittle = '';

  isLoading = false;

  roleId: any;

  listMenu: any[] = [];
  treeMenuData: NzTreeNode[] = [];
  searchMenuValue: any;
  menuIdSelected: any[] = [];

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

  handleCancel(): void {
    this.isVisibleModalMenu = false;
    this.eventEmmit.emit({ type: 'close' });
  }

  public initData(data: any, listMenu: any[]) {
    this.listMenu = listMenu;

    this.isVisibleModalMenu = true;
    this.roleId = data.id;
    this.tittle = `${this.i18n.fanyi('function.role.modal-navigation.header')}: ${data.code}`;
    this.getMenuByRole();
  }

  initMenuTree() {
    const arrayTreeResult = this.listMenu.map((item: any, i: number, arr: any[]) => {
      const checkIsLeft = arr.some((c) => c.parentId === item.id);

      const checked = this.menuIdSelected.some((x) => x === item.id);

      return {
        id: item.id,
        parent_id: item.parentId,
        title: item.name,
        isLeaf: !checkIsLeft,
        expanded: true,
        selected: false,
        checked,
      };
    });

    this.treeMenuData = this.arrayService.arrToTreeNode(arrayTreeResult, {
      cb: (item, parent, deep) => {
        // item.expanded = deep <= 1;
        item.selected = item.id === 0;
      },
    });
  }

  getMenuByRole() {
    const model = {
      roleId: this.roleId,
    };
    this.roleApiService.getListMenuIdByRole(model).subscribe(
      (res) => {
        if (res.data) {
          this.menuIdSelected = res.data.navigationIds;
        }

        this.initMenuTree();
      },
      (err) => {
        this.initMenuTree();
        console.log(err);
      },
    );
  }

  save() {
    const model = {
      roleId: this.roleId,
      navigationIds: this.menuIdSelected.filter((v, i, a) => a.indexOf(v) === i),
    };
    this.roleApiService.updateMenuByRole(model).subscribe(
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
        this.isVisibleModalMenu = false;
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

  nzEventMenuChange(event: NzFormatEmitEvent): void {
    if (event.checkedKeys && event.checkedKeys.length > 0) {
      this.menuIdSelected = this.menuIdSelected.concat(event.checkedKeys.map((x) => x.origin.id)).filter((v, i, a) => a.indexOf(v) === i);
    } else {
      this.menuIdSelected = this.menuIdSelected.filter((x) => x !== event.node?.key);
    }
  }
}
