import { ShapeFlags } from "@zvue/shared";

// 产生的render方法采用dom api进行渲染
export function createRenderer(renderOptions: any) {
    // core中不关心如何渲染
    const {
        // 元素操作
        insert: hostInsert,
        remove: hostRemove,
        // 创建元素
        createElement: hostCreateElement,
        createText: hostCreateText,
        // 创建文本
        setText: hostSetText,
        setElementText: hostSetElementText,
        // 元素关系
        parentNode: hostParentNode,
        nextSibling: hostNextSibling,
        patchProp: hostPatchProp
    } = renderOptions;

    const mountChildren = (children: any, container: any) => {
        for (let i = 0; i < children.length; i++) {
            // TODO children[i] 可能是纯文本
            patch(null, children[i], container);
        }
    };
    const mountElement = (vnode: any, container: any) => {
        const { type, props, children, shapeFlag } = vnode;
        const el = hostCreateElement(type);
        // 如果有属性
        if (props) {
            for (let key in props) {
                hostPatchProp(el, key, null, props[key]);
            }

        }
        // TODO 判断子元素是文本还是标签元素
        // 通过位运算 shapeFlag
        // h函数会把儿子和自己的类型或运算
        // 元素=1，文本=8，相加8=9，所以如果shapeFlag=9，则表示是元素+文本
        // 9 & 8 -> 1001 & 1000 -> 1000  说明包含8
        if ((shapeFlag & ShapeFlags.TEXT_CHILDREN)) {
            hostSetElementText(el, children);
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(children, el);
        }
        hostInsert(el, container);
    }

    // 渲染走这里，更新也走这里
    // n1: 旧节点
    // n2: 新节点
    const patch = (n1: any, n2: any, container: any) => {
        if (n1 === n2) {
            return
        }
        if (n1 === null) {
            // 初始化程序
            mountElement(n2, container);
        }
    };

    const render = (vnode: any, container: any) => {
        console.log(vnode, container)
        // 将虚拟dom转换成真实dom渲染
        patch(container._vnode || null, vnode, container);
        // 储存虚拟dom
        container._vnode = vnode;
    };
    return {
        render
    };
}