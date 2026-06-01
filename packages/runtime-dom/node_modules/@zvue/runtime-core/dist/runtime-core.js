// packages/runtime-core/src/index.ts
function createRenderer(renderOptions) {
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
  const mountElement = (vnode, container) => {
    const { type, props, children } = vnode;
    const el = hostCreateElement(type);
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    hostSetElementText(el, children);
    hostInsert(el, container);
  };
  const patch = (n1, n2, container) => {
    if (n1 === n2) {
      return;
    }
    if (n1 === null) {
      mountElement(n2, container);
    }
  };
  const render = (vnode, container) => {
    patch(container._vnode || null, vnode, container);
    container._vnode = vnode;
  };
  return {
    render
  };
}
export {
  createRenderer
};
//# sourceMappingURL=runtime-core.js.map
