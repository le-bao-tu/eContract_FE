import { Component, ElementRef, Inject, OnInit, Renderer2 } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TitleService, VERSION as VERSION_ALAIN } from '@delon/theme';
import { NzConfigService } from 'ng-zorro-antd/core/config';
import { NzModalService } from 'ng-zorro-antd/modal';
import { VERSION as VERSION_ZORRO } from 'ng-zorro-antd/version';
import { filter } from 'rxjs/operators';

import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { environment } from '@env/environment';
import { KeyCloakApiService, Wso2Service } from '@service';
import 'ag-grid-enterprise';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-root',
  template: `
    <app-loader></app-loader>
    <app-messages></app-messages>
    <div style="height: 100%;">
      <router-outlet></router-outlet>
    </div>
  `,
})
export class AppComponent implements OnInit {
  constructor(
    el: ElementRef,
    renderer: Renderer2,
    private router: Router,
    private titleSrv: TitleService,
    private wso2ApiService: Wso2Service,
    private notification: NzNotificationService,
    private keycloakApiService: KeyCloakApiService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private modalSrv: NzModalService,
    private nzConfigService: NzConfigService,
  ) {
    renderer.setAttribute(el.nativeElement, 'ng-alain-version', VERSION_ALAIN.full);
    renderer.setAttribute(el.nativeElement, 'ng-zorro-version', VERSION_ZORRO.full);
    renderer.setAttribute(el.nativeElement, 'github', 'https://github.com/duchaindh94');
    renderer.setAttribute(el.nativeElement, 'a' + 'u' + 't' + 'h' + 'o' + 'r', 'o' + 'r' + 'i' + 'o' + 'n' + '1' + '0' + '5' + '9' + '4');
    (window as any).pdfWorkerSrc = '/assets/lib/pdf.worker.js';
  }

  ngOnInit(): void {
    if (environment.AUTH_TYPE === 'keycloak') {
      setInterval(() => {
        const dataToken = JSON.parse(localStorage.getItem('data_token') || '{}');
        this.keycloakApiService.refreshToken(dataToken.refresh_token).subscribe(
          (res) => {
            const data = res.data;
            if (data !== null && data !== undefined) {
              if (data.access_token) {
                dataToken.access_token = data.access_token;
                dataToken.refresh_token = data.refresh_token;

                localStorage.setItem('data_token', JSON.stringify(dataToken));
                const _token = JSON.parse(localStorage.getItem('_token') || '{}');
                _token.token = data.access_token;
                this.tokenService.set(_token);
              }
            }
          },
          (err) => {
            this.notification.error(`Không thể refresh token`, `${err.message}`);
          }
        )
      }, 600000);
    }
    if (environment.AUTH_TYPE === 'wso2') {
      setInterval(() => {
        const data_token = JSON.parse(localStorage.getItem('data_token') || '{}');
        this.wso2ApiService.getRefreshToken(data_token.refresh_token).subscribe(
          (res) => {
            const data = res.data;
            if (data !== null && data !== undefined) {
              if (data.access_token) {
                data_token.access_token = data.access_token;
                data_token.expires_in = data.expires_in;
                data_token.expires_time = data.expires_time;
                data_token.id_token = data.id_token;
                data_token.refresh_token = data.refresh_token;
                data_token.start_time = data.start_time;
                data_token.token_type = data.token_type;
                localStorage.setItem('data_token', JSON.stringify(data_token));
                const _token = JSON.parse(localStorage.getItem('_token') || '{}');
                _token.token = data.access_token;
                this.tokenService.set(_token);
              }
            }
          },
          (err) => {
            this.notification.error(`Không thể refresh token`, `${err.message}`);
          },
        );
      }, 600000);
    }
    this.router.events.pipe(filter((evt) => evt instanceof NavigationEnd)).subscribe(() => {
      this.titleSrv.setTitle();
      this.modalSrv.closeAll();
    });
    this.nzConfigService.set('notification', { nzPlacement: 'topRight', nzPauseOnHover: true, nzDuration: 3000 });
    this.nzConfigService.set('message', { nzPauseOnHover: true, nzDuration: 3000, nzMaxStack: 5, nzTop: 24 });
  }
}
