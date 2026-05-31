export function isObject(value: any) {
    return value !== null && typeof value === 'object';
}

export function isFunction(fn: any) {
    return typeof fn === 'function';
}