/*
 * http-request-builder
 * Copyright(c) 2014-2015 AlexanderMac <amatsibarov@gmail.com>
 * MIT Licensed
 */

import * as _s from 'underscore.string';

export class InvalidRequestError {

  message: string;
  data: string;

  constructor(message: string, data?: string) {
    this.data = data;
    this.message = message;
  }

  getErrorMessage() {
    if (this.message) {
      this.message = this.data ?
        _s.sprintf('Invalid request object. %s. Data: %s', this.message, this.data) :
        _s.sprintf('Invalid request object. %s', this.message);
    } else {
      this.message = 'Invalid request object.';
    }
  }

}
