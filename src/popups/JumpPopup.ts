import { BlurFilter, Container, Sprite, Texture } from 'pixi.js';
import { Label } from '../ui/Label';
import { LargeButtonConfirm } from '../ui/LargeButtonConfirm';
import { LargeButtonBack } from '../ui/LargeButtonBack';
import { RoundedBox } from '../ui/RoundedBox';
import { i18n } from '../utils/i18n';
import gsap from 'gsap';
import { navigation } from '../utils/navigation';
import { jump } from '../utils/common';


export class JumpPopup extends Container {
    private bg: Sprite;
    private panel: Container;
    private title: Label;
    private doneButton: LargeButtonConfirm;
    private backButton: LargeButtonBack;
    private panelBase: RoundedBox;

    constructor() {
        super();

        this.bg = Sprite.from(Texture.WHITE);
        this.bg.tint = 0x0a0025;
        this.bg.interactive = true;
        this.addChild(this.bg);

        this.panel = new Container();
        this.addChild(this.panel);

        this.panelBase = new RoundedBox({ height: 450 });
        this.panel.addChild(this.panelBase);

        this.title = new Label(i18n.infoTitle, { fill: 0xffd579, fontSize: 50 });
        this.title.y = -120;
        this.panel.addChild(this.title);

        this.doneButton = new LargeButtonConfirm();
        this.doneButton.y = 40;
        this.doneButton.onPress.connect(() => jump());
        this.panel.addChild(this.doneButton);

        this.backButton = new LargeButtonBack();
        this.backButton.y = 150;
        this.backButton.onPress.connect(() => navigation.dismissPopup());
        this.panel.addChild(this.backButton);
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
