import { Component, Inject, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StartupService } from '@core';
import { ACLService } from '@delon/acl';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { MenuService, SettingsService } from '@delon/theme';
import { environment } from '@env/environment';
import { CoreService, KeyCloakApiService, Wso2Service } from '@service';
import { authWSO2 } from '@util';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.less'],
})
export class ConfirmComponent implements OnInit {
  tokenExpired: any;
  isLoading = true;

  BASE_WSO2_URL = '';
  BASE_LOGOUT_URL = '';
  CLIENT_ID = '';
  BASE_CALLBACK_URL = '';

  constructor(
    private injector: Injector,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private wso2ApiService: Wso2Service,
    private coreService: CoreService,
    private notification: NzNotificationService,
    private modal: NzModalService,
    private keyCloakApiService: KeyCloakApiService,
  ) {
    this.BASE_WSO2_URL = environment.BASE_WSO2_URL;
    this.BASE_LOGOUT_URL = environment.BASE_LOGOUT_URL;
    this.CLIENT_ID = environment.CLIENT_ID;
    this.BASE_CALLBACK_URL = environment.BASE_CALLBACK_URL;
  }

  async ngOnInit(): Promise<void> {
    const res = await this.coreService.getEnvironment().toPromise();
    if (res) {
      if (res.BASE_WSO2_URL) {
        this.BASE_WSO2_URL = environment.BASE_WSO2_URL;
      }
      if (res.BASE_LOGOUT_URL) {
        this.BASE_LOGOUT_URL = environment.BASE_LOGOUT_URL;
      }
      if (res.CLIENT_ID) {
        this.CLIENT_ID = environment.CLIENT_ID;
      }
      if (res.BASE_CALLBACK_URL) {
        this.BASE_CALLBACK_URL = environment.BASE_CALLBACK_URL;
      }
    }

    if (environment.AUTH_TYPE === 'keycloak') {
      let searchParams = new URLSearchParams(window.location.href);
      const authorization_code = searchParams.get('code');
      if (authorization_code) localStorage.setItem('code', authorization_code);
      this.getAccessToken(authorization_code);
    }
    else {
      this.activatedRoute.queryParams.subscribe((params) => {
        const authorization_code = params.code;
        localStorage.setItem('code', authorization_code);
        this.getAccessToken(authorization_code);
      });
    }
  }

