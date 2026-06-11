import { proxyRefs, reactive } from "@zvue/reactivity";
import { hasOwn, isFunction } from "@zvue/shared";

export function createComponentInstance(vnode: any) {

    // 实例 - 用来判断是否已经初始化
    const instance = {
        data: null,
        vnode, // 虚拟节点
        subTree: null as any, // 组件的子树
        isMounted: false,  // 挂载状态
        update: null as any, // 更新函数
        props: {} as any,
        attrs: {} as any,
        propsOptions: vnode.type.props,
        component: null as any,
        proxy: null as any,  //用来代理props,sttrs,data 方便使用,
        render: null as any,
        setupState: {},
    }
    return instance;
}

const initProps = (instance: any, rawProps: any) => {
    const props: any = {}
    const attrs: any = {}
    const propsOptions = instance.propsOptions
    // 遍历所有判断是否在propsOptions中
    for (let key in rawProps) {
        let value = rawProps[key]  // String | Number
        if (key in propsOptions) {
            props[key] = reactive(value);  // TODOr 应该用shallowReactive 暂时没实现
        } else {
            attrs[key] = value;
        }
    }
    instance.props = reactive(props);
    instance.attrs = attrs;
}
// TODO 根据propsOptions区分props和attrs
const publicProperty: any = {
    $attrs: (instance: any) => instance.attrs
}

const handler = {
    get(target: any, key: any) {
        // $attrs 暂不考虑
        const { data, props, setupState } = target;
        // Proxy.name -> data.name 
        // 判断data有没有属性，有的话代理到data
        if (data && hasOwn(data, key)) {
            return data[key];
        } else if (props && hasOwn(props, key)) {
            return props[key];
        } else if (setupState && hasOwn(setupState, key)) {
            return setupState[key];
        }
        // 对于一些无法修改的属性 $slot $attrs
        const getter = publicProperty[key];
        if (getter) return getter(target);
    },
    set(target: any, key: any, value: any) {
        const { data, props, setupState } = target;
        if (data && hasOwn(data, key)) {
            data[key] = value;
        } else if (props && hasOwn(props, key)) {
            props[key] = value;
            // 这个不能改，不合法
            console.warn('props are readonly')
            return false
        } else if (setupState && hasOwn(setupState, key)) {
            setupState[key] = value;
        }
        return true;
    }
}

export function setupComponent(instance: any) {
    const { vnode } = instance;
    // 赋值属性
    initProps(instance, vnode.props)
    // 赋值代理对象
    instance.proxy = new Proxy(instance, handler)
    const { data = () => { }, render, setup } = vnode.type;
    if (setup) {
        const ssetupContext = {
            attrs: {},
            slots: {},
            emit: () => { }
        }
        const setupResult = setup(instance.props, ssetupContext)
        if (isFunction(setupResult)) {
            instance.render = setupResult
        } else {
            instance.setupState = proxyRefs(setupResult)  //将返回的值做脱ref
        }
    }

    if (!isFunction(data)) {
        console.warn('data must be a function')
    } else {
        // data中可以拿到props
        instance.data = reactive(data.call(instance.proxy)) // 组件的状态
    }
    // render函数挂载
    if (!instance.render) {
        instance.render = render;
    }
}
