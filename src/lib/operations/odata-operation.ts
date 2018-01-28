import { Http } from '@angular/http';
import { ODataConfiguration } from '../odata-configuration';
import { ODataOperationBase } from './odata-operation-base';

export abstract class ODataOperation<T> extends ODataOperationBase<T> {

  constructor(protected _typeName: string,
              protected config: ODataConfiguration,
              protected http: Http) {
    super(config);
  }

}
