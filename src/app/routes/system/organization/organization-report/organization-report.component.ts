import { Inject, Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ButtonModel } from '@model';
import { ReportService } from 'src/app/services/api/report.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
@Component({
  selector: 'app-organization-report',
  templateUrl: './organization-report.component.html',
  styleUrls: ['./organization-report.component.less'],
})
export class OrganizationReportComponent implements OnInit {
  constructor(
    private reportService: ReportService, 
    private messageService: NzMessageService, 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,) {
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

  @Input() isVisible: boolean = false;
  @Output() eventEmmit = new EventEmitter<any>();
  btnCancel: ButtonModel;

  title: string = `${this.i18n.fanyi('function.organization.organization-report.modal-item.header-data-statistics-organization')}`;
  isLoading = false;
  dateFormat: string = 'dd-MM-yyyy';
  filter: any = {
    organizationID: '',
    fromDate: new Date(),
    toDate: new Date(),
  };

  reportContent: any = {};

  ngOnInit(): void {}

  initData(data: any): void {
    this.filter.organizationID = data.id;
    this.getReportDocumentByOrgID();
  }

  getReportDocumentByOrgID(): void {
    if (!this.filter.fromDate) {
      this.filter.fromDate = new Date('1/1/0001 12:00:00');
    }

    if (!this.filter.toDate) {
      this.filter.toDate = new Date();
    }

    this.reportService.getReportDocumentByOrgID(this.filter).subscribe(
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

        this.reportContent = res.data;
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
  }

  changeFromDate(fromDate: any): void {
    this.getReportDocumentByOrgID();
  }

  changeToDate(toDate: any): void {
    this.getReportDocumentByOrgID();
  }

  handleCancel(): void {
    this.isVisible = false;
    this.eventEmmit.emit();
  }
}
