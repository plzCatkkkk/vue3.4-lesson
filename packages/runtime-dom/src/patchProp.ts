// 主要对节点元素属性操作 class style event 普通属性
import patchAttr from './modules/patchAttr';
import patchClass from './modules/patchClass';
import patchEvent from './modules/patchEvent';
import patchStyle from './modules/patchStyle';

// diff 算法中，对属性的更新
export default function patchProp(el: any, key: any, prevValue: any, nextValue: any) {
    if (key === 'class') {
        return patchClass(el, nextValue);  //直接更新类名
    } else if (key === 'style') {
        //更新样式
        patchStyle(el, prevValue, nextValue);
    } else if (/^on[A-Za-z]/.test(key)) {
        // 绑定事件--可能有多个事件
        patchEvent(el, key, nextValue);
    } else {
        //更新普通属性
        patchAttr(el, key, nextValue);
    }
};