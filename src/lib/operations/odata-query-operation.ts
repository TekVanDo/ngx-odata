import { Headers, RequestOptions, Response, ResponseContentType, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ODataConfiguration } from '../odata-configuration';
import { ODataOperation } from './odata-operation';
import { ODataService } from '../odata-service';
import { ExpandOperation } from './odata-expand-operation';
import * as utils from '../utils/utils';
import { DomSanitizer } from '@angular/platform-browser';
import { BatchBuilder } from '../utils/batch/batch-builder';

export class PagedResult<T> {
  public data: T[];
  public count: number;
}

export class ODataQuery<T> extends ODataOperation<T> {
  protected resourceSegments = [];
  protected _unboundFunction: string;
  protected _expand: string;
  protected body = {};
  protected boundary: string;

  constructor(protected serviceInContext: ODataService<T>) {
    super(serviceInContext.typeName, serviceInContext.config, serviceInContext.http);
  }

  public get (key: any = null, params?: any, paramsTypes?: any) {
    if (params) {
      this.resourceSegments.push(`${this._typeName}(${this.prepareFunctionParams(params, paramsTypes)})`);
    } else {
      this.resourceSegments.push(this.renderResourceToken(this._typeName, key));
    }
    return this;
  }

  public boundFunction(fName: string, params?: any) {
    if (this.resourceSegments.length === 0) {
      return this;
    }
    const prevSegment = this.resourceSegments.pop();
    const paramsData = (typeof params === 'string') ? params : this.prepareFunctionParams(params);
    this.resourceSegments.push(`${prevSegment}/${fName}(${paramsData})`);
    return this;
  }

  public unboundFunction(fName: string, params?: any) {
    this._unboundFunction = `${fName}(${this.prepareFunctionParams(params)})`;
    return this;
  }

  protected prepareFunctionParams(params: object | Array<string | number>, paramsType?: object): string {
    let paramsStr = '';
    if (!params) {
      return paramsStr;
    }
    if (!Array.isArray(params)) {
      const paramTokens = [];
      Object.keys(params).forEach(k => {
        if (params[k] === null) {
          paramTokens.push(`${k}=null`);
        } else if (paramsType) {
          paramTokens.push(`${k}=${utils.wrapValue(params[k], paramsType[k])}`);
        } else {
          paramTokens.push(`${k}=${utils.wrapValue(params[k])}`);
        }
      });
      paramsStr = paramTokens.join(',');
    } else {
      paramsStr = params.map(v => utils.wrapValue(v)).join(',');
    }
    return paramsStr;
  }

  public expand(...expandFns: ((e: ExpandOperation) => void)[]): ODataQuery<T> {
    const expands = [];
    for (const modifyExpand of expandFns) {
      const expandOperation: ExpandOperation = new ExpandOperation(this.config);
      modifyExpand(expandOperation);
      expands.push(expandOperation.build());
    }
    this._expand = expands.join(',');
    return this;
  }

  public nextResource(type): ODataQuery<any> {
    this.serviceInContext = this.config.injector.get(type);
    this._typeName = this.serviceInContext.typeName;
    return this;
  }

  public property(prop): ODataQuery<any> {
    this.resourceSegments.push(prop);
    return this;
  }

  public batch(batchBuilder: BatchBuilder): ODataQuery<any> {
    this.resourceSegments.push('$batch');
    this.body = batchBuilder.build();
    this.boundary = `batch_${batchBuilder.uuid}`;
    return this;
  }

  public setBody(newBody): ODataQuery<T> {
    this.body = newBody;
    return this;
  }

  private prepareExecGet() {
    const config = this.config;
    const headers = new Headers({ 'Authorization': `Basic ${config.authToken}` });
    const options = new RequestOptions({ search: this.getQueryParams(), headers: headers });
    return { config, options };
  }

