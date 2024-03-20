import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SvConfigItemComponent } from './config-item/sv-config-item.component';

import { AngularDraggableModule } from 'angular2-draggable';

import { registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

@NgModule({
  declarations: [SvConfigItemComponent],
  imports: [
    CommonModule,
    AngularDraggableModule,
    NzSliderModule,
    NzDividerModule,
    NzSwitchModule,
    NzSelectModule,
    NzModalModule,
    NzFormModule,
    FormsModule,
    HttpClientModule,
    NzIconModule,
    CommonModule,
  ],

  exports: [SvConfigItemComponent, AngularDraggableModule],
})
export class DocumentMetaDataConfigModule {}
