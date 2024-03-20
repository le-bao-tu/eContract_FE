import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ButtonModel } from '@model';
import { UserHSMAccountApiService } from 'src/app/services/api';

@Component({
  selector: 'app-cert-detail',
  templateUrl: './cert-detail.component.html',
  styleUrls: ['./cert-detail.component.less'],
})
export class CertDetailComponent implements OnInit {
  @Input() isVisible = false;
  @Output() eventEmmit = new EventEmitter<any>();

  tittle = 'Chứng thư số';
  isReloadGrid = false;
  isLoading = false;
  data = {};

  btnCancel: ButtonModel;

  constructor(private userHSMAccountRouter: UserHSMAccountApiService) {
    this.btnCancel = {
      title: 'Đóng',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        this.handleCancel();
      },
    };
  }

  ngOnInit(): void { }

  public async initData(id: string, type: string): Promise<any> {
    this.isVisible = true;
    this.isLoading = false;
    this.isReloadGrid = false;

    let res = await this.getInfoCertificate(id);

    if (res.data) this.data = Object.assign([], res.data);
  }

  public async getInfoCertificate(userHSMAccountId: string): Promise<any> {
    return await this.userHSMAccountRouter.getInfoCertificate(userHSMAccountId).toPromise();
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
