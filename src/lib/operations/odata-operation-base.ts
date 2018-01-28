import { FilterOperation } from './odata-filter-operation';
import { Observable } from 'rxjs/Observable';
import { ODataConfiguration } from '../odata-configuration';
import { URLSearchParams } from '@angular/http';

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

  abstract exec(...args): Observable<any>;
  abstract execBlob(...args): Observable<any>;

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

  protected getParams(): URLSearchParams {
    const params = new URLSearchParams();
    if (this._select && this._select.length > 0) {
      params.set(this.config.keys.select, this._select);
    }
    if (this._filter) {
      params.set(this.config.keys.filter, this._filter.build());
    }
    if (this._search) {
      params.set(this.config.keys.search, `"${this._search}"`);
    }
    if (this._top) {
      params.set(this.config.keys.top, this._top.toString());
    }
    if (this._skip) {
      params.set(this.config.keys.skip, this._skip.toString());
    }
    if (this._orderBy) {
      params.set(this.config.keys.orderBy, this._orderBy);
    }
    if (this._customParams) {
      this._customParams.forEach((one) => {
        params.set(one.key, one.value);
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
