import { ODataOperationBase } from './odata-operation-base';
import { Observable } from 'rxjs/Observable';
import { Buildable } from './buildable';
import { ODataConfiguration } from '../odata-configuration';
import * as _ from 'lodash';

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
      if (Object.keys(params).length > 0) {
        const paramsArr = [];
        _.toPairs(params).forEach((pair: any[]) => paramsArr.push(`${pair[0]}=${pair[1]}`));
        return `${this._resource}(${paramsArr.join(';')})`;
      } else {
        return `${this._resource}`;
      }
    } else {
      return this._expand;
    }
  }

  protected getParams(): { [param: string]: string } {
    const params = super.getParams();
    if (this._levels) {
      params[this.config.keys.levels] = this._levels;
    }
    return params;
  }

  exec(postResponseProcessor?: (any) => any): Observable<any> {
    return undefined;
  }


  execBlob(postResponseProcessor?: (any) => any): Observable<any> {
    return undefined;
  }
}
