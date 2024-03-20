import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CountryComponent } from './country/country/country.component';
import { DistrictComponent } from './district/district/district.component';
import { ProvinceComponent } from './province/province/province.component';
import { UnitComponent } from './unit/unit/unit.component';
import { WardComponent } from './ward/ward/ward.component';
// import { ProvinceComponent } from './Province/Province/Province';
// import { DistrictComponent } from './District/District/District';
const routes: Routes = [
  {
    path: '',
    // component: LayoutProComponent,
    children: [
      { path: '', redirectTo: 'unit', pathMatch: 'full' },
      { path: 'unit', component: UnitComponent },
      { path: 'country', component: CountryComponent},
      { path: 'province', component: ProvinceComponent},
      { path: 'district', component: DistrictComponent},
      { path: 'ward', component: WardComponent}
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResourceRoutingModule {}
