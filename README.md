# qtx-game-xxl

## 项目介绍

- git仓库：https://gitlab.dcps.info:8981/dcps-common/qtx-game-xxl
- node 版本： 16
- 构建工具：pnpm
- 测试分支：test
- 生产分支：master
- 测试环境地址：http://carbontest.dcps.info:8074/file/h5/qtx-game-xxl/
- 生产环境地址：

## 排期表

- canvas画布渲染完成，游戏资源加载完成前loading UI 和页面交互逻辑编码调试
- 进入游戏即开始游戏，逻辑处理，参数处理
- 游戏画布中添加按钮，RippleButton UI编码测试，返回相关逻辑编码，和业务页面联调测试
- 游戏画布中暂停按钮RippleButton UI调整，改变在画布中的位置，弹窗交互编码，弹窗UI编码，ImageButton UI 编码测试
- 游戏画布中设置按钮RippleButton UI调整，弹窗交互，三种音效暂停，游戏进程暂停编码，弹窗UI编码，ImageButton UI 编码测试，游戏音效大小调整调整测试
- 游戏画布中游戏元素、道具、占位图、背景图、动效样式替换，编码测试，游戏流程测试
- 游戏结果画布canvas 绘制，布局样式编码，canvas UI控件编码，得分处理编码
- 游戏结果画布接口对接联调，游戏流程对接
- 游戏支持老版本 IOS、Android 兼容性配置，测试验证
- 游戏和 业务 H5 交互调试

游戏预览地址：http://192.168.0.71:30413


用PixiJS完成的三消游戏。这个项目的目标是提供一个使用PixiJS技术进行专业游戏开发的简单而全面的例子。

该项目建立在以下基于pixijs的库之上:

-   [PixiJS](https://github.com/pixijs/pixijs) 一个为web构建的渲染库。
-   [PixiJS Sound](https://github.com/pixijs/sound) 一个WebAudio API播放库，带有过滤器。
-   [PixiJS UI](https://github.com/pixijs/ui) 用于PixiJS中常用的UI组件。
-   [PixiJS AssetPack](https://github.com/pixijs/assetpack) 编译和优化网络资源。
-   [PixiJS Spine](https://github.com/pixijs/spine) 脊柱动画支持PixiJS。

# 特性

- 一个简单的三消游戏与特殊的道具和效果
- 基本的导航系统来组织视图和弹出窗口
- 使用PixiJS资源包的资源加载管理
- 声音音量和游戏模式的持久用户设置
- 保存和加载分数和最佳分数
- 动画，过渡和视觉效果
- 桌面和移动兼容

# 先决条件

-   NodeJS - https://nodejs.org/
-   NPM - 自带NodeJS，用于包管理

# 设置和运行游戏

```sh

npm install

# 使用AssetPack 编译资源
npm run assets

# 本地运行
npm run dev
```

# 构建和发布游戏

```sh
# 编译构建把产物输出到 ‘/dist’
npm run build

# 预览构建产物
npm run preview

# 如果没有构建静态资源执行该命令
npm run deploy

```

# 编译静态资源

每当你开始或构建项目时，静态资源就会被编译，但在开发过程中，它们不会像普通代码那样被“监视”。如果你在开发过程中添加/修改/删除了任何资源，你必须手动运行 `npm run assets` 来重新编译它们并使更改生效。

# 项目结构

### `./src/main.ts` 文件

入口文件。设置PixiJS应用程序并初始化导航。

### `./src/screens` 文件夹

应用程序显示的所有视图。

### `./src/popups` 文件夹

弹窗 UI 视图

### `./src/match3` 文件夹

游戏本身，所有与三消相关的代码都具有游戏逻辑和棋子视觉效果。

### `./src/ui` 文件夹

所有UI组件跨视图共享。

### `./src/utils` 文件夹

所有共享的实用程序代码。

### `./raw-assets` 文件夹

未编译的资源分组在文件夹中，这些文件夹将被转换成资源包进行加载。
｜

## GSAP
这款游戏使用GSAP制作动画。您可以在一些商业项目中使用免费版的GSAP。但是，请查看[GreenSock](https://greensock.com/licensing/)的许可选项。

