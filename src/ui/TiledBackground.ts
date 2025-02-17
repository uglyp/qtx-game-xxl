import { Container, Texture, TilingSprite } from 'pixi.js';
import { app } from '../main';

/**
 * 该应用程序基于 TilingSprite 的动画背景始终出现在屏幕上 
 */
export class TiledBackground extends Container {
    /** 背景应动画化的方向  */
    public direction = -Math.PI * 0.15;
    /** 将重复图案的平铺精灵  */
    private sprite: TilingSprite;

    constructor() {
        super();

        this.sprite = new TilingSprite(
            Texture.from('background'),
            app.screen.width,
            app.screen.height,
        );
        this.sprite.tileTransform.rotation = this.direction;
        this.addChild(this.sprite);
    }

    /** 获取精灵的宽度  */
    public get width() {
        return this.sprite.width;
    }

    /** 设置精灵的宽度  */
    public set width(value: number) {
        this.sprite.width = value;
    }

    /** 获取精灵高度  */
    public get height() {
        return this.sprite.height;
    }

    /** 设置精灵高度  */
    public set height(value: number) {
        this.sprite.height = value;
    }

    /** 通过覆盖容器的更新变换进行自动更新  */
    public updateTransform() {
        super.updateTransform();
        const delta = app.ticker.deltaTime;
        this.sprite.tilePosition.x -= Math.sin(-this.direction) * delta;
        this.sprite.tilePosition.y -= Math.cos(-this.direction) * delta;
    }

    /** 调整背景大小，每当窗口大小改变时触发   */
    public resize(width: number, height: number) {
        this.width = width;
        this.height = height;
    }
}
