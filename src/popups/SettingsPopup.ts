import { BlurFilter, Container, Sprite, Texture } from 'pixi.js';
import { Label } from '../ui/Label';
import { LargeButtonConfirm } from '../ui/LargeButtonConfirm';
import { RoundedBox } from '../ui/RoundedBox';
import { i18n } from '../utils/i18n';
import gsap from 'gsap';
import { navigation } from '../utils/navigation';
import { userSettings } from '../utils/userSettings';
import { Layout } from '@pixi/ui';
import { VolumeSlider } from '../ui/VolumeSlider';
import { ModeSwitcher } from '../ui/ModeSwitcher';
import { GameScreen } from '../screens/GameScreen';

export class SettingsPopup extends Container {
    private bg: Sprite;
    private panel: Container;
    private title: Label;
    private doneButton: LargeButtonConfirm;
    private panelBase: RoundedBox;
    private layout: Layout;
    private masterSlider: VolumeSlider;
    private bgmSlider: VolumeSlider;
    private sfxSlider: VolumeSlider;
    private mode: ModeSwitcher;

    constructor() {
        super();

        this.bg = Sprite.from(Texture.WHITE);
        this.bg.tint = 0x0a0025;
        this.bg.interactive = true;
        this.addChild(this.bg);

        this.panel = new Container();
        this.addChild(this.panel);

        this.panelBase = new RoundedBox({ height: 500 });
        this.panel.addChild(this.panelBase);

        this.title = new Label(i18n.settingsTitle, { fill: 0xffd579, fontSize: 50 });
        this.title.y = -this.panelBase.boxHeight * 0.5 + 60;
        this.panel.addChild(this.title);

        this.doneButton = new LargeButtonConfirm();
        this.doneButton.y = this.panelBase.boxHeight * 0.5 - 78;
        this.doneButton.onPress.connect(() => navigation.dismissPopup());
        this.panel.addChild(this.doneButton);

        this.layout = new Layout({ type: 'vertical', elementsMargin: 4 });
        this.layout.x = -140;
        this.layout.y = -90;
        this.panel.addChild(this.layout);

        this.masterSlider = new VolumeSlider(i18n.settingsMaster);
        this.masterSlider.onUpdate.connect((v) => {
            userSettings.setMasterVolume(v / 100);
        });
        this.layout.addChild(this.masterSlider);

        this.bgmSlider = new VolumeSlider(i18n.settingsBgm);
        this.bgmSlider.onUpdate.connect((v) => {
            userSettings.setBgmVolume(v / 100);
        });
        this.layout.addChild(this.bgmSlider);

        this.sfxSlider = new VolumeSlider(i18n.settingsSfx);
        this.sfxSlider.onUpdate.connect((v) => {
            userSettings.setSfxVolume(v / 100);
        });
        this.layout.addChild(this.sfxSlider);

        this.mode = new ModeSwitcher();
        this.mode.onChange.connect(() => {
            userSettings.setGameMode(this.mode.getSelectedMode());
        });
        // this.layout.addChild(this.mode);
        this.mode.y -= 20;
    }

    public resize(width: number, height: number) {
        this.bg.width = width;
        this.bg.height = height;
        this.panel.x = width * 0.5;
        this.panel.y = height * 0.5;
    }

    public prepare() {
        const canChangeMode = !(navigation.currentScreen instanceof GameScreen);
        this.mode.alpha = canChangeMode ? 1 : 0.3;
        this.mode.interactiveChildren = canChangeMode;

        this.masterSlider.value = userSettings.getMasterVolume() * 100;
        this.bgmSlider.value = userSettings.getBgmVolume() * 100;
        this.sfxSlider.value = userSettings.getSfxVolume() * 100;
        this.mode.setSelectedMode(userSettings.getGameMode());
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
