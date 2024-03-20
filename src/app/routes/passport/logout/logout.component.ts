import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModel } from '@model';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.less'],
})
export class LogoutComponent implements OnInit {
  constructor(private router: Router) {
    router.navigateByUrl('');
    this.btnLogin = {
      title: 'Quay lại đăng nhập',
      titlei18n: '',
      visible: true,
      enable: true,
      grandAccess: true,
      click: ($event: any) => {
        router.navigateByUrl('');
      },
    };
  }
  btnLogin: ButtonModel;
  ngOnInit(): void {}
}
