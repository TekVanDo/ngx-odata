import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgxOdataModule } from '../lib';
import { PeopleService } from './odata-services/people.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxOdataModule.forRoot()
  ],
  providers: [PeopleService],
  bootstrap: [AppComponent]
})
export class AppModule { }
