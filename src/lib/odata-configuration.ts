import { Injectable, Injector } from '@angular/core';
import { Headers, RequestOptions, Response } from '@angular/http';
import { PagedResult } from './operations/odata-query-operation';

export class KeyConfigs {
  public filter = '$filter';
  public top = '$top';
  public skip = '$skip';
  public orderBy = '$orderby';
  public select = '$select';
  public search = '$search';
  public expand = '$expand';
  public levels = '$levels';
}

@Injectable()
export class ODataConfiguration {
  public keys: KeyConfigs = new KeyConfigs();
  public baseUrl = '/odata';  // TODO use property
  public odataVersion = '4.0';
  public authToken = 'dGVzdHVzZXI6R24wa2dmYWxncWI0c3FIaVBP';

  constructor(public injector: Injector) { }

  public getEntityUri(entityKey: string, _typeName: string) {

    // check if string is a GUID (UUID) type
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(entityKey)) {
      return this.baseUrl + '/' + _typeName + '(' + entityKey + ')';
    }

    if (!/^[0-9]*$/.test(entityKey)) {
      return this.baseUrl + '/' + _typeName + '(\'' + entityKey + '\')';
    }

    return this.baseUrl + '/' + _typeName + '(' + entityKey + ')';
  }

  handleError(err: any, caught: any): void {
    console.warn('OData error: ', err, caught);
  };

  get requestOptions(): RequestOptions {
    const headers = new Headers({ 'Authorization': `Basic ${this.authToken}` });
    return new RequestOptions({ body: '', headers: headers});
  };

  get postRequestOptions(): RequestOptions {
    const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
    return new RequestOptions({ headers: headers });
  }

  public extractQueryResultDataWithCount<T>(res: Response): PagedResult<T> {
    const pagedResult = new PagedResult<T>();

    if (res.status < 200 || res.status >= 300) {
      throw new Error('Bad response status: ' + res.status);
    }

    const body = res.json();
    const entities: T[] = body.value;

    pagedResult.data = entities;

    try {
      pagedResult.count = parseInt(body['@odata.count'], 10) || entities.length;
    } catch (error) {
      console.warn('Cannot determine OData entities count. Falling back to collection length...');
      pagedResult.count = entities.length;
    }

    return pagedResult;
  }
}
