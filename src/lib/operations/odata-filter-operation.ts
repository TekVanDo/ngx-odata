import { Buildable } from './buildable';
import * as utils from '../utils/utils';

export class FilterOperation implements Buildable {

  protected expressions: string[] = [];
  _buildable: boolean;

  constructor(protected _filter?: string) {
    this._buildable = !_filter;
  }

  public eq(type: string, value: any) {
    this.expressions.push(`${type} eq ${utils.wrapValue(value)}`);
    return this;
  }

  public ne(type: string, value: any) {
    this.expressions.push(`${type} ne ${utils.wrapValue(value)}`);
    return this;
  }

  public gt(type: string, value: any) {
    this.expressions.push(`${type} gt ${utils.wrapValue(value)}`);
    return this;
  }

  public lt(type: string, value: any) {
    this.expressions.push(`${type} lt ${utils.wrapValue(value)}`);
    return this;
  }

  public ge(type: string, value: any) {
    this.expressions.push(`${type} ge ${utils.wrapValue(value)}`);
    return this;
  }

  public le(type: string, value: any) {
    this.expressions.push(`${type} le ${utils.wrapValue(value)}`);
    return this;
  }

  public and() {
    this.expressions.push(' and ');
    return this;
  }

  public or() {
    this.expressions.push(' or ');
    return this;
  }

  public not() {
    this.expressions.push(' not ');
    return this;
  }

  public openParenthesis() {
    this.expressions.push(' ( ');
    return this;
  }

  public closeParenthesis() {
    this.expressions.push(' ) ');
    return this;
  }

  public customFunction(fn: string) {
    // paramsString = Object.keys(params).ma((last, key) => last += , '');
    this.expressions.push(`${fn}`);
    return this;
  }

  public build(): string {
    if (this._buildable) {
      return this.expressions.join('');
    } else {
      return this._filter;
    }
  }

}
