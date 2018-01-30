import { ModuleWithProviders, NgModule } from '@angular/core';
import { ODataConfiguration } from './odata-configuration';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule
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
