import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { ODataConfiguration } from './odata-configuration';
import { ODataQuery } from './operations/odata-query-operation';

export class ODataService<T> {
  constructor(public typeName: string, public http: Http, public config: ODataConfiguration) {
  }

  public get TypeName() {
    return this.typeName;
  }

  public resetTypeName(newTypeName) {
    this.typeName = newTypeName;
    return this;
  }

  public Query(): ODataQuery<T> {
    return new ODataQuery<T>(this);
  }

  public Post(): ODataQuery<T> {
    return new ODataQuery<T>(this);
  }

  public CustomAction(key: string, actionName: string, postdata: any): Observable<any> {
    const body = JSON.stringify(postdata);
    return this.http.post(this.getEntityUri(key) + '/' + actionName, body, this.config.requestOptions).map(resp => resp.json());
  }

  public CustomFunction(key: string, actionName: string): Observable<any> {
    return this.http.get(this.getEntityUri(key) + '/' + actionName, this.config.requestOptions).map(resp => resp.json());
  }

  public Patch(entity: any, key: string): Observable<Response> {
    const body = JSON.stringify(entity);
    return this.http.patch(this.getEntityUri(key), body, this.config.postRequestOptions);
  }

  public Put(): ODataQuery<T> {
    return new ODataQuery<T>(this);
  }

  public Delete(key: string): Observable<Response> {
    return this.http.delete(this.getEntityUri(key), this.config.requestOptions);
  }

  protected getEntityUri(entityKey: string): string {
    return this.config.getEntityUri(entityKey, this.typeName);
  }

  protected handleResponse(entity: Observable<Response>): Observable<T> {
    return entity.map(this.extractData)
      .catch((err: any, caught: Observable<T>) => {
        if (this.config.handleError) {
          this.config.handleError(err, caught);
        }
        return Observable.throw(err);
      });
  }

  private extractData(res: Response): T {
    if (res.status < 200 || res.status >= 300) {
      throw new Error('Bad response status: ' + res.status);
    }
    const body: any = res.json();
    const entity: T = body;
    return entity || null;
  }

  public runQuerySequence(observables: Observable<any> []): Promise<any> {
    return new Promise((resolve, reject ) => {
      this.runSequenceRecursive(observables, [], resolve, reject);
    });
  }

  private runSequenceRecursive(observables: Observable<any> [], results: any [], resolve: Function, reject: Function) {
    const shift = observables.shift();
    if (shift) {
      const sub = shift.subscribe(res => {
          results.push(res);
          this.runSequenceRecursive(observables, results, resolve, reject);
        },
        err => {
          reject(err);
        });
    } else {
      resolve(results);
    }
  }

}
