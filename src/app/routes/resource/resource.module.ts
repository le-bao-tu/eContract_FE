import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { AgGridModule } from 'ag-grid-angular';

import { ResourceRoutingModule } from './resource-routing.module';

import { CountryItemComponent } from './country/country-item/country-item.component';
import { CountryComponent } from './country/country/country.component';
import { DistrictItemComponent } from './district/district-item/district-item.component';
// import { ProvinceComponent } from './Province/Province/Province';
// import { ProvinceItemComponent } from './Province/Province-item/Province-item';
// import { DistrictComponent } from './District/District/District';
// import { DistrictItemComponent } from './District/District-item/District-item';
import { DistrictComponent } from './district/district/district.component';
import { ProvinceItemComponent } from './province/province-item/province-item.component';
import { ProvinceComponent } from './province/province/province.component';
import { UnitImportItemComponent } from './unit/unit-import-item/unit-import-item.component';
import { UnitItemComponent } from './unit/unit-item/unit-item.component';
import { UnitComponent } from './unit/unit/unit.component';
import { WardItemComponent } from './ward/ward-item/ward-item.component';
import { WardComponent } from './ward/ward/ward.component';
@NgModule({
  declarations: [UnitComponent, UnitItemComponent, UnitImportItemComponent,
     CountryComponent, CountryItemComponent, ProvinceComponent, ProvinceItemComponent, DistrictComponent, DistrictItemComponent,
     WardComponent, WardItemComponent
    // ,ProvinceComponent,ProvinceItemComponent,DistrictComponent,DistrictItemComponent
  ],
  imports: [SharedModule, ResourceRoutingModule, AgGridModule.withComponents([])],
})
export class ResourceModule {}
