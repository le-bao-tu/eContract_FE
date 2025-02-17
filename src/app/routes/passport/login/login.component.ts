import { Component, Inject, OnDestroy, Optional } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StartupService } from '@core';
import { ReuseTabService } from '@delon/abc/reuse-tab';
import { ACLService } from '@delon/acl';
import { DA_SERVICE_TOKEN, ITokenService, SocialOpenType, SocialService } from '@delon/auth';
import { SettingsService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { AuthenticationApiService, UserRoleService } from '@service';
import { ROLE_SYS_ADMIN } from '@util';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'passport-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  providers: [SocialService],
})
export class UserLoginComponent implements OnDestroy {
  constructor(
    fb: FormBuilder,
    private router: Router,
    private userRoleService: UserRoleService,
    private settingsService: SettingsService,
    private socialService: SocialService,
    @Optional()
    @Inject(ReuseTabService)
    private reuseTabService: ReuseTabService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private startupSrv: StartupService,
    public http: _HttpClient,
    public msg: NzMessageService,
    public authenticationApiService: AuthenticationApiService,
    private aclService: ACLService,
  ) {
    this.form = fb.group({
      userName: [null, [Validators.required]],
      password: [null, [Validators.required]],
      captcha: [null, [Validators.required]],
      remember: [true],
    });
  }

  // #region fields

  get userName(): AbstractControl {
    return this.form.controls.userName;
  }
  get password(): AbstractControl {
    return this.form.controls.password;
  }
  get remember(): AbstractControl {
    return this.form.controls.remember;
  }
  get mobile(): AbstractControl {
    return this.form.controls.mobile;
  }
  get captcha(): AbstractControl {
    return this.form.controls.captcha;
  }
  form: FormGroup;
  error = '';
  type = 0;
  isLoading = false;
  // #region get captcha

  count = 0;
  interval$: any;

  // #endregion

  showPassword = false;
  typePassword = 'password';
  switchShowPass = () => {
    this.showPassword = !this.showPassword;
    if (!this.showPassword) {
      this.typePassword = 'password';
    } else {
      this.typePassword = 'text';
    }
  };

  switch({ index }: { index: number }): void {
    this.type = index;
  }

  getCaptcha(): void {
    if (this.mobile.invalid) {
      this.mobile.markAsDirty({ onlySelf: true });
      this.mobile.updateValueAndValidity({ onlySelf: true });
      return;
    }
    this.count = 59;
    this.interval$ = setInterval(() => {
      this.count -= 1;
      if (this.count <= 0) {
        clearInterval(this.interval$);
      }
    }, 1000);
  }

  // #endregion
  async getUserRoleByUserId(id: string): Promise<any> {
    const res = await this.userRoleService.getById(id).toPromise();
    if (res.code !== 200) {
      return;
    }
    return res.data;
  }
  submit = () => {
    this.isLoading = true;
    this.error = '';
    if (this.type === 0) {
      this.userName.markAsDirty();
      this.userName.updateValueAndValidity();
      this.password.markAsDirty();
      this.password.updateValueAndValidity();
      if (this.userName.invalid || this.password.invalid) {
        this.isLoading = false;
        return;
      }
    } else {
      this.mobile.markAsDirty();
      this.mobile.updateValueAndValidity();
      this.captcha.markAsDirty();
      this.captcha.updateValueAndValidity();
      if (this.mobile.invalid || this.captcha.invalid) {
        this.isLoading = false;
        return;
      }
    }

    this.authenticationApiService
      .login({
        username: this.userName.value,
        password: this.password.value,
        rememberMe: this.remember.value,
      })
      .subscribe(
        async (res: any) => {
          this.isLoading = false;
          // console.log(res);

          if (res.code !== 200) {
            this.error = res.message;
            return;
          }
          if (res.data === null || res.data === undefined) {
            this.error = res.message;
            return;
          }
          if (res.data.userModel === null) {
            this.error = res.message;
            return;
          }

          // Clear route reuse information
          this.reuseTabService.clear();

          const tokenModel = {
            id: res.data.userId,
            token: res.data.tokenString,
            timeExpride: res.data.timeExpride,
            time: res.data.timeExpride,
            email: res.data.userModel?.email,
            name: res.data.userModel?.name,
            userName: res.data.userModel?.userName,
            isOrgAdmin: res.data.userModel?.isOrgAdmin,
            isSystemAdmin: res.data.userModel?.isSystemAdmin,
            isUser: res.data.userModel?.isUser,
            organizationId: res.data.userModel?.organizationId,
            appId: res.data.applicationId,
            rights: res.data.listRight,
            roles: res.data.listRole,
          };
          this.tokenService.set(tokenModel);

          const userRole = await this.getUserRoleByUserId(res.data.userId);
          if (userRole) {
            tokenModel.isUser = userRole.isUser;
            tokenModel.isSystemAdmin = userRole.isSystemAdmin;
            tokenModel.isOrgAdmin = userRole.isOrgAdmin;
          } else {
            tokenModel.isUser = false;
            tokenModel.isSystemAdmin = false;
            tokenModel.isOrgAdmin = false;
          }

          // Set user token information
          this.tokenService.set(tokenModel);

          //#region ACL Service
          if (tokenModel.isSystemAdmin) {
            this.aclService.setFull(true);
          }
          this.aclService.add({ role: res.data.listRole, ability: res.data.listRight });
          // console.log(this.aclService.data);
          // console.log('TRUY_CAP_HE_THONG: ' + this.aclService.canAbility('TRUY_CAP_HE_THONG'));
          // console.log('SYS_ADMIN: ' + this.aclService.can('SYS_ADMIN'));
          //#endregion

          this.settingsService.setUser({
            name: res.data.userModel?.name,
            avatar: './assets/tmp/img/user.png',
            email: res.data.userModel?.email,
          });

          // Retrieving StartupService content,
          // we always believe that application information will generally be affected by the scope of the current user authorization
          this.startupSrv.load().then(() => {
            let url = this.tokenService.referrer?.url || '/home';
            if (url.includes('/passport')) {
              url = '/home';
            }
            this.router.navigateByUrl(url);
          });
        },
        (error: any) => {
          this.isLoading = false;
          this.error = 'Sai tên đăng nhập hoặc mật khẩu';
        },
      );
  };

  ngOnDestroy(): void {
    if (this.interval$) {
      clearInterval(this.interval$);
    }
  }
}
