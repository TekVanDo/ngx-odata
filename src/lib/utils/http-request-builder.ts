/*
 * http-request-builder
 * Copyright(c) 2014-2015 AlexanderMac <amatsibarov@gmail.com>
 * MIT Licensed
 */

import * as _ from 'lodash';
import * as _s from 'underscore.string';
import * as httpConst from 'http-const';
import { InvalidRequestError } from './request-error';

export class HttpRequestBuilder {

  CRLF = '\r\n';

  mutateUrl = true;

  constructor(mutateUrl: boolean) {
    this.mutateUrl = mutateUrl;
  }

  public build(requestObj) {
    if (!requestObj) {
      throw new InvalidRequestError('requestObj must be not null');
    }

    return '' +
      this._generateStartLine(requestObj.method, requestObj.protocol,
        requestObj.url, requestObj.protocolVersion) +
      // this._generateHostLine(requestObj.url) +
      this._generateHeaders(requestObj.headers) +
      this._generateCookie(requestObj.cookie) +
      this._generateBody(requestObj.body);
  }

  private _generateStartLine(method, protocol, url, protocolVersion) {
    if (!method || !protocol || !url || !protocolVersion) {
      throw new InvalidRequestError('Method, url, protocol and protocolVersion must be not empty');
    }
    if (this.mutateUrl) {
      const newUrl = _s.ltrim(url, '/');
      return _s.sprintf('%s %s://%s %s\r\n', method, protocol.toLowerCase(), newUrl, protocolVersion);
    } else {
      return _s.sprintf('%s %s %s\r\n', method, url, protocolVersion);
    }
  }

  private _generateHostLine(url) {
    const host = this._getHostName(url);
    if (!host) {
      throw new InvalidRequestError('Host is undefined, requestUrl has invalid format');
    }
    return _s.sprintf('HOST: %s\r\n', host);
  }

  private _generateHeaders(headers) {
    if (!headers || !_.isArray(headers) || !headers.length) {
      throw new InvalidRequestError('Headers list must be not empty');
    }

    const headerLines = _.map(headers, function (header) {
      if (!header.name) {
        throw new InvalidRequestError('Header name must be not empty', JSON.stringify(header));
      }

      if (!header.values || !_.isArray(header.values) || !header.values.length) {
        throw new InvalidRequestError('Header values list must be not empty', JSON.stringify(header));
      }

      const hvs = _.map(header.values, function (headerValue: any) {
        let hv = headerValue.value;
        if (!hv) {
          throw new InvalidRequestError('Header value must be not empty', JSON.stringify(header));
        }

        if (headerValue.params) {
          hv += ';' + headerValue.params;
        }
        return hv;
      });

      return header.name + ': ' + hvs.join(', ');
    });

    return headerLines.join(this.CRLF);
  }

  private _generateCookie(cookie) {
    if (!cookie) {
      return '';
    }

    if (!_.isArray(cookie) || !cookie.length) {
      throw new InvalidRequestError('Cookie name-value pairs list must be not empty');
    }

    const nameValuePairs = _.map(cookie, function (nameValuePair) {
      if (!nameValuePair.name || !nameValuePair.value) {
        throw new InvalidRequestError('Cookie name or value must be not empty', JSON.stringify(nameValuePair));
      }

      return nameValuePair.name + '=' + nameValuePair.value;
    });

    return 'Cookie: ' + nameValuePairs.join('; ') + this.CRLF;
  }

  private _generateBody(body) {
    if (!body) {
      return this.CRLF;
    }

    let formDataParams;
    switch (body.contentType) {
      case httpConst.contentTypes.formData:
        if (!body.boundary) {
          throw new InvalidRequestError(
            'Body with ContentType=multipart/form-data must have boundary in ContentType header');
        }

        if (!body.formDataParams || !_.isArray(body.formDataParams) || !body.formDataParams.length) {
          throw new InvalidRequestError('Body with ContentType=multipart/form-data must have parameters');
        }

        formDataParams = _.map(body.formDataParams, function (dataParam: any) {
          if (!dataParam.name || !dataParam.value) {
            throw new InvalidRequestError('FormData parameter must have name and value', JSON.stringify(dataParam));
          }
          return [
            '-----------------------' + body.boundary,
            this.CRLF,
            _s.sprintf('Content-Disposition: form-data; name="%s"', dataParam.name),
            this.CRLF,
            this.CRLF,
            dataParam.value,
            this.CRLF
          ].join('');
        }).join('');

        return _s.sprintf('\r\n\r\n%s-----------------------%s--', formDataParams, body.boundary);

      case httpConst.contentTypes.xWwwFormUrlencoded:
        if (!body.formDataParams || !_.isArray(body.formDataParams) || !body.formDataParams.length) {
          throw new InvalidRequestError('Body with ContentType=application/x-www-form-urlencoded must have parameters');
        }

        formDataParams = _.map(body.formDataParams, function (dataParam: any) {
          if (!dataParam.name || !dataParam.value) {
            throw new InvalidRequestError('FormData parameter must have name and value', JSON.stringify(dataParam));
          }
          return dataParam.name + '=' + dataParam.value;
        }).join('&');

        return _s.sprintf('\r\n\r\n%s', formDataParams);

      case httpConst.contentTypes.json:
        return '\r\n\r\n' + body.json;

      default:
        return _s.sprintf('\r\n\r\n%s', body.plain);
    }
  }

  private _getHostName(url) {
    if (!url) {
      return;
    }

    const match = url.match(/(www[0-9]?\.)?(.[^/]+)/i);
    if (match && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
      return _s.ltrim(match[2], '/');
    }
    return;
  }

}
