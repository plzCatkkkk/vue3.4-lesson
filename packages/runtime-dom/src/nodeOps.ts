// 主要对节点元素的增删改查
export const nodeOps = {
    // 插入dom元素,anchor为null时，插入到末尾
    // 根据DOM规范，如果el原本就在parent里，不会造成重复，而是移动节点
    insert(el: any, parent: any, anchor: any) {
        parent.insertBefore(el, anchor || null);
    },
    // 移除dom元素
    remove(el: any) {
        const parent = el.parentNode;
        parent && parent.removeChild(el);
    },
    // 创建dom元素
    createElement: (type: string) => document.createElement(type),
    // 创建dom文本
    createText: (text: string) => document.createTextNode(text),
    //给节点设置文本
    setText: (node: any, text: string) => (node.nodeValue = text),
    //给dom元素设置文本
    setElementText: (el: any, text: string) => (el.textContent = text),
    //获取父节点
    parentNode: (node: any) => node.parentNode,
    //获取下一个兄弟节点
    nextSibling: (node: any) => node.nextSibling,
};