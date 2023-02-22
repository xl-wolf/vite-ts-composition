export const isNumber = (obj: unknown) => Object.prototype.toString.call(obj) === '[object Number]'
export const isString = (obj: unknown) => Object.prototype.toString.call(obj) === '[object String]'
