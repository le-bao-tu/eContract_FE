import { ChangeDetectionStrategy, Component, Inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';
import { DashboardApiService } from 'src/app/services/api/dashboard-api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less'],
})
export class DashboardComponent implements OnInit {
  title = `${this.i18n.fanyi('function.dashboard.title')}`;
  dashboardModel: any = {
    totalDocument: 0,
    waitMeSign: 0,
    completed: 0,
    draft: 0,
    error: 0,
    incommingExpired: 0,
    listSignCompleted: [],
    listSignIncommingExpired: [],
    signDTAT: 0,
    signLTV: 0,
    signNormal: 0,
    signTSA: 0,
  };

  fromAndToDate: any;

  constructor(
    private route: ActivatedRoute,
    private dashboardApiService: DashboardApiService,
    private messageService: NzMessageService,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {}

  @Input() orgId: any;

  ngOnInit(): void {
    // console.log('org id: ', this.orgId);
    this.initDashboardData({});
  }

  logOut(): void {
    this.dashboardModel = {
      totalDocument: 0,
      waitMeSign: 0,
      completed: 0,
      draft: 0,
      error: 0,
      incommingExpired: 483,
      listSignCompleted: [],
      listSignIncommingExpired: [],
      signDTAT: 0,
      signLTV: 0,
      signNormal: 0,
      signTSA: 0,
    };
  }

  initDashboardData(model: any): void {
    if (this.orgId) {
      model.organizationId = this.orgId;
    }
    this.dashboardApiService.getDashboardInfo(model).subscribe(
      (res: any) => {
        if (res.code !== 200) {
          this.notification.error(`Có lỗi xảy ra`, `${res.message}`);
          return;
        }

        this.dashboardModel = res.data;
      },
      (err: any) => {
        this.notification.error(`Có lỗi xảy ra`, `${err.error.message}`);
      },
    );
  }

  onChangeRange($event: any) {
    this.fromAndToDate = $event;
    this.initDashboardData({
      fromDate: this.fromAndToDate[0],
      toDate: this.fromAndToDate[1],
    });
  }
}
