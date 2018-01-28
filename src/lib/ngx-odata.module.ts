import { NgModule } from '@angular/core';
import { ODataConfiguration } from './odata-configuration';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule],
  providers: [ODataConfiguration],
  exports: []
})
export class NgxOdataModule {
  constructor() {
  }
}
