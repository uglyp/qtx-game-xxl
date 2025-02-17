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

        this.panel = new Container();
        this.addChild(this.panel);

        let message = localStorage.getItem('codeMessage') ?? '';
        console.log(message.length)
        let toastWidth = 150

        if(message.length > 7){
            toastWidth = 200
        }
        if(message.length > 10){
            toastWidth = 250
        }
        if(message.length > 14){
            toastWidth = 300
        }


        this.panelBase = new Graphics();
        // 填充色、透明度
        this.panelBase.beginFill(0x000000, 0.8); // 设置填充颜色
        // 绘制一个圆角矩形，参数依次是：x, y, 宽度, 高度, radius
        this.panelBase.drawRoundedRect( -(toastWidth / 2), -20, toastWidth, 40, 10);

        this.panel.addChild(this.panelBase);


        this.title = new Label(message, { fill: 0xffffff, fontSize: 14 });
        this.title.y = 0;
        this.panel.addChild(this.title);
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
        gsap.to(this.bg, { alpha: 0.8, duration: 0.5, ease: 'linear' });
        await gsap.to(this.panel.pivot, {
            y: 0,
            duration: 0.1,
            ease: 'linear',
        });
    }

    public async hide() {
        if (navigation.currentScreen) {
            navigation.currentScreen.filters = null;
        }
        gsap.killTweensOf(this.bg);
        gsap.killTweensOf(this.panel.pivot);
        gsap.to(this.bg, { alpha: 0, duration: 0.5, ease: 'linear' });
        await gsap.to(this.panel.pivot, { 
            y: 0, 
            duration: 0.1, 
            ease: 'linear',
            onComplete: () => {
                navigation.dismissPopup();
            }
        });
    }
}
