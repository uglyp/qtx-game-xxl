import { Assets, Container, Sprite, Texture } from 'pixi.js';
import { Spine } from 'pixi-spine';
import gsap from 'gsap';
import { randomRange } from '../utils/random';
import { registerCustomEase } from '../utils/animation';
import { pool } from '../utils/pool';

/** 用于飞溅水滴 Y 动画的自定义缓动曲线  */
const easeDropJumpOut = registerCustomEase('M0,0,C0,0,0.07,-0.63,0.402,-0.422,0.83,-0.152,1,1,1,1');

/**
 * 脊柱动画的坩埚，具有一些动态功能，例如
 * 播放飞溅动画并设置一个跟随脊柱动画的内部精灵。 
 */
export class Cauldron extends Container {
    /** 大锅的内容器  */
    private container: Container;
    /** 可选的坩埚阴影，显示在游戏屏幕上  */
    private shadow: Sprite;
    /** 大锅脊柱动画  */
    private spine: Spine;
    /** 附着在大锅上的可选内容，将跟随其动画 */
    private content?: Container;

    constructor(shadow = false) {
        super();

        this.container = new Container();
        this.addChild(this.container);

        this.shadow = Sprite.from('circle');
        this.shadow.anchor.set(0.5);
        this.shadow.width = 180;
        this.shadow.height = 40;
        this.shadow.tint = 0x262626;
        this.shadow.alpha = 0.2;
        this.shadow.y = 40;
        this.shadow.visible = shadow;
        this.container.addChild(this.shadow);

        const skeleton = Assets.cache.get('preload/cauldron-skeleton.json');
        this.spine = new Spine(skeleton.spineData);
        this.spine.autoUpdate = true;
        this.spine.y = 50;
        this.spine.state.setAnimation(0, 'animation', true);
        this.container.addChild(this.spine);
    }

    /** 展示大锅  */
    public async show(animated = true) {
        gsap.killTweensOf(this.container.scale);
        this.visible = true;
        if (animated) {
            this.container.scale.set(0);
            await gsap.to(this.container.scale, { x: 1, y: 1, duration: 0.3, ease: 'back.out' });
        } else {
            this.container.scale.set(1);
        }
    }

    /** 隐藏大锅  */
    public async hide(animated = true) {
        gsap.killTweensOf(this.container.scale);
        if (animated) {
            await gsap.to(this.container.scale, { x: 0, y: 0, duration: 0.3, ease: 'back.in' });
        } else {
            this.container.scale.set(0);
        }
        this.visible = false;
    }

    /** 飞溅物从大锅中溅出  */
    public async playSplash(x: number, numDrops = 6) {
        this.playWobble();
        const animPromises = [];
        for (let i = 0; i < numDrops; i++) {
            animPromises.push(this.playSplashDrop(x));
        }
        await Promise.all(animPromises);
    }

    /** 从大锅中溅出一滴水珠  */
    private async playSplashDrop(x: number) {
        const duration = randomRange(0.4, 0.6);
        const drop = pool.get(CauldronCircle);
        drop.x = x + randomRange(-10, 10);
        drop.y = -45;
        this.addChild(drop);
        await drop.playSplashDrop(
            {
                x: x + randomRange(-100, 100),
                y: randomRange(30, 70),
            },
            randomRange(0.03, 0.07),
            duration,
        );
        this.removeChild(drop);
        pool.giveBack(drop);
    }

    /** 使大锅快速产生冲击性晃动  */
    public async playWobble() {
        gsap.killTweensOf(this.spine.scale);
        const scaleX = randomRange(1.1, 1.2);
        const scaley = randomRange(0.8, 0.9);
        await gsap.to(this.spine.scale, { x: scaleX, y: scaley, duration: 0.05, ease: 'linear' });
        await gsap.to(this.spine.scale, { x: 1, y: 1, duration: 0.8, ease: 'elastic.out' });
    }

    /** 在坩埚的前面添加一个将跟随脊椎动画的精灵  */
    public addContent(content: Container) {
        if (!this.content) this.content = new Container();
        this.spine.addChild(this.content);
        this.content.addChild(content);
    }

    /** 通过覆盖容器的更新变换进行自动更新  */
    public updateTransform() {
        super.updateTransform();
        if (!this.content) return;
        const bone = this.spine.skeleton.bones[1] as any;
        this.content.x = bone.ax;
        this.content.y = -bone.ay - 5;
        this.content.rotation = bone.arotation * -0.015;
    }
}

/** 一口大锅掉落了其内部的东西，将以飞溅动画呈现  */
class CauldronCircle extends Sprite {
    constructor() {
        super();
        this.texture = Texture.from('circle');
        this.anchor.set(0.5);
        this.tint = 0x2c136c;
    }

    public async playSplashDrop(to: { x: number; y: number }, scale: number, duration: number) {
        gsap.killTweensOf(this);
        gsap.killTweensOf(this.scale);
        this.scale.set(scale);
        this.alpha = 1;
        gsap.to(this.scale, { x: scale * 3, y: scale * 3, duration, ease: 'linear' });
        gsap.to(this, { alpha: 0, duration: 0.1, ease: 'linear', delay: duration - 0.1 });
        gsap.to(this, { x: to.x, duration, ease: 'linear' });
        await gsap.to(this, { y: to.y, duration, ease: easeDropJumpOut });
    }
}
