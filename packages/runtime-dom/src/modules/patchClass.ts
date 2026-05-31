export default function patchClass(el: any, value: any) {
    if (value == null) {
        //移除类名
        el.removeAttribute('class');
    } else {
        el.className = value;
    }
}