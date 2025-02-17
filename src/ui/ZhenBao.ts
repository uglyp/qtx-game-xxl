import { Container, Sprite } from 'pixi.js';
import gsap from 'gsap';

export class ZhenBao extends Container {
    public static assetBundles = ['result', 'common'];
    private zhenbao: Sprite;
    private container: Container;

    constructor() {
        super();

        this.container = new Container();
        this.addChild(this.container);

        this.zhenbao = Sprite.from('result-zhenbao');
        this.zhenbao.scale.set(0.3);
        this.zhenbao.x = -30;
        this.zhenbao.y = 130;
        this.container.addChild(this.zhenbao);
    }

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

    public async hide(animated = true) {
        gsap.killTweensOf(this.container.scale);
        if (animated) {
            await gsap.to(this.container.scale, { x: 0, y: 0, duration: 0.3, ease: 'back.in' });
        } else {
            this.container.scale.set(0);
        }
        this.visible = false;
    }
}
