// 这个文件会帮我们打包 packages 目录下的代模块，最终打包出js文件
// 对应到package.json中的scripts中的dev

// node dev.js (模块名 -f 打包格式) = argv

// 获取命令行参数
import minimist from "minimist";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import esbuild from "esbuild";

const argv = minimist(process.argv.slice(2));

// node中esm模块没有__dirname
// 手动处理出__dirname
const __filename = fileURLToPath(import.meta.url); //获取文件的绝对路径 file: -> /user
const __dirname = resolve(__filename, "../");
const require = createRequire(import.meta.url);

// 获取模块名，优先从 _ 中获取第一个非选项参数
const moduleName = argv._[0] || "index";
//打包后的模块化规范
const format = argv.f || "iife";

// 入口文件
const entry = resolve(__dirname, `../packages/${moduleName}/src/index.ts`);
// JSON对象可以require获取
const pkg = require(`../packages/${moduleName}/package.json`);

console.log(__filename, __dirname, require);

// 根据需要进行打包
esbuild.context({
    entryPoints: [entry],
    bundle: true,  // 将依赖模块的代码直接内嵌到输出文件中，而不是保留引用关系
    outfile: resolve(__dirname, `../packages/${moduleName}/dist/${moduleName}.js`),
    platform: "browser",  //打包成浏览器可识别的代码
    sourcemap: true,  //可以调试源码
    format: format,
    globalName: pkg.buildOptions?.name,
}).then((ctx) => {
    console.log(`${moduleName} build success`);
    return ctx.watch();  // 监听文件变化持续进行打包处理
});