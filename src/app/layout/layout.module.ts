import { LayoutModule as CDKLayoutModule } from '@angular/cdk/layout';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { PRO_COMPONENTS, PRO_ENTRYCOMPONENTS } from './pro/index';

// passport
import { LayoutPassportComponent } from './passport/passport.component';
import { BtnCreateComponent } from './pro/components/btn-create/btn-create.component';
const PASSPORT = [LayoutPassportComponent];

@NgModule({
  imports: [SharedModule, CDKLayoutModule],
  entryComponents: PRO_ENTRYCOMPONENTS,
  declarations: [...PRO_COMPONENTS, ...PASSPORT, BtnCreateComponent],
  exports: [...PRO_COMPONENTS, ...PASSPORT],
})
export class LayoutModule {}
