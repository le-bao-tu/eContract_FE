import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ACLService } from '@delon/acl';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { environment } from '@env/environment';
import { CommunicationService } from '@service';
import { authWSO2 } from '@util';
import { Subscription } from 'rxjs';

@Component({
  selector: '[layout-pro-header-widget]',
  templateUrl: './widget.component.html',
  host: {
    '[class.alain-pro__header-right]': 'true',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutProHeaderWidgetComponent implements OnInit {
  isShowButtonAddDocument = true;
  subscription: Subscription | undefined;
  constructor(private router: Router, @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService, private aclService: ACLService, private com: CommunicationService, private cdr: ChangeDetectorRef) {

  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.subscription = this.com.currentMessage.subscribe(message => {
      if (message === "PermissionChanged") {
        this.isShowButtonAddDocument = this.aclService.canAbility('DOCUMENT-ADD');
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    let data_token;
    const authType = environment.AUTH_TYPE;
    switch (authType) {
      case 'jwt':
      case 'ad':
        this.tokenService.clear();
        this.router.navigateByUrl('passport/login');
        break;

      case 'wso2':
        data_token = JSON.parse(localStorage.getItem('data_token') || '{}');
        if (data_token !== {} && data_token !== null) {
          const url =
            environment.BASE_WSO2_URL +
            authWSO2.logoutWso2 +
            data_token.id_token +
            authWSO2.post_logout_redirect_uri +
            environment.BASE_LOGOUT_URL;
          window.location.href = url;
          this.tokenService.clear();
        }
        break;
      default:
        data_token = JSON.parse(localStorage.getItem('data_token') || '{}');
        if (data_token !== {} && data_token !== null) {
          const url =
            environment.BASE_WSO2_URL +
            authWSO2.logoutWso2 +
            data_token.id_token +
            authWSO2.post_logout_redirect_uri +
            environment.BASE_LOGOUT_URL;
          window.location.href = url;
          this.tokenService.clear();
        }
        break;
    }
  }
}
