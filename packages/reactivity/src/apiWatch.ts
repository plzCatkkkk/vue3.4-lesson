import { isFunction, isObject } from "@zvue/shared";
import { ReactiveEffect } from "./effect";
import { isReactive } from "./reactive";
import { isRef } from "./ref";
export function watch(source: any, cb: Function, options = {} as any) {
    // watchEffect也是基于doWatch实现的
    return doWatch(source, cb, options);
}

// 没有cb的watch，直接传getter作为依赖收集，同时是触发函数
// 几乎等于effect(简化版)，以前是不暴露effect的
export function watchEffect(getter: Function, options = {} as any) {
    return doWatch(getter, null, options);
}

// 递归处理对象
// depth: 需要递归的深度
// currentDepth: 当前递归的深度
// seen: 存储已经访问过的对象和属性
function traverse(source: any, depth: any, currentDepth = 0 as any, seen: any = new Set()) {
    if (!isObject(source)) {
        // 如果不是对象，则返回原值
        return source;
    }
    if (depth) {
        // 一旦访问层数大于等于递归深度，则返回原值
        if (currentDepth >= depth) {
            return source;
        }
        currentDepth++;
    }
    if (seen.has(source)) {
        // 遍历过的不再遍历
        return source;
    }
    for (let key in source) {
        traverse(source[key], depth, currentDepth, seen)
    }
    return source;
}

function doWatch(source: any, cb: any, options = { deep: true, immediate: false } as any) {
    // source -> getter  把source包装成一个getter函数给ReactiveEffect(fn, scheduler)接收
    // watch 需要统一处理不同数据源（ref、reactive对象、getter函数等），将它们都转换为 getter 函数后：
    // 标准化接口：无论传入什么类型，都能通过执行 getter 来获取当前值
    // 自动依赖收集：执行 getter 时会自动触发响应式系统的 track 机制，收集所有被访问的依赖
    // 变化检测：每次执行 getter 获取新值，与旧值对比判断是否触发回调
    let deep = options && options.deep;
    // 立即执行回调
    let immediate = options && options.immediate;
    // TODO deep目前先考虑只有一层和都监听
    const reactiveGetter = (source: any) => traverse(source, deep === false ? 1 : undefined);  //traverse遍历一遍属性
    // 产生一个可以给ReactiveEffect来使用的getter，需要对这个对象进行取值操作，会关联当前的ReactiveEffect
    let getter;
    // 先判断一下source是不是响应式数据
    if (isReactive(source)) {
        getter = () => reactiveGetter(source);
    } else if (isRef(source)) {
        // 如果是ref，则返回ref.value
        // ref 只有一个 value 属性
        // 访问 count.value 时，RefImpl 的 getter 会自动调用 trackRefValue(this)
        // 一次访问 = 完整依赖收集
        getter = () => source.value;
    } else if (isFunction(source)) {
        // 如果是函数，则返回原值
        getter = source;
    }

    let oldValue: any;
    const job = () => {
        if (cb) {
            const newValue = effect.run();
            cb(newValue, oldValue);
            oldValue = newValue;
        } else {
            effect.run();
        }
    }
    const effect = new ReactiveEffect(getter, job);
    if (cb) {
        if (immediate) {
            job();
        } else {
            oldValue = effect.run();
        }
    } else {
        // watchEffect
        effect.run(); //直接执行即可
    }
}