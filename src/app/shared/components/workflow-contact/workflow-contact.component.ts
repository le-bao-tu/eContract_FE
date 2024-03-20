import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { EmailValidator, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

import { Inject, Injectable, Injector } from '@angular/core';

import { ACLService } from '@delon/acl';
import { ButtonModel } from '@model';
import { OrganizationApiService, WorkflowApiService } from '@service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';

import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpaceModule } from 'ng-zorro-antd/space';

import { LIST_SIGN_TYPE } from '@util';

@Component({
  selector: 'app-workflow-contact',
  templateUrl: './workflow-contact.component.html',
  styleUrls: ['./workflow-contact.component.less'],
})
export class WorkflowContactComponent implements OnInit {
  type = 'add';
  item: any;
  @Input() lstUser: any[] = [];
  @Input() isVisible = false;
  option: any;
  @Output() eventEmmit = new EventEmitter<any>();
  user_id: any = null;
  user_email: any = null;

  // Region autocomplete User List
  userNameInputValue?: string;
  userNameFilteredOptions: any[] = [];
  userNameOptions: any[] = [];

  listOfSignOption = LIST_SIGN_TYPE;

  listOfOrgs: any[] = [];

  moduleName = 'quy trình';

  isInfo = false;
  isEdit = false;
  isAdd = false;
  tittle = '';

  isLoading = false;
  isReloadGrid = false;

  optionGroups: AutocompleteOptionGroups[] = [];

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private workflowApiService: WorkflowApiService,
    private organizationApiService: OrganizationApiService,
    private aclService: ACLService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
  ) {
    this.userNameFilteredOptions = this.userNameOptions;

    if (this.tokenService.get()?.token) {
      this.user_id = this.tokenService.get()?.id;
      this.user_email = this.tokenService.get()?.email;
    }
  }

  ngOnInit(): void {
    // this.initListUsers();

    setTimeout(() => {
      this.optionGroups = [
        {
          title: 'Danh bạ nội bộ',
          href: '/#/workflow/contact/internal',
          children: this.userNameOptions.filter((item) => {
            return item.userId === undefined;
          }),
        },
        {
          title: 'Danh bạ của tôi',
          href: '/#/workflow/contact/owner',
          children: this.userNameOptions.filter((item) => {
            return item.userId !== undefined;
          }),
        },
      ];
    }, 2000);
  }

  // initListUsers(): Subscription | undefined {
  //   const promise = this.contactApiService.getListCombobox(this.user_id).subscribe(
  //     (res: any) => {
  //       this.isLoading = false;
  //       if (res.code !== 200) {
  //         this.messageService.error(`${res.message}`);
  //         return;
  //       }
  //       if (res.data === null || res.data === undefined) {
  //         this.messageService.error(`${res.message}`);
  //         return;
  //       }
  //       const dataResult = res.data;
  //       this.contactNameOptions = dataResult;
  //     },
  //     (err: any) => {
  //       this.isLoading = false;
  //       if (err.error) {
  //         this.messageService.error(`${err.error.message}`);
  //       } else {
  //         this.messageService.error(`${err.status}`);
  //       }
  //     },
  //   );
  //   return promise;
  // }

  public initData(data: any, type: any = null, option: any = {}): void {
    console.log('Lalall:', data, type);
    this.isLoading = false;
    this.isReloadGrid = false;
    this.item = data;
    this.type = type;
    this.option = option;
    if (this.item.id === null || this.item.id === undefined) {
      // Khỏi tạo danh sách người tham gia
      // Nếu tài khoản đăng nhập có email thì hắn là người đầu tiên trong quy trình
      // B1 Check xem mail có trong danh bạ k
      const userUser = this.userNameOptions.find((c) => c.email === this.user_email);
      // B2 Add vào lstUser
      if (userUser !== undefined && userUser !== null && (this.user_email !== undefined || this.user_email !== null)) {
        this.lstUser = [
          {
            order: 0,
            type: this.listOfSignOption[0].value,
            name: '',
            userId: userUser.id,
            userEmail: userUser.email,
            userName: userUser.name,
            userPosition: userUser.positionName,
            selectedSignType: this.listOfSignOption[0],
            isDisabled: true,
          },
        ];
      } else {
        this.lstUser = [
          {
            order: 0,
            type: this.listOfSignOption[0].value,
            name: '',
            userId: null,
            userName: '',
            userEmail: '',
            positionName: '',
            selectedSignType: this.listOfSignOption[0],
            isDisabled: false,
          },
        ];
      }
    } else {
      // Get by Id
      this.workflowApiService.getById(this.item.id).subscribe((res) => {
        const detail = res.data;

        const lstDetailUser = detail.listUser;

        this.lstUser = lstDetailUser;

        for (const c of this.lstUser) {
          const objectt = this.listOfSignOption.filter((item) => {
            return item.value === c.type;
          });
          // console.log(objectt);
          c.selectedSignType = objectt[0];
          c.isDisabled = false;
        }
      });
    }
  }

  //#region event
  onChangeUserName(value: any, i: number): void {
    this.lstUser[i].userEmail = null;
    this.lstUser[i].userPosition = null;

    // auto complete
    if (value.name === null || value.name === undefined) {
      // this.userNameFilteredOptions = this.userNameOptions.filter((o) => o.name.toLowerCase().indexOf(value.toLowerCase()) !== -1);

      this.optionGroups.forEach((element) => {
        if (element.title === 'Danh bạ nội bộ') {
          element.children = this.userNameOptions.filter((item) => {
            return item.userId === undefined && item.name.toLowerCase().indexOf(value.toLowerCase()) !== -1;
          });
        } else {
          element.children = this.userNameOptions.filter((item) => {
            return item.userId !== undefined && item.name.toLowerCase().indexOf(value.toLowerCase()) !== -1;
          });
        }
      });
    } else {
      this.lstUser[i].userId = value.id;
      this.lstUser[i].userName = value.name;
      this.lstUser[i].userEmail = value.email;
      this.lstUser[i].userPosition = value.positionName;
    }
  }

  onChangeSignType(value: any, i: number): void {
    this.lstUser[i].type = Number(value.value);
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
      userId: null,
      userName: '',
      userEmail: '',
      positionName: '',
      selectedSignType: this.listOfSignOption[0],
      isDisabled: false,
    });
  }

  compareFn = (o1: any, o2: any) => (o1 && o2 ? o1.value === o2.value : o1 === o2);
}
export interface AutocompleteOptionGroups {
  title: string;
  href: string;
  count?: number;
  children?: AutocompleteOptionGroups[];
}
