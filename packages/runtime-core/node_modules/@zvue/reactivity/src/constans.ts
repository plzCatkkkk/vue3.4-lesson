// 常量统一维护

// TypeScript 的枚举（Enum）
// 是否响应式
export enum ReactiveFlags {
    IS_REACTIVE = "__z_isReactive", //__z_isReactive是无意义的字符，只是为了区分，用symbol也可以
}

// 计算属性 - 本质上是一个effect，并且返回一个自动更新的ref对象
// 脏值层级-计算属性使用
export enum DirtyLevels {
    Dirty = 4, // 脏值 - 意味着要重新计算需要重新
    NoDirty = 0, // 不脏 - 返回上一次的返回结果
}