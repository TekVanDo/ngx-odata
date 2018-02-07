import { ModuleWithProviders, NgModule } from '@angular/core';
import { ODataConfiguration } from './odata-configuration';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule
  ]
})
export class NgxOdataModule {

  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: NgxOdataModule,
      providers: [
        ODataConfiguration
      ]
    };
  }

}
