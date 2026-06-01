import { createRenderer } from "@zvue/runtime-core";
import { nodeOps } from "./nodeOps";
import patchProp from "./patchProp";

export * from "@zvue/runtime-core"
export * from "@zvue/reactivity";
export * from "@zvue/shared";


export const renderOptions = Object.assign(nodeOps, { patchProp });

export function render(vnode: any, container: any) { return createRenderer(renderOptions).render(vnode, container) }