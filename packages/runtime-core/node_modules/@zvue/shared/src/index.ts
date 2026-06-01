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

export * from './shapeFlags'