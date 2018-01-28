import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { NgxOdataModule } from '../lib';
import { VersionsService } from './odata-services/version.service';
import { Http, HttpModule } from '@angular/http';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxOdataModule,
    HttpModule
  ],
  providers: [VersionsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
