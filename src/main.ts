import 'pixi-spine';

import { Application } from 'pixi.js';
import { initAssets } from './utils/assets';
import { navigation } from './utils/navigation';
import { GameScreen } from './screens/GameScreen';
import { HomeScreen } from './screens/HomeScreen';
import { LoadScreen } from './screens/LoadScreen';
import { ResultScreen } from './screens/ResultScreen';
import { TiledBackground } from './ui/TiledBackground';
import { getUrlParam } from './utils/getUrlParams';
import { sound } from '@pixi/sound';




//PixiJS应用程序实例，在整个项目中共享
export const app = new Application<HTMLCanvasElement>({
    resolution: Math.max(window.devicePixelRatio, 2),
    backgroundColor: 0xffffff,
});
globalThis.__PIXI_APP__ = app



// 为应用程序设置一个大小调整功能 
function resize() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const minWidth = 375;
    const minHeight = 700;

    // 根据当前尺寸计算渲染器和画布尺寸
    const scaleX = windowWidth < minWidth ? minWidth / windowWidth : 1;
    const scaleY = windowHeight < minHeight ? minHeight / windowHeight : 1;
    const scale = scaleX > scaleY ? scaleX : scaleY;
    const width = windowWidth * scale;
    const height = windowHeight * scale;

    // 更新画布样式尺寸和向上滚动窗口，以避免移动设备调整大小的问题
    app.renderer.view.style.width = `${windowWidth}px`;
    app.renderer.view.style.height = `${windowHeight}px`;
    window.scrollTo(0, 0);

    // 更新渲染器和导航屏幕尺寸
    app.renderer.resize(width, height);
    navigation.resize(width, height);
    console.log(`Resized to ${width}x${height}`);
}

// 当文档可见性改变时触发-失去或重新获得焦点
function visibilityChange() {
    if (document.hidden) {
        sound.pauseAll();
        navigation.blur();
    } else {
        sound.resumeAll();
        navigation.focus();
    }
}

// 设置应用程序并初始化静态资源
async function init() {

    console.log(getUrlParam('gameId'),'Initializing...');
    // 添加pixi canvas元素(app.view)到文档的主体
    // document.body.div.appendChild(app.view);
    (document.getElementById('main') as HTMLElement).appendChild(app.view);

    // 每当窗口调整大小时，调用'resize'函数
    window.addEventListener('resize', resize);

    // 触发第一次调整大小
    resize();

    // 添加一个可见性监听器，这样应用程序就可以暂停声音和屏幕
    document.addEventListener('visibilitychange', visibilityChange);

    // 设置资源包(见assets.ts)并开始在后台加载所有内容
    await initAssets();

    // 添加所有屏幕共享的持久背景
    navigation.setBackground(TiledBackground);

    // 显示初始加载画面
    await navigation.showScreen(GameScreen);

    // 如果url参数中存在快捷方式，则转到其中一个屏幕，否则转到主屏幕
    // if (getUrlParam('game') !== null) {
    //     await navigation.showScreen(HomeScreen);
    // } else if (getUrlParam('load') !== null) {
    //     await navigation.showScreen(LoadScreen);
    // } else if (getUrlParam('result') !== null) {
    //     await navigation.showScreen(ResultScreen);
    // } else {
    //     await navigation.showScreen(GameScreen);
    // }
}

// 初始化所有事项
init();