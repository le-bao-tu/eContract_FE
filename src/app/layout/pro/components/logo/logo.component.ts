import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { SettingsService } from '@delon/theme';
import { OrganizationApiService } from '@service';
import { BrandService } from '../../pro.service';

@Component({
  selector: 'layout-pro-logo',
  templateUrl: './logo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutProLogoComponent implements OnInit {
  checkCollapsed: any;
  @Input() logoBase64: any;
  get name(): string {
    return this.setting.app.name!;
  }
  redirectToDashboard(): any {
    this.router.navigateByUrl('/home');
  }
  constructor(private setting: SettingsService, private pro: BrandService, private cdRef: ChangeDetectorRef, private router: Router) {}
  async ngOnInit(): Promise<any> {
    this.pro.currentCollapse.subscribe((res) => {
      this.changeCollapse(res);
    });
  }
  changeCollapse(data: any): any {
    this.checkCollapsed = data;
    this.cdRef.detectChanges();
  }
}
