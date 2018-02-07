import { ODataConfiguration } from '../odata-configuration';
import { ODataOperationBase } from './odata-operation-base';
import { HttpClient } from '@angular/common/http';

export abstract class ODataOperation<T> extends ODataOperationBase<T> {

  constructor(protected _typeName: string,
              protected config: ODataConfiguration,
              protected http: HttpClient) {
    super(config);
  }

}
