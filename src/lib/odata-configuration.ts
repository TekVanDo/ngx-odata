import { Injectable, Injector } from '@angular/core';
import { PagedResult } from './operations/odata-query-operation';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

export class KeyConfigs {
  public filter = '$filter';
  public top = '$top';
  public skip = '$skip';
  public orderBy = '$orderby';
  public select = '$select';
  public search = '$search';
  public expand = '$expand';
  public levels = '$levels';
  public count = '$count';
}

@Injectable()
export class ODataConfiguration {
  public keys: KeyConfigs = new KeyConfigs();
  public baseUrl = '/odata';  // override this parameter in extension class
  public authToken = '';

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
  }

  get requestOptions() {
    const headers = new HttpHeaders({ 'Authorization': `Basic ${this.authToken}` });
    return {  headers: headers, observe: 'response' as 'response', responseType: 'json'  as 'json'};
  }

  get postRequestOptions() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return { headers: headers, observe: 'response' as 'response' };
  }

  public extractQueryResultDataWithCount<T>(res: HttpResponse<Object>): PagedResult<T> {
    const pagedResult = new PagedResult<T>();

    if (res.status < 200 || res.status >= 300) {
      throw new Error('Bad response status: ' + res.status);
    }

    const body = <any>res.body;
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
