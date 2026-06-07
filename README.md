# Vue 3.4 源码学习项目

## 📚 项目介绍

本项目是一个用于深入学习 Vue 3.4 核心原理的教学项目，参考自 [B站视频教程](https://www.bilibili.com/video/BV1zBc2e4EaZ?spm_id_from=333.788.player.switch&vd_source=119352052a8c107c6889d20f932852df&p=9)。

> 💡 **为什么创建这个项目？**  
> 纯看源码太难完全理解了 o(╥﹏╥)o，通过手动实现来加深理解。

---

## 🛠️ 技术栈

- **Vue**: ^3.4.38 - 目标框架版本
- **TypeScript**: 5.4.5 - 类型支持
- **esbuild**: 0.20.2 - 快速构建工具
- **minimist**: ^1.2.8 - 命令行参数解析
- **pnpm**: 包管理器（支持 workspace）

---

## 📦 依赖安装说明

### 生产依赖

```bash
pnpm install vue@3.4
```

### 开发依赖

```bash
pnpm install typescript@5.4.5 esbuild@0.20.2 minimist -D -w
```

**参数说明：**
- `-D` / `--save-dev`: 安装为开发依赖
- `-w` / `--workspace-root`: 安装到工作区根目录（公共依赖）

**依赖用途：**
- `typescript`: TypeScript 语言支持
- `esbuild`: 生产环境构建工具
- `minimist`: 解析命令行参数

### TypeScript 配置初始化

```bash
npx tsc --init
```

生成 `tsconfig.json` 文件，用于 TypeScript 语言配置。

---

## ⚙️ 项目配置

### package.json 脚本配置

```json
{
  "scripts": {
    "dev": "node scripts/dev.js mm -f esm"
  },
  "type": "module"
}
```

**说明：**
- `"type": "module"`: 使用 ES Module 模块化规范
- 执行 `pnpm run dev` 时，参数会被解析为：`{ _: ['mm'], f: 'esm' }`
  - `_`: 位置参数数组
  - `f`: 格式标志（format）

### Monorepo 子包配置

每个子包（如 `packages/reactivity`）都有自己的 `package.json`，用于描述模块信息和依赖关系：

```json
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
```

**字段说明：**
- `main`: CommonJS 版本入口（Node.js 环境）
- `module`: ES Module 版本入口（打包工具优先使用）
- `unpkg`: CDN 全局引用入口（浏览器环境直接引入）
- `types`: TypeScript 类型定义文件
- `files`: 发布时包含的文件/目录，精简包体积
- `buildOptions`: 自定义构建选项
  - `name`: 模块名称
  - `formats`: 支持的输出格式

---

## 🔗 Workspace 依赖管理

### 添加内部包依赖

```bash
pnpm install @vue/shared --workspace --filter @vue/reactivity
```

**参数说明：**
- `--workspace`: 指定当前工作空间
- `--filter @vue/reactivity`: 为目标包添加依赖

> 📝 **注意**: 推荐使用 `workspace:*` 协议在 `package.json` 中声明内部依赖，然后在根目录执行 `pnpm install` 自动链接。

---

## 📌 代码规范

- **TODO 注释**: 仅作为关键知识点标记，用于标注需要重点关注的内容

---

## 📖 学习建议

1. 先理解整体架构和模块划分
2. 从 `shared` 工具包开始，逐步深入到 `reactivity` 响应式系统
3. 结合 B站视频 对照源码学习
4. 动手修改代码并观察构建结果
5. 关注 TODO 标记的关键知识点