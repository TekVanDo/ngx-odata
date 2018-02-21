import { FilterOperation } from './odata-filter-operation';
import { Observable } from 'rxjs/Observable';
import { ODataConfiguration } from '../odata-configuration';

export abstract class ODataOperationBase<T> {
  protected _select: string;
  protected _filter: FilterOperation;
  protected _top: number;
  protected _skip: number;
  protected _orderBy: string;
  protected _levels: string;
  protected _search: string;
  protected _customParams: { key: string, value: any }[];

  constructor(protected config: ODataConfiguration) {
  }

  abstract exec(postResponseProcessor?: (any) => any): Observable<any>;
  abstract execBlob(postResponseProcessor?: (any) => any): Observable<any>;

  public select(select: string | string[]) {
    this._select = this.parseStringOrStringArray(select);
    return this;
  }

  public filter(filterFn: (f: FilterOperation) => void): ODataOperationBase<T> {
    const filterOperation: FilterOperation = new FilterOperation();
    filterFn(filterOperation);
    this._filter = filterOperation;
    return this;
  }

  public top(top: number): ODataOperationBase<T> {
    this._top = top;
    return this;
  };

  public skip(skip: number): ODataOperationBase<T> {
    this._skip = skip;
    return this;
  }

  public orderBy<K extends keyof T>(...orderBy: K[]): ODataOperationBase<T> {
    this._orderBy = orderBy.join(',');
    return this;
  }

  public levels(level: string): ODataOperationBase<T> {
    this._levels = level;
    return this;
  }

  public search(expr: string): ODataOperationBase<T> {
    this._search = expr;
    return this;
  }

  public setCustomParams(customParams): ODataOperationBase<T> {
    this._customParams = customParams;
    return this;
  }

  protected getParams(): { [param: string]: string } {
    const params = {};
    if (this._select && this._select.length > 0) {
      params[this.config.keys.select] = this._select;
    }
    if (this._filter) {
      params[this.config.keys.filter] = this._filter.build();
    }
    if (this._search) {
      params[this.config.keys.search] = `"${this._search}"`;
    }
    if (this._top) {
      params[this.config.keys.top] = this._top.toString();
    }
    if (this._skip) {
      params[this.config.keys.skip] = this._skip.toString();
    }
    if (this._orderBy) {
      params[this.config.keys.orderBy] = this._orderBy;
    }
    if (this._customParams) {
      this._customParams.forEach((one) => {
        params[one.key] = one.value;
      });
    }
    return params;
  }

  protected renderResourceToken(type: string, keys?: string | number) {
    if (!keys) {
      return type;
    }
    if (typeof keys === 'number') {
      return `${type}(${keys})`;
    } else {
      return `${type}('${keys}')`;
    }
  }

  protected parseStringOrStringArray(input: string | string[]): string {
    if (input instanceof Array) {
      return input.join(',');
    }
    return input as string;
  }

}
