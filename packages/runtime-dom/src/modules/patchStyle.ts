export default function patchStyle(el: any, prevValue: any, nextValue: any) {
    let style = el.style
    // 新旧样式对象比对
    if (nextValue) {
        for (const key in nextValue) {
            style[key] = nextValue[key]  //新样式要全部生效
        }
    }
    if (prevValue) {
        for (const key in prevValue) {
            if (nextValue && !nextValue[key]) {
                style[key] = ''  //旧样式要全部清空
            }
        }
    }
}