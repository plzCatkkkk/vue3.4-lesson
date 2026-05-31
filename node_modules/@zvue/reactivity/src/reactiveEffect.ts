import { activeEffect, trackEffect, triggerEffects } from "./effect";

// 为什么WeakMap不会内存泄露？
// 核心原因：弱引用（Weak Reference）机制，当对象不存在时，会自动被垃圾回收机制回收
// 当你把 obj 设为 null
// ✅ obj 对象会被 GC 自动回收！
// 因为 WeakMap 只持有弱引用
// 没有其他引用时，GC 可以回收

const targetMap = new WeakMap();  // 存储对象和属性的依赖关系

export const createDep = (cleanup: any, key: any) => {
    // 绕过 TypeScript 类型检查，动态添加自定义属性
    const dep = new Map() as any;
    dep.cleanup = cleanup;
    // TODO 源码没有，方便观察
    dep.name = key;
    return dep;
}

// 依赖收集(每一次访问属性都会触发 => get方法)
export function track(target: any, key: any) {
    // activeEffect 必须存在，说明key是在运行effect中取值的，没有说明不是当前effect
    if (activeEffect) {
        // console.log(target, key, activeEffect)

        let depsMap = targetMap.get(target);
        if (!depsMap) {  //新增的代理对象
            depsMap = new Map();
            targetMap.set(target, depsMap);
        }
        // 代理对象属性收集
        let dep = depsMap.get(key);
        if (!dep) {  //新增的属性
            // 原先是Set储存effect，为了做清理改成map
            // TODO 这里还未了解清理的必要性
            depsMap.set(key, createDep(() => depsMap.delete(key), key));  //后面用于清理不需要的属性
            dep = depsMap.get(key);
        }
        trackEffect(activeEffect, dep)  // 将当前的effect放人到dep映射表中，后续可以根据值的变化触发此dep中存放的effect
        // console.log(targetMap)

    }
}

// 赋值时触发依赖更新，判断是否需要更新视图，寻找正确的effect
export function trigger(target: any, key: any, value: any, oldValue: any) {
    // 在依赖映射表中寻找有没有响应式属性的依赖
    const depsMap = targetMap.get(target);
    if (!depsMap) {
        // 没有依赖映射
        return;
    }
    let deps = depsMap.get(key);
    if (deps) {
        // 修改的属性有对应effect
        // 有多个effect需要依次去执行
        triggerEffects(deps);
    }
}


// 期望运行结果 targetMap（三层嵌套结构）
// targetMap (WeakMap):
//   key: 响应式对象（target）
//   value: depsMap (Map)
//     key: 属性名（如 'name', 'age'）
//     value: dep (Map)
//       key: effect实例
//       value: trackId（版本号）
//
// 示例：
// WeakMap {
//   state代理对象: Map {
//     'name': Map {
//       effect1 → 1,  // effect1第1次执行时的trackId
//       effect2 → 2   // effect2第1次执行时的trackId
//     },
//     'age': Map {
//       effect2 → 2   // effect2也依赖age
//     }
//   }
// }
