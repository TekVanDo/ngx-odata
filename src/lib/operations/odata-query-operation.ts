import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import { ODataConfiguration } from '../odata-configuration';
import { ODataOperation } from './odata-operation';
import { ODataService } from '../odata-service';
import { ExpandOperation } from './odata-expand-operation';
import * as utils from '../utils/utils';
import { DomSanitizer } from '@angular/platform-browser';
import { BatchBuilder } from '../utils/batch/batch-builder';
import { HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';

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
  protected supportQueryCount = false;

  constructor(protected serviceInContext: ODataService<T>) {
    super(serviceInContext.typeName, serviceInContext.config, serviceInContext.http);
  }

  public get(key: any = null, params?: any, paramsTypes?: any) {
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

  public expand(...expandFns: ((e: ExpandOperation) => void)[]): ODataQuery<T> {
    const expands = [];
    for (const modifyExpand of expandFns) {
      const expandOperation: ExpandOperation = new ExpandOperation(this.config);
      modifyExpand(expandOperation);
      expands.push(expandOperation.build());
    }
    this._expand = expands.join(',');
    return <ODataQuery<T>>this;
  }

  public queryCount(support: boolean): ODataQuery<T> {
    this.supportQueryCount = support;
    return <ODataQuery<T>>this;
  }

  public nextResource(type): ODataQuery<any> {
    this.serviceInContext = this.config.injector.get(type);
    this._typeName = this.serviceInContext.typeName;
    return <ODataQuery<T>>this;
  }

  public property(prop): ODataQuery<any> {
    this.resourceSegments.push(prop);
    return <ODataQuery<T>>this;
  }

  public batch(batchBuilder: BatchBuilder): ODataQuery<any> {
    this.resourceSegments.push('$batch');
    this.body = batchBuilder.build();
    this.boundary = `batch_${batchBuilder.uuid}`;
    return <ODataQuery<T>>this;
  }

  public setBody(newBody): ODataQuery<T> {
    this.body = newBody;
    return <ODataQuery<T>>this;
  }

  public exec(postResponseProcessor?: (any) => any): Observable<any> {
    const requestData = this.prepareExecGet();
    return this.http.get(this.buildResourceURL(), requestData.options)
      .map((res: HttpResponse<Object>) => {
        const data = this.extractData(res);
        return postResponseProcessor ? postResponseProcessor(data) : data;
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

  public execPut(): Observable<any> {
    const data = this.prepareExecPost();
    return this.request(data, 'put');
  }

  public execPatch(): Observable<any> {
    const data = this.prepareExecPost();
    return this.request(data, 'patch');
  }

  public execBlob(postResponseProcessor?: (any) => any): Observable<any> {
    const options = {
      headers: new HttpHeaders({ 'Authorization': `Basic ${this.config.authToken}` }),
      params: new HttpParams({ fromObject: this.getQueryParams() }),
      observe: 'response' as 'response',
      responseType: 'blob' as 'blob'
    };
    return <Observable<HttpResponse<Blob>>>this.http.get(this.buildResourceURL(), options)
      .map((res: HttpResponse<Blob>) => {
        const url = window.URL.createObjectURL(res.body);
        const sanitizer = this.config.injector.get(DomSanitizer);
        return sanitizer.bypassSecurityTrustUrl(url);
      })
      .catch((err: any, caught: Observable<any>) => {
        if (this.config.handleError) {
          this.config.handleError(err, caught);
        }
        return Observable.throw(err);
      });
  }

  public getQueryString() {
    return `${this.buildResourceURL()}?${this.getQueryParams().toString()}`;
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

  protected getQueryParams(): { [param: string]: string } {
    const params = super.getParams();
    if (this._expand && this._expand.length > 0) {
      params[this.config.keys.expand] = this._expand;
    }
    if (this.supportQueryCount) {
      params[this.config.keys.count] = '' + this.supportQueryCount;
    }
    return params;
  }

  protected extractData(res: HttpResponse<Object>): any {
    console.log('Response', res);
    if (res.status < 200 || res.status >= 300) {
      throw new Error('Bad response status: ' + res.status);
    }

    if (res.status === 204) {
      return '';
    }

    const contentType = res.headers.get('Content-Type');
    if (contentType.indexOf('application/json') >= 0) {
      return res.body;
    } else if (contentType.indexOf('multipart/mixed') >= 0) {
      return res.body;
    } else {
      throw Error('Unknown Content-Type');
    }
  }

  private prepareExecGet() {
    const config = this.config;
    const headers = new HttpHeaders({ 'Authorization': `Basic ${config.authToken}` });
    const options = {
      headers: headers,
      observe: 'response' as 'response',
      params: new HttpParams({ fromObject: this.getQueryParams() })
    };
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

    const options = {
      headers: new HttpHeaders(headersObj),
      observe: 'response' as 'response',
    };
    return { config, options };
  }

  private request(data, method = 'post'): Observable<any> {
    return this.http[method](this.buildResourceURL(), this.body, data.options)
      .map(res => {
        return this.extractData(res);
      })
      .catch((err: any, caught: Observable<Array<T>>) => {
        if (this.config.handleError) {
          this.config.handleError(err, caught);
        }
        return Observable.throw(err);
      });
  }

}
