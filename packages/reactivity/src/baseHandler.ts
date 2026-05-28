import { isObject } from "@zvue/shared";
import { activeEffect } from "./effect";
import { reactive } from "./reactive";
import { track, trigger } from "./reactiveEffect";
import { ReactiveFlags } from "./constans";

// Reflect 是一个静态工具对象，提供了一系列方法来操作对象。它的设计目的是：
// 1.将 Object 的一些内部方法标准化
// 2.让对象操作变成函数行为
// 3.与 Proxy 配合使用，简化代理逻辑

export const mutableHandlers: ProxyHandler<any> = {
    // target:代理目标, key：属性, value：值, receiver：代理对象，返回出的东西
    get(target, key, receiver) {
        // 判定是否被代理过
        if (key === ReactiveFlags.IS_REACTIVE) {
            return true;
        }
        // Reflect可以让this 指向代理对象
        // 当取值的时候应该让 响应式属性 和 effect 映射起来
        // TODO 依赖收集
        // console.log(activeEffect) // 当前激活的effect函数
        track(target, key);  // 收集对象上的属性，和effect关联起来
        let res = Reflect.get(target, key, receiver)
        if (isObject(res)) {
            // 如果属性的值是一个对象，则进行递归代理
            return reactive(res);
        }
        return res;
    },
    set(target, key, value, receiver) {
        // 让对应的effect重新执行（更新视图)
        let oldValue = target[key];
        let result = Reflect.set(target, key, value, receiver);
        if (oldValue !== value) {
            // 值变化，要触发更新
            trigger(target, key, value, oldValue);
        }
        // TODO 触发更新
        return result;
    }
}

