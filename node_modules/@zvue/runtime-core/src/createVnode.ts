import { ShapeFlags, isArray, isString } from "@zvue/shared";

// 创建虚拟节点
export function createVnode(type: any, props: any, children: any) {
    // TODO 需要做详细节点类型判断，这里先做demo
    const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;
    const vnode = {
        __v_isVnode: true,
        type,
        props,
        children,
        key: props?.key,  // diff算法需要用的key
        el: null, // 对应的真实节点
        shapeFlag: shapeFlag,  // 标识位
    };
    if (children) {
        if (isArray(children)) {
            // 子元素
            vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
        } else {
            // 文本，确保数字转为字符串
            children = String(children);
            vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
        }
    }
    return vnode;
}

export function isVnode(value: any) {
    return value.__v_isVnode;
}