import { isFunction } from "@zvue/shared";
import { RefImpl, trackRefValue, triggerRefValue } from "./ref";
import { ReactiveEffect, triggerEffects } from "./effect";

// 感觉就是ref的变种
// 描述实现原理:1.计算属性维护了一个dirty属性，默认就是true，稍后运行过一次会将dirty变为false，并且稍后依赖的值变化后会再次变为false
//2.计算属性也是一个effect, 依赖的属性会收集这个计算属性，当前值变化后，会让computedEffect里面dirty变为true
//3.计算属性具备收集能力的，可以收集对应的effect，依赖的值变化后会触发effect重新执行
//计算属性aliasName，计算属性依赖的值name
//计算属性本身就是一个effect，有一个标识dirty=true，访问的时候会，触发name属性的get方法(依赖收集)
// 将name属性和计算属性做一个映射，稍后name变化后会触发计算属性的scheduler(触发计算属性收集的effect)
// 计算属性可能在effect中使用，当取计算属性的时候，会对当前的effect进行依赖收集
class ComputedRefImpl {
    public _value: any;
    public effect: any;
    public dep: any;
    constructor(getter: any, public setter: any) {
        // 创建一个effect，来关联当前计算属性的dirty属性
        this.effect = new ReactiveEffect(() => getter(this._value), () => {
            // 计算属性依赖的值变化了，需要触发渲染effect重新执行
            triggerRefValue(this);  // 触发后需要在triggerEffects让数据重新变脏 
        });
    }
    get value() {
        // TODO 计算属性缓存机制
        // 获取计算属性的值
        if (this.effect.dirty) {
            this._value = this.effect.run(); // 走过就不脏了
            trackRefValue(this) // 收集依赖关系关联到this.dep，每次get时再同步到dep吗
        }
        return this._value;
    }
    set value(v) {
        // ref的setter
        this.setter(v);
    }
}

export function computed(getterOrOptions: any) {
    // 两种传参方式
    // 1、getter为只传函数
    // 2、getter为对象，对象中包含get和set方法
    let onlyGetter = isFunction(getterOrOptions);
    let getter;
    let setter;
    // 只传函数
    if (onlyGetter) {
        getter = getterOrOptions;
        setter = () => {
        };
    } else {
        // getter对象
        getter = getterOrOptions.get;
        setter = getterOrOptions.set;
    }
    // 返回一个ref
    return new ComputedRefImpl(getter, setter);
}