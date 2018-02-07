import { Injectable } from '@angular/core';
import { ODataService } from '../../lib/odata-service';
import { People } from '../model/people';
import { ODataConfiguration } from '../../lib/odata-configuration';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class PeopleService extends ODataService<People> {
  constructor(http: HttpClient, config: ODataConfiguration) {
    super('People', http, config);
  }
}
