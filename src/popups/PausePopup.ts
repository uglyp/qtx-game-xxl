import { BlurFilter, Container, Sprite, Texture } from 'pixi.js';
import { Label } from '../ui/Label';
import { LargeButtonBack } from '../ui/LargeButtonBack';
import { RoundedBox } from '../ui/RoundedBox';
import { i18n } from '../utils/i18n';
import gsap from 'gsap';
import { navigation } from '../utils/navigation';

export class PausePopup extends Container {
    private bg: Sprite;
    private panel: Container;
    private title: Label;
    private doneButton: LargeButtonBack;
    private panelBase: RoundedBox;

    constructor() {
        super();

        this.bg = Sprite.from(Texture.WHITE);
        this.bg.tint = 0x0a0025;
        this.bg.interactive = true;
        this.addChild(this.bg);

        this.panel = new Container();
        this.addChild(this.panel);

        this.panelBase = new RoundedBox({ height: 300 });
        this.panel.addChild(this.panelBase);

        this.title = new Label(i18n.pauseTitle, { fill: 0xffd579, fontSize: 50 });
        this.title.y = -80;
        this.panel.addChild(this.title);

        this.doneButton = new LargeButtonBack();
        this.doneButton.y = 70;
        this.doneButton.onPress.connect(() => navigation.dismissPopup());
        this.panel.addChild(this.doneButton);
    }

    public resize(width: number, height: number) {
        this.bg.width = width;
        this.bg.height = height;
        this.panel.x = width * 0.5;
        this.panel.y = height * 0.5;
    }

    public async show() {
        if (navigation.currentScreen) {
            navigation.currentScreen.filters = [new BlurFilter(5)];
        }
        gsap.killTweensOf(this.bg);
        gsap.killTweensOf(this.panel.pivot);
        this.bg.alpha = 0;
        this.panel.pivot.y = -400;
        gsap.to(this.bg, { alpha: 0.8, duration: 0.2, ease: 'linear' });
        await gsap.to(this.panel.pivot, { y: 0, duration: 0.3, ease: 'back.out' });
    }

    public async hide() {
        if (navigation.currentScreen) {
            navigation.currentScreen.filters = null;
        }
        gsap.killTweensOf(this.bg);
        gsap.killTweensOf(this.panel.pivot);
        gsap.to(this.bg, { alpha: 0, duration: 0.2, ease: 'linear' });
        await gsap.to(this.panel.pivot, { y: -500, duration: 0.3, ease: 'back.in' });
    }
}
