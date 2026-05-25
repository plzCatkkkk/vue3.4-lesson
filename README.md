学习源头来自b站视频：https://www.bilibili.com/video/BV1zBc2e4EaZ?spm_id_from=333.788.player.switch&vd_source=119352052a8c107c6889d20f932852df&p=9
纯看源码还是太难完全理解了o(╥﹏╥)o

依赖项说明
pnpm install vue@3.4
- vue@3.4

pnpm install typescript@5.4.5 esbuild@0.20.2 minimist -D -w
typescript 语言支持
esbuild 生产环境构建
minimist 解析命令行参数
-D 开发依赖
-w 公共依赖

npx tsc --init
创建 tsconfig.json 文件
作用：ts 语言配置

<!-- package.json 配置项 -->
"scripts": {
    "dev": "node scripts/dev.js mm -f esm"  
},
获取参数后会解析成{ _: [ 'mm' ], f: 'esm' }
"type": "module" -> 表示使用 ES Module 模块化规范

每个子包内还有package.json，可以描述记录模块之间的依赖关系和模块信息
{
    "name": "@vue/reactivity",
    "version": "1.0.0",
    "main": "dist/reactivity.cjs.js",
    "module": "dist/reactivity.esm-bundler.js",
    "unpkg": "dist/reactivity.global.js",
    "types": "dist/reactivity.d.ts",
    "files": [
        "index.js",
        "dist"
    ],
    "buildOptions": {
        "name": "reactivity",
        "formats": [
            "esm-bundler",
            "cjs",
            "global"
        ]
    }
}
main指向CommonJS版本
module指向ES模块
unpkg用于CDN全局引用(浏览器环境)
types提供TypeScript类型定义
files指定发布时仅包含index.js和dist目录，以精简包体积。
buildOptions为了在打包的时候可以识别出模块的格式，以及指定模块的入口文件。

pnpm install @vue/shared --workspace --filter @vue/reactivity
创建一个名为@vue/shared的包，并添加到workspace中。
--workspace 指定当前工作空间
--filter @vue/reactivity 指定要安装的包