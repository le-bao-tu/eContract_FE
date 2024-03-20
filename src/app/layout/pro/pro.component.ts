import { BreakpointObserver, MediaMatcher } from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { NavigationEnd, NavigationError, RouteConfigLoadStart, Router } from '@angular/router';
import { ReuseTabService } from '@delon/abc/reuse-tab';
import { ACLService } from '@delon/acl';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { MenuService, ScrollService, TitleService } from '@delon/theme';
import { ArrayService, updateHostClass } from '@delon/util';
import { environment } from '@env/environment';
import { CommunicationService, OrganizationApiService, UserRoleService, UserService } from '@service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BrandService } from './pro.service';
import { ProSettingDrawerComponent } from './setting-drawer/setting-drawer.component';

@Component({
  selector: 'layout-pro',
  templateUrl: './pro.component.html',
  // NOTICE: If all pages using OnPush mode, you can turn it on and all `cdr.detectChanges()` codes
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutProComponent implements OnInit, AfterViewInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  private queryCls?: string;
  @ViewChild('settingHost', { read: ViewContainerRef, static: false }) private settingHost!: ViewContainerRef;

  isFetching = false;
  orgInfo: any;
  logoBase64: any;
  headerName: any;

  get isMobile(): boolean {
    return this.pro.isMobile;
  }

  get getLayoutStyle(): { [key: string]: string } | null {
    const { isMobile, fixSiderbar, collapsed, menu, width, widthInCollapsed } = this.pro;
    if (fixSiderbar && menu !== 'top' && !isMobile) {
      return {
        paddingLeft: (collapsed ? widthInCollapsed : width) + 'px',
      };
    }
    return null;
  }

  get getContentStyle(): { [key: string]: string } {
    const { fixedHeader, headerHeight } = this.pro;
    return {
      margin: '24px 24px 0',
      'padding-top': (fixedHeader ? headerHeight : 0) + 'px',
    };
  }

  private get body(): HTMLElement {
    return this.doc.body;
  }

  subscription: Subscription | undefined;

  constructor(
    bm: BreakpointObserver,
    mediaMatcher: MediaMatcher,
    router: Router,
    msg: NzMessageService,
    scroll: ScrollService,
    reuseTabSrv: ReuseTabService,
    private resolver: ComponentFactoryResolver,
    private renderer: Renderer2,
    public pro: BrandService,
    private organizationApiService: OrganizationApiService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private cdRef: ChangeDetectorRef,
    private titleService: TitleService,
    @Inject(DOCUMENT) private doc: any,
    private routerTemp: Router,
    private menuSrv: MenuService,
    private cdr: ChangeDetectorRef,
    private aclService: ACLService,
    private arrayService: ArrayService,
    private userService: UserService,
    private com: CommunicationService
  ) {
    // scroll to top in change page
    router.events.pipe(takeUntil(this.unsubscribe$)).subscribe((evt) => {
      if (!this.isFetching && evt instanceof RouteConfigLoadStart) {
        this.isFetching = true;
        scroll.scrollToTop();
      }
      if (evt instanceof NavigationError) {
        this.isFetching = false;
        msg.error(`Unable to load ${evt.url} routing`, { nzDuration: 1000 * 3 });
        return;
      }
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      this.isFetching = false;
      // If have already cached router, should be don't need scroll to top
      if (!reuseTabSrv.exists(evt.url)) {
        scroll.scrollToTop();
      }
    });

    // media
    const query: { [key: string]: string } = {
      'screen-xs': '(max-width: 575px)',
      'screen-sm': '(min-width: 576px) and (max-width: 767px)',
      'screen-md': '(min-width: 768px) and (max-width: 991px)',
      'screen-lg': '(min-width: 992px) and (max-width: 1199px)',
      'screen-xl': '(min-width: 1200px)',
    };
    bm.observe([
      '(min-width: 1200px)',
      '(min-width: 992px) and (max-width: 1199px)',
      '(min-width: 768px) and (max-width: 991px)',
      '(min-width: 576px) and (max-width: 767px)',
      '(max-width: 575px)',
    ]).subscribe(() => {
      this.queryCls = Object.keys(query).find((key) => mediaMatcher.matchMedia(query[key]).matches);
      this.setClass();
    });
  }

  private setClass(): void {
    const { body, renderer, queryCls, pro } = this;
    updateHostClass(body, renderer, {
      ['color-weak']: pro.layout.colorWeak,
      [`layout-fixed`]: pro.layout.fixed,
      [`aside-collapsed`]: pro.collapsed,
      ['alain-pro']: true,
      [queryCls!]: true,
      [`alain-pro__content-${pro.layout.contentWidth}`]: true,
      [`alain-pro__fixed`]: pro.layout.fixedHeader,
      [`alain-pro__wide`]: pro.isFixed,
      [`alain-pro__dark`]: pro.theme === 'dark',
      [`alain-pro__light`]: pro.theme === 'light',
      [`alain-pro__menu-side`]: pro.isSideMenu,
      [`alain-pro__menu-top`]: pro.isTopMenu,
    });
  }

  ngAfterViewInit(): void {
    // Setting componet for only developer
    if (!environment.production) {
      setTimeout(() => {
        const settingFactory = this.resolver.resolveComponentFactory(ProSettingDrawerComponent);
        this.settingHost.createComponent(settingFactory);
      }, 22);
    }
  }

  async ngOnInit(): Promise<any> {
    const { pro, unsubscribe$ } = this;
    pro.notify.pipe(takeUntil(unsubscribe$)).subscribe(() => {
      this.setClass();
    });

    this.subscription = this.com.currentMessage.subscribe(message => {
      if (message === "RightChanged") this.getUserPermission();
    });

    await this.getUserPermission();
    this.orgInfo = await this.getOrgInfoByCurrentUser();
    this.logoBase64 = this.orgInfo?.logoBase64;
    this.headerName = this.orgInfo?.displayName;
    this.titleService.suffix = this.orgInfo?.orgName;
    this.cdRef.detectChanges();
  }
  ngOnDestroy(): void {
    const { unsubscribe$, body, pro } = this;
    unsubscribe$.next();
    unsubscribe$.complete();
    body.classList.remove(
      `alain-pro__content-${pro.layout.contentWidth}`,
      `alain-pro__fixed`,
      `alain-pro__wide`,
      `alain-pro__dark`,
      `alain-pro__light`,
    );

    if (this.subscription) this.subscription.unsubscribe();
  }

  async getOrgInfoByCurrentUser(): Promise<any> {
    if (!this.tokenService.get()?.token) {
      return;
    }
    const res = await this.organizationApiService.getOrgInfoByCurrentUser().toPromise();
    if (res.code !== 200) {
      return;
    }
    return res.data;
  }

  async getUserPermission(): Promise<any> {
    if (!this.tokenService.get()?.token) {
      return;
    }

    const token = this.tokenService.get();

    const res = await this.userService.getUserPermission().toPromise();
    if (res.code !== 200) {
      return;
    }
    if (res.data) {
      // Nếu tài khoản bị khóa hoặc chưa được phân quyền thì cho về trang confirm
      if (res.data.isLock || res.data.role.length === 0) {
        this.routerTemp.navigate(['confirm']);
      }

      this.aclService.setRole([]);
      this.aclService.setAbility([]);

      const navigation = res.data.navigation;

      // Cập nhật menu
      const menu: any[] = [
        {
          children: [],
          group: true,
          hideInBreadcrumb: true,
          i18n: 'menu.main',
          text: 'Menu',
        },
      ];

      const menuChild: any[] = [];

      navigation.forEach((item: any) => {
        menuChild.push({
          id: item.id,
          parentId: item.parentId,
          text: item.name,
          i18n: item.i18nName,
          icon: item.icon,
          link: item.link,
          acl: item.listRoleCode,
          hideInBreadcrumb: item.hideInBreadcrumb,
        });
      });

      const arrayTreeResult = menuChild.map((item: any, i: number, arr: any[]) => {
        const checkIsLeft = arr.some((c) => c.parentId === item.id);
        return {
          id: item.id,
          parent_id: item.parentId,
          title: item.text,
          text: item.text,
          i18n: item.i18n,
          icon: item.icon,
          link: item.link,
          acl: item.acl,
          hideInBreadcrumb: item.hideInBreadcrumb,
        };
      });

      this.arrayService.arrToTreeNode(arrayTreeResult, {
        cb: (item, parent, deep) => {
          if (deep > 1) {
            const indexOf = arrayTreeResult.indexOf(item);
            arrayTreeResult.splice(indexOf, 1);
          }
        },
      });

      menu[0].children = arrayTreeResult;
      this.menuSrv.add(menu);

      const role = res.data.role;
      const right = res.data.right;

      token!.roles = role;
      token!.rights = right;

      this.aclService.add({ role, ability: right });
      this.tokenService.set(token);
    }

    this.cdr.detectChanges();

    this.menuSrv.resume();

    this.com.changeMessage("PermissionChanged");
    return;
  }
}
