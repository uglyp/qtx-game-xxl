import { BlurFilter, Container, Graphics, Texture } from 'pixi.js';
import { Label } from '../ui/Label';
import { RoundedBox } from '../ui/RoundedBox';
import { i18n } from '../utils/i18n';
import gsap from 'gsap';
import { navigation } from '../utils/navigation';

export class Toast extends Container {
    private bg: Container;
    private panel: Container;
    private title: Label;
    private panelBase: Graphics;

    constructor() {
        super();

        this.bg = new Container();
        this.addChild(this.bg);



        this.panelBase = new Graphics();
        // 填充色、透明度
        this.panelBase.beginFill(0x000000, 0.8); // 设置填充颜色
        // 绘制一个圆角矩形，参数依次是：x, y, 宽度, 高度, radius
        this.panelBase.drawRoundedRect(-125, -20, 250, 40, 10);

        this.bg.addChild(this.panelBase);

        this.title = new Label(i18n.pauseTitle, { fill: 0xffffff, fontSize: 14 });
        this.title.y = 0;
        this.panelBase.addChild(this.title);
        this.show();
    }

    public resize(width: number, height: number) {
        this.bg.width = width;
        this.bg.height = height;
    }

    public async show() {
        if (navigation.currentScreen) {
            navigation.currentScreen.filters = [new BlurFilter(5)];
        }
        setTimeout(async () => {
            this.hide();
        }, 2000);
    }

    public async hide() {
        if (navigation.currentScreen) {
            navigation.currentScreen.filters = null;
        }
        this.removeChild(this);

    }
}
