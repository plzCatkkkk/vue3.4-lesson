// 创建一个调用函数，并且内部会执行nextvalue
function createInvoker(nextValue: any) {
    // 这个invoker会绑定函数
    const invoker = (e: any) => {
        invoker.value(e);
    }
    invoker.value = nextValue;
    return invoker;
}
export default function patchEvent(el: any, key: string, nextValue: any) {
    // 由于变更事件绑定比较消耗性能，所以这里使用事件代理，将事件绑定到父元素上
    // 事件缓存列表
    const invokers = el._vei || (el._vei = {});
    const eventName = key.slice(2).toLowerCase();
    const existingInvoker = invokers[eventName];
    // 有新值和旧值 -> 事件换绑
    if (nextValue && existingInvoker) {
        return (existingInvoker.value = nextValue);
    }
    // 有新值 -> 添加事件
    if (nextValue) {
        const invoker = (invokers[eventName] = createInvoker(nextValue))
        return el.addEventListener(eventName, invoker);
    }
    // 无新值有旧值 -> 删除事件
    if (existingInvoker) {
        el.removeEventListener(eventName, existingInvoker);
        invokers[eventName] = undefined;
    }

}