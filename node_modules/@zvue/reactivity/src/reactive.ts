import { isObject } from "@zvue/shared"
import { mutableHandlers } from "./baseHandler"
import { ReactiveFlags } from "./constans";

// reactive / shallowReactive

// 用于记录代理后的结果，可以复用
// WeakMap(es6新特性⭐):
// 1.键只能是对象（不能是基本类型如字符串、数字等）
// 2.弱引用：键所引用的对象如果没有其他引用，会被垃圾回收机制自动回收
// 3.不可遍历：没有 keys()、values()、entries() 等方法，也无法通过 forEach 遍历
// 4.只有四个方法：
//    - set(key, value) - 设置键值对
//    - get(key) - 获取值
//    - has(key) - 判断是否存在
//    - delete(key) - 删除键值对
const reactiveMap = new WeakMap();

function createReactiveObject(target: any) {
    // 统一做判断，响应式对象必须是对象
    if (!isObject(target)) {
        return target;
    }
    // 判断是否被代理过
    if (target[ReactiveFlags.IS_REACTIVE]) {
        return target;
    }
    // 确认是否有缓存
    const exitsProxy = reactiveMap.get(target);
    if (exitsProxy) {
        return exitsProxy;
    }
    // 用Proxy包装对象
    let proxy = new Proxy(target, mutableHandlers);
    // 根据对象缓存代理后的对象
    reactiveMap.set(target, proxy);
    return proxy;
}

export function reactive(target: any) {
    return createReactiveObject(target);
}

export function toReactive(value: any) {
    return isObject(value) ? reactive(value) : value;
}

export function isReactive(value: any) {
    return !!(value && value[ReactiveFlags.IS_REACTIVE]);
}