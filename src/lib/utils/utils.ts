import * as _moment from 'moment';
const moment = _moment;

function warpSting(string) {
  return `'${string}'`;
}

function warpDate(date, format) {
  return moment(date).format(format);
}

const defaultFormat = 'YYYY-MM-DDTHH:MM:SSZ';

export function wrapValue(value: any, type: string = 'string') {
  if (type) {
    if (type === 'string') {
      return warpSting(value);
    } else if (type === 'date') {
      return warpDate(value, defaultFormat);
    } else {
      return value;
    }
  }

  if (typeof value === 'string') {
    return warpSting(value);
  } else if (value instanceof Date) {
    return warpDate(value, defaultFormat);
  } else {
    return value;
  }
}
