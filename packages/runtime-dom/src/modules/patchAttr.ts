export default function patchAttr(el: any, key: string, value: any) {
    if (value == null) {
        el.removeAttribute(key)
    } else {
        el.setAttribute(key, value)
    }
}