  private prepareExecPost(customHeaders?: Map<string, string>) {
    const config = this.config;

    const headersObj = { 'Authorization': `Basic ${config.authToken}` };
    if (customHeaders) {
      customHeaders.forEach((v, k) => {
        headersObj[k] = v;
      });
    }

    const options = new RequestOptions({ headers: new Headers(headersObj) });
    return { config, options };
  }

  public exec(): Observable<any> {
    const requestData = this.prepareExecGet();
    return this.http.get(this.buildResourceURL(), requestData.options)
      .map(res => {
        return this.extractData(res, requestData.config);
      })
      .catch((err: any, caught: Observable<Array<T>>) => {
        if (this.config.handleError) {
          this.config.handleError(err, caught);
        }
        return Observable.throw(err);
      });
  }

  public execDelete(): Observable<any> {
    const requestData = this.prepareExecGet();
    return this.http.delete(this.buildResourceURL(), requestData.options)
      .catch((err: any, caught: Observable<any>) => {
        if (this.config.handleError) {
          this.config.handleError(err, caught);
        }
        return Observable.throw(err);
      });
  }

  public execPost(headers?: Map<string, string>): Observable<any> {
    const data = this.prepareExecPost(headers);
    return this.request(data);
  }

  public execPostBatch(): Observable<any> {
    const data = this.prepareExecPost();
    data.options.headers.append('Content-Type', `multipart/mixed;boundary=${this.boundary}`);
    return this.request(data);
  }

  private request(data, method = 'post'): Observable<any> {
    return this.http[method](this.buildResourceURL(), this.body, data.options)
      .map(res => {
        return this.extractData(res, data.config);
      })
      .catch((err: any, caught: Observable<Array<T>>) => {
        if (this.config.handleError) {
          this.config.handleError(err, caught);
        }
        return Observable.throw(err);
      });
  }

  public execPut(): Observable<any> {
    const data = this.prepareExecPost();
    return this.request(data, 'put');
  }

  public execPatch(): Observable<any> {
    const data = this.prepareExecPost();
    return this.request(data, 'patch');
  }

  public execBlob(): Observable<any> {
    const params = this.getQueryParams();
    const headers = new Headers({ 'Authorization': `Basic ${this.config.authToken}` });
    const options = new RequestOptions({ search: params, headers: headers, responseType: ResponseContentType.Blob });
    return this.http.get(this.buildResourceURL(), options)
      .map(res => {
        let url = window.URL.createObjectURL(res.blob());
        const sanitizer = this.config.injector.get(DomSanitizer);
        url = sanitizer.bypassSecurityTrustUrl(url);
        return url;
      })
      .catch((err: any, caught: Observable<any>) => {
        if (this.config.handleError) {
          this.config.handleError(err, caught);
        }
        return Observable.throw(err);
      });
  }

  protected buildResourceURL(): string {
    if (this._unboundFunction) {
      if (this.resourceSegments.length === 0) {
        return this.config.baseUrl + `/${this._unboundFunction}`;
      } else {
        return this.config.baseUrl + `/${this._unboundFunction}/` + this.resourceSegments.join('/');
      }
    } else {
      return this.config.baseUrl + '/' + this.resourceSegments.join('/');
    }
  }

  protected getQueryParams(): URLSearchParams {
    const params = super.getParams();
    if (this._expand && this._expand.length > 0) {
      params.set(this.config.keys.expand, this._expand);
    }
    return params;
  }

  public getQueryString() {
    return `${this.buildResourceURL()}?${this.getQueryParams().toString()}`;
  }

  protected extractData(res: Response, config: ODataConfiguration): any {
    if (res.status < 200 || res.status >= 300) {
      throw new Error('Bad response status: ' + res.status);
    }

    if (res.status === 204) {
      return '';
    }

    const contentType = res.headers.get('Content-Type');
    if (contentType.indexOf('application/json') >= 0) {
      const json = res.json();
      return json && json.value ? json.value : json;
    } else if (contentType.indexOf('multipart/mixed') >= 0) {
      return res.text();
    } else {
      throw Error('Unknown Content-Type');
    }
  }

}
