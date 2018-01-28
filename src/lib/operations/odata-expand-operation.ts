import { ODataOperationBase } from './odata-operation-base';
import { Observable } from 'rxjs/Observable';
import { Buildable } from './buildable';
import { ODataConfiguration } from '../odata-configuration';
import { URLSearchParams } from '@angular/http';

export class ExpandOperation extends ODataOperationBase<any> implements Buildable {
  _buildable = true;
  protected _resource: string;
  protected _expand: string;


  constructor(config: ODataConfiguration) {
    super(config);
  }

  public customExpression(expression: string) {
    this._expand = expression;
    this._buildable = false;
  }

  public resource(resource: string): ExpandOperation {
    this._resource = resource;
    return this;
  }

  build(): string {
    if (this._buildable) {
      const params = this.getParams();
      if (params.paramsMap.size > 0) {
        const paramsArr = [];
        params.paramsMap.forEach((v, k) => paramsArr.push(`${k}=${v}`));
        return `${this._resource}(${paramsArr.join(';')})`;
      } else {
        return `${this._resource}`;
      }
    } else {
      return this._expand;
    }
  }

  protected getParams(): URLSearchParams {
    const params = super.getParams();
    if (this._levels) {
      params.set(this.config.keys.levels, this._levels);
    }
    return params;
  }

  exec(): Observable<any> {
    return undefined;
  }


  execBlob(...args): Observable<any> {
    return undefined;
  }
}
