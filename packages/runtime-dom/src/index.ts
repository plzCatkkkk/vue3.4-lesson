import { nodeOps } from "./nodeOps";
import patchProp from "./patchProp";

export * from "@zvue/reactivity";
export * from "@zvue/shared";


export const renderOptions = Object.assign(nodeOps, { patchProp });

function createRenderer() { }