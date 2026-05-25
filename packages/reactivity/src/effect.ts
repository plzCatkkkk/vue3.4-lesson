export function effect(fn: Function, options?: Object) {
    // 数据变化后可以重新执行

    // 创建一个effect，只要依赖的属性变化了就要执行回调
    const _effect = new ReactiveEffect(fn, () => {
        _effect.run();
    });

    // 默认执行一次
    _effect.run();
}

// 自动声明类属性：不需要在类体中单独声明 fn 和 scheduler
// 自动赋值：TypeScript 编译器会自动生成 this.fn = fn 这样的代码
// 设置访问权限：
//     public：外部可访问（默认）
//     private：仅类内部可访问
//     protected：类和子类可访问
//     readonly：只读属性

export let activeEffect: any;  // 当前激活的effect函数
const effectStack: any[] = [];  // 使用数组栈来支持多层嵌套

// 重置依赖计数器 (_depsLength = 0)：让新收集的依赖从数组开头重新填充
// 递增版本号 (_trackId++)：标记版本避免重复执行
// 如果不清理会导致：
// 🚨 内存泄漏（deps 数组无限增长）
// 🚨 错误触发（过期依赖仍会触发 effect）
// 🚨 无法正确管理动态变化的依赖关系

function preCleanEffect(effect: any) {
    effect._depsLength = 0;
    effect._trackId++; // 每次执行同一个effect，trackId都会加1
}

function postCleanEffect(effect: any) {
    // 删除过期依赖
    if(effect.deps.length > effect._depsLength)
    for (let i = effect._depsLength; i < effect.deps.length; i++) {
        cleanDepEffect(effect.deps[i], effect) //删除映射表targetMap中对应的effect
    }
    // 截断数组
    effect.deps.length = effect._depsLength;  //删除effect实例中多余的依赖
}

class ReactiveEffect {
    _trackId = 0; // 用于记录当前effect执行了几次
    deps = []; // 记录effect依赖的属性
    _depsLength = 0;  //_depsLength 不是"计数器"，而是"下一个要写入的位置索引"
    // effectScope.stop() //停止所有effect不参与响应式处理
    public active = true;  // 创建的effect是响应式的
    // 如果fn中的依赖项发生变化，需要重新调用run
    constructor(public fn: Function, public scheduler?: Function) {
    }
    run() {
        // 运行fn
        if (!this.active) {
            return this.fn();  //不是激活的，执行后什么都不用做
        }
        try {
            // 为了确定effect的运行，将当前effect保存到activeEffect中
            effectStack.push(this);
            activeEffect = this;
            // TODO effect重新执行前，需要将上一次的依赖情况effect.deps清空
            // 比如通过effect多次访问同个依赖，减少多余收集
            preCleanEffect(this)
            return this.fn();    //依赖收集  -> state.name, state.age -> 只要取值就会命中handler的get
        } finally {
            postCleanEffect(this)
            effectStack.pop();
            activeEffect = effectStack[effectStack.length - 1];

        }

    }
    // TODO 停止响应
    stop() {
    }
}

function cleanDepEffect(dep:any, effect: any) { 
    dep.delete(effect);
    if(dep.size === 0) {
        dep.cleanup(); //如果map为空，则删除这个属性
    }
}

// 每次访问数据判断依赖关系，让effect实例和targetMap双向记忆
export function trackEffect(effect: any, dep: any) {
    // 让effect和收集器联系起来（effect有哪些收集器）
    // 对应到preCleanEffect部分，清除后需要重新收集，将不必要的依赖移除掉
    // 第一次获取get(effect)时是undefined，然后effect._trackId变为1
    // 第二次获取get(effect)时，dep.get(effect)为1，然后effect._trackId变为2
    // 所以同一次effect执行的get(effect)，_trackId不变，所以不会重复收集
    // 下一次执行effect因为preCleanEffect时，_trackId++，所以会重新收集
    console.log(dep.get(effect), effect._trackId)
    // debugger;
    // 简易diff
    if (dep.get(effect) !== effect._trackId){
        dep.set(effect, effect._trackId) //更新id
        let oldDep = effect.deps[effect._depsLength]
        debugger;
        // 如果没有存过
        if (oldDep !== dep) {
            if (oldDep) {
                // 删掉老的
                cleanDepEffect(oldDep, effect)
            }
            // 换成新的
            effect.deps[effect._depsLength++] = dep
        } else {
            // 存过就过下一个
            effect._depsLength++
        }
    }
    // dep: {
    //     effect1: effect1._trackId,
    //     effect2: effect2._trackId
    // }
}

// 当更变的值需要更新视图，依次触发effect
export function triggerEffects(deps: any) {
    // 遍历每一个effect
    for(const effect of deps.keys()) { 
        if(effect.scheduler) { 
        // 触发effect
        // 为什么不直接用effect.run()?
        // 核心原因：调度器（Scheduler）提供了更灵活的控制机制
        // 解耦触发和执行时机:
        // scheduler 是一个可选的回调函数，它允许你自定义 effect 何时以及如何执行
        // 如果直接调用 run()，就失去了这种灵活性
            effect.scheduler();  // effect.run()
        }
    }
}