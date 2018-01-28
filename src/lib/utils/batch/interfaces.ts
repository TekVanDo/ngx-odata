export interface HttpRequestObject {
  method: string;
  protocol: string;
  url: string;
  protocolVersion: string;
  host?: string;
  headers?: HeaderObject [];
  cookie?: CookieObject [];
  body?: BodyObject;
}

export interface HeaderObject {
  name: string;
  values: HeaderValueObject [];
}

export interface HeaderValueObject {
  value: string;
  params?: string;
}

export interface CookieObject {
  name: string;
  value: string;
}

export interface BodyObject {
  contentType?: string,
  json?: string,
  plain?: string;
}
