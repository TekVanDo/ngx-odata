import { Injectable } from '@angular/core';
import { ODataService } from '../../lib/odata-service';
import { Version } from '../model/version';
import { Http } from '@angular/http';
import { ODataConfiguration } from '../../lib/odata-configuration';

@Injectable()
export class VersionsService extends ODataService<Version> {
  constructor(http: Http, config: ODataConfiguration) {
    super('Versions', http, config);
  }
}
