import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { HomeService } from './../../services/api/home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less'],
})
export class HomeComponent implements OnInit {
  constructor(private _homeService: HomeService, private _router: Router, @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {}

  document: any = {
    completed: 0,
    draft: 0,
    processing: 0,
    waitMeSign: 0,
  };

  ngOnInit(): void {
    this.loadDocument();
  }
  logOut(): void {
    this.document = {
      completed: 0,
      draft: 0,
      processing: 0,
      waitMeSign: 0,
    };
  }
  loadDocument(): any {
    this._homeService.getDocumentByStatus().subscribe((res: any) => (this.document = res.data));
  }
  redirectToAdd(): any {
    this._router.navigateByUrl('/certify/document-create');
  }
  redirectToHome(): any {
    this._router.navigateByUrl('/home');
  }
  redirect(): any {
    this._router.navigate(['/certify/document']);
  }
  redirectToDocumentDraft(): any {
    this._router.navigate(['/certify/document'], {
      queryParams: { status: 0 },
      queryParamsHandling: 'merge',
      preserveFragment: true,
    });
  }
  redirectToDocumentWaitMeSign(): any {
    this._router.navigate(['/certify/document'], {
      queryParams: { status: 1, assignMe: true },
      queryParamsHandling: 'merge',
      preserveFragment: true,
    });
  }
  redirectToDocumentProcessing(): any {
    this._router.navigate(['/certify/document'], {
      queryParams: { status: 1 },
      queryParamsHandling: 'merge',
      preserveFragment: true,
    });
  }
  redirectToDocumentComplete(): any {
    this._router.navigate(['/certify/document'], {
      queryParams: { status: 3 },
      queryParamsHandling: 'merge',
      preserveFragment: true,
    });
  }
}
