import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-btn-create',
  templateUrl: './btn-create.component.html',
  styleUrls: ['./btn-create.component.less'],
})
export class BtnCreateComponent implements OnInit {
  constructor(private _router: Router) {}

  ngOnInit(): void {}
  redirectToAdd() {
    this._router.navigateByUrl('/certify/document-create');
  }
}
