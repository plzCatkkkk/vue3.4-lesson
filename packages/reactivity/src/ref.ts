import { activeEffect, trackEffect, triggerEffects } from "./effect";
import { reactive, toReactive } from "./reactive";
import { createDep } from "./reactiveEffect";

// ref shallowRef
export function ref(value: any) {
    return createRef(value);
}

function createRef(value: any) {
    return new RefImpl(value);
}

export class RefImpl {
    public _value: any;
    public __v_isRef = true;  //添加ref标识
    public dep: any = undefined; // 用于收集对应effect，初始为undefined
    constructor(public rawValue: any) {
        this._value = toReactive(rawValue);
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        if (newValue !== this.rawValue) {
            this.rawValue = newValue;
            this._value = toReactive(newValue);
            triggerRefValue(this);
        }
    }
}

/**
 * 追踪 ref 值的依赖关系
 * 当 activeEffect 存在时，将当前 effect 与 ref 的 dep 收集器关联起来
 * @param ref - RefImpl 实例，包含用于收集依赖的 dep 属性
 */
export function trackRefValue(ref: any) {
    // 仅在响应式 effect 执行期间才进行依赖追踪
    if (activeEffect) {
        // 创建或复用 dep 收集器，并将其赋值给 ref.dep
        // createDep 接收一个 cleanup 函数和 key 名称，返回一个带有 cleanup 方法的 Map
        // 当 dep 被清理时，会将 ref.dep 重置为 undefined
        trackEffect(activeEffect,
            (ref.dep = ref.dep || createDep(() => (ref.dep = undefined), "undefined"))
        );
    }
}

export function triggerRefValue(ref: any) {
    let dep = ref.dep;
    if (dep) {
        triggerEffects(dep); //触发依赖更新
    }
}

class ObjectRefImpl {
    public __v_isRef = true;  //ref 标识
    constructor(public _object: any, public _key: string) { }
    get value() {
        return this._object[this._key];
    }
    set value(newValue) {
        this._object[this._key] = newValue;
    }
}

export function toRef(Object: Object, key: string) {
    return new ObjectRefImpl(Object, key);
}

export function toRefs(Object: Object) {
    const res: any = {};
    for (const key in Object) {
        res[key] = toRef(Object, key);
    }
    return res;
}
// 模板解析时直接取值和赋值
export function proxyRefs(objectWithRef: any) {
    return new Proxy(objectWithRef, {
        get(target, key, receiver) {
            let r = Reflect.get(target, key, receiver);
            return r.__v_isRef ? r.value : r;  //自动脱ref
        },
        set(target, key, value, receiver) {
            const oldValue = target[key];
            // 属性值也可能是被代理过的
            if (oldValue.__v_isRef) {
                oldValue.value = value;  //如果老值是ref 需要给ref赋值
                return true;
            } else {
                return Reflect.set(target, key, value, receiver);
            }
        }
    });
}

export function isRef(value: any) {
    return !!(value && value.__v_isRef);
}