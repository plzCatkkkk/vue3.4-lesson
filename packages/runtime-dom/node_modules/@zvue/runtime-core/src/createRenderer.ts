import { ShapeFlags } from "@zvue/shared";
import { Fragment, Text, isSameVnode } from "./createVnode";
import { getSequence } from "./getSequence";
import { ReactiveEffect, reactive } from "@zvue/reactivity";

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

    const unmount = (vnode: any) => {
        // Fragment仅卸载子节点
        if (vnode.type === Fragment) {
            unmountChildren(vnode.children);
        } else {
            hostRemove(vnode.el);
        }
    };
    const unmountChildren = (children: any) => {
        for (let i = 0; i < children.length; i++) {
            unmount(children[i]);
        }
    };
    const mountElement = (vnode: any, container: any, anchor: any) => {
        const { type, props, children, shapeFlag } = vnode;
        // 第一次渲染的时候让虚拟dom和真实dom关联起来
        // 第二次渲染新的时候可以和上一次vnode做比对，然后更新对应el元素，可以后续再复用这个dom
        const el = vnode.el = hostCreateElement(type);
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
        hostInsert(el, container, anchor);
    }

    const patchProps = (oldProps: any, newProps: any, el: any) => {
        // 新的属性全部生效
        for (let key in newProps) {
            hostPatchProp(el, key, oldProps[key] || null, newProps[key]);
        }
        // 删掉不存在的老属性
        for (let key in oldProps) {
            if (!(key in newProps)) {
                hostPatchProp(el, key, oldProps[key], null);
            }
        }
    };

    const patchKeyedChildren = (c1: any, c2: any, el: any) => {
        // 比较儿子列表的差异
        // 为了减少比对范围，先从头开始比，再从尾开始比  确定差异范围
        let i = 0; // 比对起始索引
        let e1 = c1.length - 1;  // 旧列表末尾索引
        let e2 = c2.length - 1;  // 新列表末尾索引
        // 从头比对
        while (i <= e1 && i <= e2) {  // 有任何一方循环结束，终止比较
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSameVnode(n1, n2)) {
                patch(n1, n2, el) // 更新当前节点的属性和儿子(递归比较子节点)
            } else {
                break;
            }
            i++;

        }
        // 从尾比对
        while (i <= e1 && i <= e2) {  // 有任何一方循环结束，终止比较
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSameVnode(n1, n2)) {
                patch(n1, n2, el) // 更新当前节点的属性和儿子(递归比较子节点)
            } else {
                break;
            }
            e1--;
            e2--;
        }
        // 处理头尾增加和删除的情况
        if (i > e1) {
            //新的多
            // a b -> a b c  尾增加  i = 2, e1 = 1, e2 = 2  i>e1 && i<=e2
            // a b -> c a b  头增加  i = 0, e1 = 0, e2 = 1  i>e1 && i<=e2
            if (i <= e2) {  //有插入的部分
                let nextPos = e2 + 1;  //下一个元素: 有的话就是前插入，没有的话就是后插入
                let anchor = c2[nextPos]?.el;
                while (i <= e2) {
                    patch(null, c2[i], el, anchor);
                    i++;
                }
            }
        } else if (i > e2) {
            // 新的少
            if (i <= e1) {
                // a b c -> a b  尾增加  i = 2, e1 = 2, e2 = 1  i<=e1
                // c a b -> a b  头增加  i = 0, e1 = 0, e2 = -1  i<=e1
                while (i <= e1) {
                    console
                    unmount(c1[i]);  // 一个个删除
                    i++;
                }
            }
        } else {
            // 特殊的比对方式(头尾有相同，中间乱序)
            // a b | c d e   | f g
            // a b | e c d h | f g
            // i = s1 = s2 = 2,  e1 = 4,  e2 = 5
            // e d c依旧可以复用，h节点新增
            let s1 = i; //差异范围 s1 - e1
            let s2 = i; //差异范围 s2 - e2

            // 做一个映射表用于快速查找，看老的是否在新的里面还有，没有就删除，有就更新
            const keyToNewIndexMap = new Map();

            let toBePatched = e2 - s2 + 1; //要倒序插入的个数
            let newIndexToOldMapIndex = new Array(toBePatched).fill(0); // 初始化数组

            // 根据新的节点，找到对应老的位置
            for (let i = s2; i <= e2; i++) {
                const vnode = c2[i];
                keyToNewIndexMap.set(vnode.key, i); // 新索引
            }
            for (let i = s1; i <= e1; i++) {
                const vnode = c1[i];
                const newIndex = keyToNewIndexMap.get(vnode.key); // 旧节点是否存在在新列表里面
                if (newIndex === undefined) {
                    // 新的里面没有，删除老的
                    unmount(vnode);
                } else {
                    // 更新元素的属性，样式，事件
                    newIndexToOldMapIndex[newIndex - s2] = i + 1;  // 差异开始的索引
                    // 为了避免0的歧义，将索引加1，如果是0就是没比对过的(找不到)
                    patch(vnode, c2[newIndex], el)
                }
            }
            // console.log(newIndexToOldMapIndex);
            // [e, c, d, h] -> [5, 3, 4, 0] 新节点中第i个差异是旧节点中的索引
            // 最长递增子序列算出来是 [3, 4] -> 需要用到的是对应的索引 [1, 2]
            // 倒序插入，如果插入的新索引在[1, 2]中，不需要动 -> c d的索引在[1, 2]中，不需要动
            let incereasingSeq = getSequence(newIndexToOldMapIndex);
            // console.log(incereasingSeq);

            let j = incereasingSeq.length - 1;
            // 对新的节点排序插入
            for (let i = toBePatched - 1; i >= 0; i--) {
                let newtIndex = s2 + i; // h 对应的索引，找他的下一个元素作为参照物，来进行插入
                let anchor = c2[newtIndex + 1]?.el;  // 当前参照物 f
                // console.log(c2[newtIndex]);
                let vnode = c2[newtIndex];
                // debugger;
                // 可能新的比老的多，需要额外创建
                if (!vnode.el) {  // 新列表中新增的元素
                    patch(null, vnode, el, anchor);  //创建 h 插入
                } else {
                    if (i == incereasingSeq[j]) {
                        // 有相同不做插入，换下一个来判断
                        j--;
                    } else {
                        hostInsert(vnode.el, el, anchor);
                    }
                }

            }
        }
    }

    const patchChildren = (n1: any, n2: any, el: any) => {
        // 三种情况 text array null
        const c1 = n1.children;
        const c2 = n2.children;

        const prevShapeFlag = n1.shapeFlag;
        const shapeFlag = n2.shapeFlag;
        // 新旧情况
        // 1.老数组，新文本，移除老的
        // 2.老文本，新文本，内容不相同替换
        // 3.老数组，新数组，全量diff算法
        // 4.老数组，新不是数组，移除老的子节点
        // 5.老文本，新空
        // 6.老文本，新数组
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            // 旧数组，挨个清掉旧节点
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                unmountChildren(c1);
            }
            // 新文本，旧其他，内容不同
            if (c1 !== c2) {
                hostSetElementText(el, c2);
            }
        } else {
            // 旧值为空/数组
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                // TODO 新旧都数组，全量diff算法比对
                if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                    // 比对数组key
                    patchKeyedChildren(c1, c2, el);
                } else {
                    // 新为空
                    unmount(c1);
                }
            } else {  //旧值是文本
                if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                    hostSetElementText(el, "");
                }
                if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                    mountChildren(c2, el);
                }
            }
        }
    };

    const patchElement = (n1: any, n2: any, container: any) => {
        // 1、比较元素的差异，肯定需要复用dom元素
        // 2、比较属性和元素的子节点
        let el = n2.el = n1.el; // 复用旧节点的el dom
        // 获取新旧属性
        let oldProps = n1.props || {};
        let newProps = n2.props || {};
        // hostPatchProp只针对某一个属性来处理
        patchProps(oldProps, newProps, el);
        // 比较子元素差异
        patchChildren(n1, n2, el);
    }

    const processElement = (n1: any, n2: any, container: any, anchor = null as any) => {
        if (n1 === null) {
            // 初始化程序
            mountElement(n2, container, anchor);
        } else {
            // 比较节点差异
            patchElement(n1, n2, container)
        }
    };
    // 文本节点 - 可以被直接获取 web原生api
    const processText = (n1: any, n2: any, container: any) => {
        if (n1 === null) {
            // 初始化程序
            hostInsert(n2.el = hostCreateText(n2.children), container);
        } else {
            // 比较节点差异
            const el = n2.el = n1.el;
            if (n1.children !== n2.children) {
                hostSetText(el, n2.children);
            }
        }
    }
    const processFragment = (n1: any, n2: any, container: any) => {
        if (n1 === null) {
            // 初始化程序-直接放儿子
            mountChildren(n2.children, container);
        } else {
            // 比较节点差异-只比较儿子
            patchChildren(n1, n2, container)
        }
    };

    const mountComponent = (n2: any, container: any, anchor = null as any) => {
        // 组件可以基于自己的状态重新渲染 => effect 所以里面要有一个effect
        const {
            data = () => { },
            render
        } = n2.type;
        const state = reactive(data()) // 组件的状态
        // 实例 - 用来判断是否已经初始化
        const instance = {
            state,
            vnode: n2, // 虚拟节点
            subTree: null as any, // 组件的子树
            isMounted: false,  // 挂载状态
            update: null as any // 更新函数
        }
        const componentUpdateFn = () => {
            // 把this指向当前的state
            // 传第一个用作绑定，传第二个作为显式参数传递给render函数,让 render 函数可以直接通过参数接收到状态对象
            // TODO 需要判断是初始化还是更新，否则会一直插入节点
            if (!instance.isMounted) {
                const subTree = render.call(state, state)
                instance.subTree = subTree
                patch(null, subTree, container, anchor);
                instance.isMounted = true
            } else {
                const subTree = render.call(state, state)
                patch(instance.subTree, subTree, container, anchor);
                instance.subTree = subTree
            }
        }
        // ReactiveEffect创建effect并传入更新函数，再包装一层方便修改
        const effect = new ReactiveEffect(componentUpdateFn, () => update())
        // 更新函数
        const update = (instance.update = () => {
            effect.run()
        })
        update();
    }

    const processComponent = (n1: any, n2: any, container: any, anchor = null as any) => {
        if (n1 === null) {
            // 初始化挂载
            mountComponent(n2, container, anchor);
        } else {
            // 更新
        }
    }

    // 渲染走这里，更新也走这里
    // n1: 旧节点
    // n2: 新节点
    const patch = (n1: any, n2: any, container: any, anchor = null as any) => {
        // 没更新内容
        if (n1 === n2) {
            return
        }
        // 新旧节点类型和key不相同
        if (n1 && !isSameVnode(n1, n2)) {
            unmount(n1);
            n1 = null; //就会执行初始化
        }
        const { type, shapeFlag } = n2;
        switch (type) {
            case Text:
                processText(n1, n2, container);
                break;
            case Fragment:
                processFragment(n1, n2, container); // 儿子只能传数组
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    // 一般元素渲染
                    processElement(n1, n2, container, anchor);
                } else if (shapeFlag & ShapeFlags.COMPONENT) {
                    // 组件渲染-包含有状态组件和函数式组件
                    // Vue3中函数式组件因为性能不好基本废弃，只是为了对齐Vue2
                    processComponent(n1, n2, container, anchor);
                }
        }


    };

    const render = (vnode: any, container: any) => {
        if (vnode === null) {
            // 移除当前容器中的元素
            unmount(container._vnode);
        } else {
            // 将虚拟dom转换成真实dom渲染
            patch(container._vnode || null, vnode, container);
            // 储存虚拟dom
            container._vnode = vnode;
        }
    };
    return {
        render
    };
}