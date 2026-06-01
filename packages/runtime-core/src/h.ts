// TODO 传参规则
//可能是一个(类型) 参数可以有 2个(类型，属性/儿子)  3个(类型，属性，儿子) 超过3个(从第三个开始都是儿子)

import { isArray, isObject } from "@zvue/shared";
import { createVnode, isVnode } from "./createVnode";

//h(类型，属性，儿子)
//h(类型，儿子)

//1.两个参数 第二个参数可能是属性，或者虚拟节点(__v_isVnode)
//2.第二个参数就是一个数组 ->儿子
//3.其他情况就是属性
//4.直接传递非对象的，文本
//5.不能出现三个参数的时候第二个只能是属性，
//6.如果超过三个参数，后面的都是儿子

export function h(type: any, propsOrChildren?: any, children?: any) {
    // 获取传参数量
    let l = arguments.length
    if (l === 2) {
        // 只有两个传参

        // 如果第二个参数是对象并且不是数组，那么就是属性或虚拟节点 
        if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
            // 如果第二个参数是vnode，那么就是儿子
            if (isVnode(propsOrChildren)) {
                return createVnode(type, null, [propsOrChildren])
            } else {
                // 属性
                return createVnode(type, propsOrChildren, null)
            }
        }
        // 数组 | 文本
        return createVnode(type, null, propsOrChildren)

    } else {
        if (l > 3) {
            // 剔除前两个传参，后面都是儿子
            children = Array.prototype.slice.call(arguments, 2)
        }
        if (l === 3 && isVnode(children)) {
            // 如果只有一个虚拟节点，包装成数组
            children = [children]
        }
        return createVnode(type, propsOrChildren, children)
    }
}



