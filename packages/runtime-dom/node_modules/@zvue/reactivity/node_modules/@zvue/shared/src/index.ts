export function isObject(value: any) {
    return value !== null && typeof value === 'object';
}

export function isFunction(fn: any) {
    return typeof fn === 'function';
}

export function isArray(value: any) {
    return Array.isArray(value);
}

export function isString(value: any) {
    return typeof value === 'string';
}

// 判断对象是否有属性-反柯里化
const hasOwnProperty = Object.prototype.hasOwnProperty;
export const hasOwn = (value: any, key: any) => hasOwnProperty.call(value, key);;

export * from './shapeFlags'