import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Injector, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { SettingsService } from '@delon/theme';
import { environment } from '@env/environment';
import { KeyCloakApiService, UserApiService } from '@service';
import { authWSO2, cleanForm, wso2Url } from '@util';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'layout-pro-user',
  templateUrl: 'user.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutProWidgetUserComponent implements OnInit {
  @Input() homePageCheck = false;
  @Output() logOut = new EventEmitter<any>();
  constructor(
    private injector: Injector,
    public settings: SettingsService,
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private userService: UserApiService,
    private router: Router,
    private keyCloakApiService: KeyCloakApiService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
  ) {
    this.form = fb.group({
      oldPassword: [null, [Validators.required]],
      newPassword: [null, [Validators.required]],
      confirmPassword: [null, [Validators.required]],
    });

    this.formConfigPIN = fb.group({
      // userPassword: [null, [Validators.required]],
      userPIN: [null],
      confirmUserPIN: [null],
    });
  }
  token: any;
  passwordVisible = false;
  password?: string;
  newPasswordVisible = false;
  newPassword?: string;
  confirmPasswordVisible = false;
  confirmPassword?: string;
  isVisible = false;
  form: FormGroup;
  formConfigPIN: FormGroup;

  isVisibleConfigPIN = false;

  isApproveAutoSign = false;
  isNotRequirePINToSign = false;
  isReceiveSystemNoti = false;
  isReceiveSignFailNoti = false;

  handleCancelModelConfigPIN() {
    this.isVisibleConfigPIN = false;
  }

  saveConfigPIN() {
    // if (this.formConfigPIN.invalid) {
    //   this.messageService.error('Kiểm tra thông tin các trường đã nhập');
    //   return;
    // }

    if (!this.isNotRequirePINToSign) {
      if (!this.formConfigPIN.controls.userPIN.value) {
        this.formConfigPIN.get('userPIN')?.markAsTouched({ onlySelf: true });
        this.formConfigPIN.get('userPIN')?.setErrors({ required: 'Trường thông tin bắt buộc' });
        return;
      }
    }

    const model: any = {
      isApproveAutoSign: this.isApproveAutoSign,
      isNotRequirePINToSign: this.isNotRequirePINToSign,
      isReceiveSystemNoti: this.isReceiveSystemNoti,
      isReceiveSignFailNoti: this.isReceiveSignFailNoti,
    };

    // if (this.formConfigPIN.controls.userPIN.value !== '******') {
    model.userPIN = this.formConfigPIN.controls.userPIN.value;
    // }

    this.userService.updateUserPIN(model).subscribe(
      (res) => {
        if (res.code !== 200) {
          this.messageService.error(`Có lỗi xảy ra: ${res.message}`);
          return;
        }

        this.messageService.success('Cấu hình thành công');
        this.isVisibleConfigPIN = false;
        this.formConfigPIN.reset();
      },
      (err) => console.log('test: ', err),
    );
  }

  checkConfirmUserPIN() {
    if (
      String(this.formConfigPIN.controls.userPIN.value).toLowerCase().trim() !==
      String(this.formConfigPIN.controls.confirmUserPIN.value).toString().toLowerCase().trim()
    ) {
      this.formConfigPIN.controls.confirmUserPIN.setErrors({ invalidConfirmPw: true });
      return;
    }
  }

  showModalConfigPIN() {
    this.formConfigPIN.reset();
    this.isVisibleConfigPIN = true;

    this.getUserInfo();
  }

  resetData(): any {
    this.form.reset();
  }
  login(): any {
    const authType = environment.AUTH_TYPE;
    switch (authType) {
      case 'jwt':
        this.router.navigateByUrl('passport/login');
        break;
      case 'wso2':
        window.location.href = wso2Url;
        break;
      default:
        window.location.href = wso2Url;
        break;
    }
  }
  validToken(): any {
    this.token = this.tokenService.get()?.token;
  }
  ngOnInit(): void {
    this.validToken();
    // mock
    const token = this.tokenService.get() || {
      token: 'nothing',
      name: 'Admin',
      avatar: './assets/logo-color.svg',
      email: 'cipchk@qq.com',
    };
    this.tokenService.set(token);
  }
  showModal(): void {
    this.resetData();
    this.isVisible = true;
  }
  handleCancel(): void {
    this.isVisible = false;
  }

  private goTo(url: string): void {
    setTimeout(() => this.injector.get(Router).navigateByUrl(url));
  }

  async logout() {
    let data_token;
    const authType = environment.AUTH_TYPE;
    switch (authType) {
      case 'keycloak':
        data_token = JSON.parse(localStorage.getItem('data_token') || '{}');
        if (data_token !== {} && data_token !== null) {
          // call api logout
          this.keyCloakApiService.logout(data_token.refresh_token).subscribe(
            (rs) => {
              localStorage.removeItem('data_token');
              this.tokenService.clear();
              window.location.href = environment.KEYCLOAK_LOGOUT;
            },
            (err) => this.messageService.error(err.message),
          );
        }
        break;
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
  checkConfirmPassword(): any {
    if (
      String(this.form.controls.newPassword.value).toLowerCase().trim() !==
      String(this.form.controls.confirmPassword.value).toString().toLowerCase().trim()
    ) {
      this.form.controls.confirmPassword.setErrors({ invalidConfirmPw: true });
      return;
    }
  }
  save(): any {
    cleanForm(this.form);
    // tslint:disable-next-line:forin
    for (const i in this.form.controls) {
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity();
    }
    if (this.form.invalid) {
      this.messageService.error('Kiểm tra thông tin các trường đã nhập');
      return;
    }
    const changePwModel = {
      oldPassword: this.form.controls.oldPassword.value,
      newPassword: this.form.controls.newPassword.value,
      confirmPassword: this.form.controls.confirmPassword.value,
    };
    const userModel = this.tokenService.get();
    const UpdateUserModel = {
      userName: userModel?.userName,
      oldPassword: changePwModel.oldPassword,
      newPassword: changePwModel.newPassword,
    };
    this.userService.changePassword(UpdateUserModel).subscribe(
      (res) => {
        if (res.code !== 200) {
          this.messageService.error(`Có lỗi xảy ra: ${res.message}`);
          return;
        }
        this.isVisible = false;
        this.resetData();
        this.messageService.success('Đổi mật khẩu thành công');
      },
      (err) => {
        console.log(err);
        this.messageService.error(`Có lỗi xảy ra: ${err.error.message}`);
      },
    );
  }

  getUserInfo(): any {
    const tokenStr = localStorage.getItem('_token');
    if (tokenStr) {
      const tokenInfo: any = JSON.parse(tokenStr);
      this.userService.getById(tokenInfo.userId).subscribe(
        (res) => {
          if (res.data) {
            if (res.data) {
              this.isApproveAutoSign = res.data.isApproveAutoSign;
              this.isNotRequirePINToSign = res.data.isNotRequirePINToSign;
              this.isReceiveSystemNoti = res.data.isReceiveSystemNoti;
              this.isReceiveSignFailNoti = res.data.isReceiveSignFailNoti;
              if (res.data.userPIN) {
                this.formConfigPIN.get('userPIN')?.setValue('******');
                this.formConfigPIN.get('confirmUserPIN')?.setValue('******');
              }
            }
          }
        },
        (err) => {},
      );
    }
  }
}
