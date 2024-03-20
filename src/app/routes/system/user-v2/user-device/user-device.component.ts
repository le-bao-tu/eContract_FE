import { Component, EventEmitter, Inject, Input, OnInit, Output, } from '@angular/core';
import { UserService } from '@service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ButtonModel, GridModel, QueryFilerModel } from '@model';
import { LIST_STATUS_DEVICE, OVERLAY_LOADING_TEMPLATE, OVERLAY_NOROW_TEMPLATE, QUERY_FILTER_DEFAULT } from '@util';
import moment from 'moment';
import { BtnCellRenderComponent } from '@shared';

@Component({
  selector: 'app-user-device',
  templateUrl: './user-device.component.html',
  styleUrls: ['./user-device.component.less'],
})
export class UserDeviceComponent implements OnInit {
  constructor(
    private notification: NzNotificationService,
    private userService: UserService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
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

    //#region ag-grid
    this.columnDefs = [
      {
        field: 'index',
        headerName: `${this.i18n.fanyi('layout.grid.index')}`,
        width: 50,
        cellRenderer: 'agGroupCellRenderer',
      },

      {
        field: 'deviceId',
        headerName: `${this.i18n.fanyi('function.user.grid.deviceId')}`,
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'deviceName',
        headerName: `${this.i18n.fanyi('function.user.grid.deviceName')}`,
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'isldentifierDevice',
        headerName: `${this.i18n.fanyi('function.user.grid.isldentifierDevice')}`,
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'createdAt',
        headerName: `${this.i18n.fanyi('function.user.grid.createdAt')}`,
        minWidth: 100,
        flex: 1,
      },
      // {
      //   field: 'eformStatus',
      //   headerName: `Trạng thái EForm`,
      //   minWidth: 250,
      //   cellRenderer: 'eformStatusCellRender',
      //   cellRendererParams: {
      //     daKyClick: (item: any) => this.daKyClick(item),
      //     chuaKyCTSClick: (item: any) => this.chuaKyCTSClick(item),
      //     chuaKyGDDTClick: (item: any) => this.chuaKyGDDTClick(item),
      //   },
      //   flex: 1,
      // },
      // { field: 'certType', headerName: 'Chứng thư số', minWidth: 150, cellRenderer: 'statusCertCellRender', flex: 1 },
    ];
    this.defaultColDef = {
      // flex: 1,
      minWidth: 120,
      resizable: true,
    };
    this.defaultColDef = {
      // flex: 1,
      minWidth: 100,
      resizable: true,
    };
    this.frameworkComponents = {
      btnCellRender: BtnCellRenderComponent,
    };

  }

  @Input() item: any;
  @Input() isVisible = false;
  @Input() option: any;
  @Output() eventEmmit = new EventEmitter<any>();
  type = false;
  columnDefs: any[] = [];
  listUserDevice: any[] = [];
  pageSizeOptions: any[] = [];
  defaultColDef: any;
  isLoading = false;
  isReloadGrid = false;
  isCustomer = false;
  isFromDocument: any = false;
  tittle = `${this.i18n.fanyi('function.user-device.title')}`;
  moduleName = 'Người dùng';
  excelStyles: any;
  deviceFirebaseToken: any;
  frameworkComponents: any;
  paginationMessage = '';
  grid: GridModel = {
    dataCount: 0,
    rowData: [],
    totalData: 0,
  };
  btnCancel: ButtonModel;
  overlayLoadingTemplate = OVERLAY_LOADING_TEMPLATE;
  overlayNoRowsTemplate = OVERLAY_NOROW_TEMPLATE;
  filter: QueryFilerModel = { ...QUERY_FILTER_DEFAULT };
  listStatusDevice = LIST_STATUS_DEVICE;
  private gridApi: any;
  private gridColumnApi: any;

  handleCancel(): void {
    this.isVisible = false;
    if (this.isReloadGrid) {
      this.eventEmmit.emit({ type: 'success' });
    } else {
      this.eventEmmit.emit({ type: 'close' });
    }
  }

  ngOnInit(): void {}

  initData(data: any, type: any = null, option: any = {}): void {
    console.log('data: ', data);
    this.initGridData(data.id);
    this.isLoading = false;
    this.isReloadGrid = false;
    this.type = type;
    this.option = option;
    this.isVisible = true;
  }

  initGridData(userId: any): Subscription {
    this.filter.isInternalUser = true;
    const rs = this.userService.getListUserDevice(userId).subscribe(
      (res: any) => {
        console.log(res);
        if (res.code !== 200) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        if (res.data === null || res.data === undefined) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }
        const dataResult = res.data;

        let i = 1;
        for (const item of dataResult) {
          item.index = ++i;
          item.deviceId;
          item.deviceName;
          item.isldentifierDevice = this.listStatusDevice.find((x: any) => x.id === item.status)?.name;;
          item.createdAt = moment(item.createdAt).format('DD/MM/YYYY HH:mm:ss');;
        }
        this.grid.dataCount = dataResult.dataCount;
        this.grid.rowData = dataResult;
      },
      (err: any) => {
        // console.log(err);
        // this.gridApi.hideOverlay();
      },
    );
    return rs;
  }
}
