import { Container, NineSlicePlane, Texture } from 'pixi.js';
import { navigation } from '../utils/navigation';
import { GameScreen } from './GameScreen';
import gsap from 'gsap';
import { i18n } from '../utils/i18n';
import { LargeButton } from '../ui/LargeButton';
import { registerCustomEase } from '../utils/animation';
import { Logo } from '../ui/Logo';
import { Dragon } from '../ui/Dragon';
import { waitFor } from '../utils/asyncUtils';
import { SmallButton } from '../ui/SmallButton';
import { ImageButton } from '../ui/ImageButton';
import { RippleButton } from '../ui/RippleButton';
import { SettingsPopup } from '../popups/SettingsPopup';
import { bgm } from '../utils/audio';

/** Custom ease curve for y animation of the base to reveal the screen */
const easeSoftBackOut = registerCustomEase(
    'M0,0,C0,0,0.05,0.228,0.09,0.373,0.12,0.484,0.139,0.547,0.18,0.654,0.211,0.737,0.235,0.785,0.275,0.864,0.291,0.896,0.303,0.915,0.325,0.944,0.344,0.97,0.356,0.989,0.38,1.009,0.413,1.039,0.428,1.073,0.604,1.074,0.72,1.074,0.822,1.035,0.91,1.011,0.943,1.002,1,1,1,1',
);

/** loading后显示的第一个视图 */
export class HomeScreen extends Container {
    /** 此视图所需的资源包 */
    public static assetBundles = ['home', 'common'];
    /** 游戏 logo */
    private logo: Logo;
    /** 会动的龙 */
    private dragon: Dragon;
    /** 开始游戏按钮 */
    private playButton: LargeButton;
    /** github 链接 */
    private githubButton: SmallButton;
    /** pixijs文档链接 */
    private pixiButton: ImageButton;
    /** info 面板 */
    /** 设置按钮，打开设置面板 */
    private settingsButton: RippleButton;
    /** The footer base, also used for transition in */
    private base: NineSlicePlane;

    constructor() {
        super();

        this.logo = new Logo();
        this.addChild(this.logo);

        this.dragon = new Dragon();
        this.dragon.playIdle();
        this.addChild(this.dragon);

        this.base = new NineSlicePlane(Texture.from('rounded-rectangle'), 32, 32, 32, 32);
        this.base.tint = 0x2c136c;
        this.addChild(this.base);

        this.settingsButton = new RippleButton({
            image: 'icon-settings',
            ripple: 'icon-settings-stroke',
        });
        this.settingsButton.onPress.connect(() => navigation.presentPopup(SettingsPopup));
        this.addChild(this.settingsButton);

        this.githubButton = new SmallButton({ text: i18n.githubButton });
        this.githubButton.onPress.connect(() => window.open(i18n.urlGithub, 'blank'));
        this.addChild(this.githubButton);

        this.pixiButton = new ImageButton({ image: 'logo-pixi', scaleOverride: 0.75 });
        this.pixiButton.onPress.connect(() => window.open(i18n.urlPixi, 'blank'));
        this.addChild(this.pixiButton);

        this.playButton = new LargeButton({ text: i18n.playButton });
        this.playButton.onPress.connect(() => navigation.showScreen(GameScreen));
        this.addChild(this.playButton);
    }

    /** 浏览器窗口变化时触发视图重绘 */
    public resize(width: number, height: number) {
        this.dragon.x = width * 0.5;
        this.dragon.y = height * 0.5;
        this.playButton.x = width * 0.5;
        this.playButton.y = height - 130;
        this.base.width = width;
        this.base.y = height - 140;
        this.logo.x = width * 0.5;
        this.logo.y = height * 0.2;
        this.githubButton.x = width - 50;
        this.githubButton.y = height - 40;
        this.pixiButton.x = 50;
        this.pixiButton.y = height - 40;
        this.settingsButton.x = width - 30;
        this.settingsButton.y = 30;
    }

    /** Show screen with animations */
    public async show() {
        bgm.play('common/bgm-main.mp3', { volume: 0.7 });

        // 重置视觉状态，隐藏稍后显示的内容
        this.playButton.hide(false);
        this.pixiButton.hide(false);
        this.settingsButton.hide(false);
        this.githubButton.hide(false);
        this.dragon.show(false);
        this.logo.show(false);

        // 播放显示动画
        this.playRevealAnimation();

        // 按顺序显示组件
        await waitFor(0.5);
        await this.playButton.show();
        this.interactiveChildren = true;

        // 隐藏四个按钮

        await this.settingsButton.show();
        // this.pixiButton.show();
        // await this.githubButton.show();
    }

    public async hide() {
        this.playButton.hide();
        this.pixiButton.hide();
        this.githubButton.hide();
        await waitFor(0.1);
        gsap.to(this.base.pivot, { y: -200, duration: 0.3, ease: 'back.in' });
        await waitFor(0.1);
        this.logo.hide();
        await waitFor(0.1);
        await this.dragon.hide();
    }

    /** 用于显示紫色精灵后面的视图的动画 */
    private async playRevealAnimation() {
        const duration = 1;
        const ease = easeSoftBackOut;

        gsap.killTweensOf(this.base);
        gsap.killTweensOf(this.base.pivot);

        // 使单色底座覆盖整个视图，与视觉状态相匹配
        // 加载屏幕左侧
        this.base.height = navigation.height * 1.25;
        this.base.pivot.y = navigation.height;

        // 制作动画以露出视图并放在底部
        gsap.to(this.base, {
            height: 200,
            duration,
            ease,
        });
        await gsap.to(this.base.pivot, {
            y: 0,
            duration,
            ease,
        });
    }
}