  getAccessToken(authorization_code: any): void {
    if (environment.AUTH_TYPE === 'keycloak') {
      this.keyCloakApiService.getAccessToken(authorization_code).subscribe(
        (res) => {
          this.keyCloakApiService.getUserInfo(res.data.access_token).subscribe(
            (userInfoRes) => {
              var dataToken = {
                access_token: res.data.access_token,
                refresh_token: res.data.refresh_token
              };
              localStorage.setItem('data_token', JSON.stringify(dataToken));

              const tokenInfo = {
                id: userInfoRes.data.id,
                userId: userInfoRes.data.user_id,
                userName: userInfoRes.data.user_name,
                appId: userInfoRes.data.app_id,
                rights: [],
                roles: [],
                isUser: false,
                isSystemAdmin: false,
                isOrgAdmin: false,
                token: res.data.access_token,
                name: userInfoRes.data.display_name,
                organizationId: userInfoRes.data.organization_id,
                message: userInfoRes.data.message,
              };

              if (!userInfoRes.data.roles || userInfoRes.data.roles.length < 1) {
                this.modal.error({
                  nzTitle: '<i>Lỗi đăng nhập</i>',
                  nzContent: '<b>Tài khoản chưa được phân quyền. Vui lòng liên hệ quản trị hệ thống để được cấp quyền truy cập</b>',
                  nzOnOk: () => this.goToKeyCloakLogout(),
                });
                return;
              }

              this.settingsService.setUser({
                name: userInfoRes.data.display_name,
                avatar: './assets/tmp/img/user.png',
                email: userInfoRes.data.email,
              });
              this.tokenService.set(tokenInfo);
              this.router.navigateByUrl('dashboard');
            },
            (err) => {
              this.modal.error({
                nzTitle: '<i>Lỗi đăng nhập</i>',
                nzContent: '<b>Không thể kết nối hệ thống để thực hiện xác thực dữ liệu!</b>',
                nzOnOk: () => {
                  this.goToKeyCloakLogout();
                },
              });
            }
          )
        },
        (err) => {
          this.toLoginKeyCloak();
        }
      )
    }

    if (environment.AUTH_TYPE === 'wso2') {
      this.wso2ApiService.getAccessToken(authorization_code).subscribe(
        async (res) => {
          this.isLoading = false;
          localStorage.setItem('data_token', JSON.stringify(res.data));
          if (res.data.userInfo !== null && res.data.userInfo !== undefined) {
            this.tokenExpired = false;
            const token = {
              id: res.data.userInfo.id,
              userId: res.data.userInfo.user_id,
              userName: res.data.userInfo.user_name,
              appId: res.data.userInfo.app_id,
              rights: [],
              roles: [],
              isUser: false,
              isSystemAdmin: false,
              isOrgAdmin: false,
              token: res.data.access_token,
              name: res.data.userInfo.display_name,
              organizationId: res.data.userInfo?.organization_id,
              timeExpride: res.data.expires_time,
              start_time: res.data.start_time,
              expires_in: res.data.expires_in,
              is_lock: res.data.userInfo.is_lock,
              message: res.data.userInfo.message,
            };

            if (token.is_lock) {
              this.modal.error({
                nzTitle: '<i>Lỗi đăng nhập</i>',
                nzContent: `<b>${token.message}</b>`,
                nzOnOk: () => this.goToWSO2Logout(),
              });
              return;
            }

            if (!res.data.userInfo.roles || res.data.userInfo.roles.length < 1) {
              this.modal.error({
                nzTitle: '<i>Lỗi đăng nhập</i>',
                nzContent: '<b>Tài khoản chưa được phân quyền. Vui lòng liên hệ quản trị hệ thống để được cấp quyền truy cập</b>',
                nzOnOk: () => this.goToWSO2Logout(),
              });
              return;
            }

            this.settingsService.setUser({
              name: res.data.userInfo?.display_name,
              avatar: './assets/tmp/img/user.png',
              email: res.data.userInfo?.email,
            });
            this.tokenService.set(token);
            this.router.navigateByUrl('dashboard');
          } else {
            this.modal.error({
              nzTitle: '<i>Lỗi đăng nhập</i>',
              nzContent: '<b>Có lỗi xảy ra vui lòng đăng xuất và đăng nhập lại!</b>',
              nzOnOk: () => {
                this.goToWSO2Logout();
              },
            });
            // setTimeout(() => {
            //   // Clear token information
            //   this.settingsService.setUser({});
            //   (this.injector.get(DA_SERVICE_TOKEN) as ITokenService).clear();
            //   //this.goToWSO2Logout();
            //   // this.toLogin();
            //   this.tokenService.clear();
            //   this.tokenExpired = true;
            //   localStorage.removeItem('data_token');
            //   // this.notification.error(`Expires_time: `, `${res.data.expires_time}`);
            // }, 1500);
          }
        },
        (err) => {
          this.isLoading = false;
          if (err.error.code === 401) {
            this.goToWSO2Logout();
          } else if (err.status === 0) {
            // this.notification.error(`Có lỗi xảy ra`, `Không thể kết nối hệ thống để thực hiện validate dữ liệu`);
            this.modal.error({
              nzTitle: '<i>Lỗi đăng nhập</i>',
              nzContent: '<b>Không thể kết nối hệ thống để thực hiện xác thực dữ liệu!</b>',
              nzOnOk: () => {
                this.goToWSO2Logout();
              },
            });
          } else {
            this.toLogin();
            // this.notification.error(`Có lỗi xảy ra`, `${err.message}`);
          }
        },
      );
    }
  }

  private goToWSO2Logout(): void {
    this.settingsService.setUser({});
    (this.injector.get(DA_SERVICE_TOKEN) as ITokenService).clear();
    const data_token = JSON.parse(localStorage.getItem('data_token') || '{}');
    if (data_token !== {} && data_token !== null) {
      const url = this.BASE_WSO2_URL + authWSO2.logoutWso2 + data_token.id_token + authWSO2.post_logout_redirect_uri + this.BASE_LOGOUT_URL;
      window.location.href = url;
      this.tokenService.clear();
    }
    this.tokenService.clear();
    this.tokenExpired = true;
    localStorage.removeItem('data_token');
  }

  async goToKeyCloakLogout() {
    const data_token = JSON.parse(localStorage.getItem('data_token') || '{}');
    if (data_token !== {} && data_token !== null) {
      // call logout
      this.keyCloakApiService.logout(data_token.refresh_token).subscribe(
        (rs) => {
          localStorage.removeItem('data_token');
          this.tokenService.clear();
          window.location.href = environment.KEYCLOAK_LOGOUT;
        },
        (err) => this.modal.error({
          nzTitle: '<i>Lỗi đăng xuất</i>',
          nzContent: '<b>Có lỗi xảy ra vui lòng đăng xuất!</b>',
        })
      );
    }
  }

  toLoginKeyCloak() {
    const url = environment.KEYCLOAK_LOGIN + `?client_id=${environment.KEYCLOAK_CLIENT_ID}`
      + `&redirect_uri=${encodeURIComponent(environment.KEYCLOAK_CALLBACK)}&response_mode=fragment&response_type=code&scope=openid`;
    window.location.href = url;
  }

  private toLogin(): void {
    const url =
      this.BASE_WSO2_URL +
      'oauth2/authorize?response_type=code&client_id=' +
      this.CLIENT_ID +
      '&redirect_uri=' +
      this.BASE_CALLBACK_URL +
      '&scope=openid';
    window.location.href = url;
    // window.location.href =
    //   'https://sandbox-idp.savis.vn/oauth2/authorize?response_type=code&client_id=mrfiG3i6mobSClFujdTws_NQih0a&redirect_uri=http://localhost:30201/confirm&scope=openid';
  }

  gotoLogin(): void {
    this.router.navigateByUrl('');
  }
}
