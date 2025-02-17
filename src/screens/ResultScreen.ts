import { Container, NineSlicePlane, Sprite, Texture, Graphics } from 'pixi.js';
import gsap from 'gsap';
import { Label } from '../ui/Label';
import { i18n } from '../utils/i18n';
import { ResultStars } from '../ui/ResultStars';
import { Dragon } from '../ui/Dragon';
import { LargeButtonConfirm } from '../ui/LargeButtonConfirm';
import { GameScreen } from './GameScreen';
import { navigation } from '../utils/navigation';
import { CloudLabel } from '../ui/CloudLabel';
import { ResultScore } from '../ui/ResultScore';
import { RippleButton } from '../ui/RippleButton';
import { SettingsPopup } from '../popups/SettingsPopup';
import { bgm, sfx } from '../utils/audio';
import { userSettings } from '../utils/userSettings';
import { waitFor } from '../utils/asyncUtils';
import { MaskTransition } from '../ui/MaskTransition';
import { userStats } from '../utils/userStats';
import { ImageButton } from '../ui/ImageButton';
import { RoundedBox } from '../ui/RoundedBox';
import { jump, errorRemind, getStatusBarHeight } from '../utils/common';
import { iv, encrypt } from '../utils/crypto';


import { getUrlParam } from '../utils/getUrlParams';
import { gameOver, getGameProps, doubleProp } from '../api/index';

// actId: '020fceb12fda440fa8a322951a4719aa';
// baseScore: '521';
// createBy: null;
// createTime: '2024-09-06T13:52:58.494';
// cycle: '3';
// doubleScore: '521';
// doubleTime: null;
// endTime: '2024-09-06T05:53:02.339+00:00';
// gameType: 'xiaoxiaole';
// id: '1831933591257350145';
// multiple: 0;
// ownerId: '100195';
// startTime: '2024-09-06T05:52:58.494+00:00';
// updateBy: null;
// updateTime: '2024-09-06T13:53:02.339';

interface finalGameProps {
    multiple: number;
    baseScore: string;
    doubleScore: string;
}

interface propsType {
    propId: string;
    propType: string;
    propBalance: string;
}


/** 在游戏结束后出现，显示分数和等级  */
export class ResultScreen extends Container {
    /** 此屏幕所需的资产包  */
    public static assetBundles = ['result', 'common'];
    /**游戏结束返回的数据 */
    private gameProps: finalGameProps;
    /** 道具数据 */
    private propsInfo: propsType;
    /** 包含结果的居中框区域  */
    private panel: Container;
    private dragonImage: Sprite;
    /** 动画龙  */
    private dragon: Container;
    /** 面板背景  */
    private panelBase: RoundedBox;
    /**本次得分  */
    private scoreLabel: Label;
    /** 当前游戏模式中的游戏玩法最终得分 additional  */
    private score: Label;

    /**额外得分  */
    private additionalLabel: Label;
    /**道具使用数量圆角容器  */
    private additionalBox: Graphics;
    /**道具使用数量  */
    private additionalData: Label;

    /**使用道具方格容器  */
    private usePropsBox: Graphics;

    /**使用翻倍卡图片  */
    private remindImage: Sprite;

    /**可使用翻倍卡数量  */
    private canUseNum: Label;

    /**加号  */
    private plusImage: ImageButton;

    /**减号  */
    private minusImage: ImageButton;

    /**可使用翻倍卡数量  */
    private useRemindLabel: Label;

    /**加减翻倍卡数量的容器  */
    private propsChangeBox: Graphics;
    /**加减的翻倍卡数量  */
    private propsNum: Label;

    /** 获得道具 label  */
    private getPropsLabel: Label;
    /** 获得道具  */
    private getPropsNum: Label;

    /** 最终得分 label  */
    private finalScoreLabel: Label;
    /** 最终得分  */
    private finalScore: Label;

    /** 页脚底部  */
    private bottomBase: NineSlicePlane;
    /** 返回游戏再次游玩的按钮  */
    private continueButton: LargeButtonConfirm;
    /** 打开设置面板的按钮  */
    private settingsButton: RippleButton;
    /**一种暂时遮蔽整个屏幕的特殊过渡  */
    private maskTransition?: MaskTransition;

    constructor() {
        super();


        this.settingsButton = new RippleButton({
            image: 'icon-settings',
            ripple: 'icon-settings-stroke',
        });
        this.settingsButton.onPress.connect(() => navigation.presentPopup(SettingsPopup));
        this.addChild(this.settingsButton);

        this.dragon = new Container();
        this.dragon.width = 192;
        this.dragon.height = 111;
        this.addChild(this.dragon);

        this.dragonImage = Sprite.from('result-zhenbao');
        this.dragonImage.width = 192;
        this.dragonImage.height = 111;
        this.dragon.addChild(this.dragonImage);

        this.panel = new Container();
        this.addChild(this.panel);

        // 容器中添加图片
        // this.panelBase = Sprite.from('result-base');
        // this.panelBase.anchor.set(0.5);
        // this.panel.addChild(this.panelBase);

        this.panelBase = new RoundedBox({ height: 375, shadow: false });
        this.panel.addChild(this.panelBase);

        this.scoreLabel = new Label('', { fill: 0xffffff, align: 'left', fontSize: 19 });
        this.scoreLabel.y = -153;
        this.scoreLabel.x = -91;
        this.panel.addChild(this.scoreLabel);

        this.score = new Label('', {
            fill: 0xffda00,
            align: 'right',
            fontSize: 19,
            fontWeight: 'bold',
        });
        this.score.y = -153;
        this.score.x = 91;
        this.panel.addChild(this.score);

        this.additionalLabel = new Label('', { fill: 0xffffff, align: 'left', fontSize: 19 });
        this.additionalLabel.y = -118;
        this.additionalLabel.x = -91;
        this.panel.addChild(this.additionalLabel);

        this.additionalBox = new Graphics();
        this.additionalBox.beginFill(0xffda00); // 设置填充颜色
        // 绘制一个圆角矩形，参数依次是：x, y, 宽度, 高度, radius
        this.additionalBox.drawRoundedRect(60, -128, 64, 25, 12);
        this.panel.addChild(this.additionalBox);

        this.additionalData = new Label('', {
            fill: 0x352082,
            align: 'center',
            fontSize: 19,
            fontWeight: 'bold',
        });
        this.additionalData.anchor.set(0.5, 0.5); // 文本锚点设置为中心
        this.additionalData.y = -116;
        this.additionalData.x = 94;
        this.additionalBox.addChild(this.additionalData);

        this.usePropsBox = new Graphics();
        this.usePropsBox.lineStyle(1, 0x000000, 1); // 设置边框
        this.usePropsBox.beginFill(0x4C29A2); // 设置填充颜色
        // 绘制一个圆角矩形，参数依次是：x, y, 宽度, 高度, radius
        this.usePropsBox.drawRoundedRect(-135, -90, 270, 187, 21);
        this.panel.addChild(this.usePropsBox);

        this.remindImage = Sprite.from('result-remind');
        this.remindImage.width = 133;
        this.remindImage.height = 30;
        this.remindImage.x = -65;
        this.remindImage.y = -72;
        this.panel.addChild(this.remindImage);

        this.canUseNum = new Label('', { fill: 0xffffff, align: 'center', fontSize: 18 });
        this.canUseNum.y = -23;
        this.panel.addChild(this.canUseNum);

        this.plusImage = new ImageButton({ image: 'result-plus' });
        this.plusImage.width = 32;
        this.plusImage.height = 32;
        this.plusImage.x = 81;
        this.plusImage.y = 28;
        this.plusImage.onPress.connect(() => this.changeProps('plus'));
        this.panel.addChild(this.plusImage);

        this.minusImage = new ImageButton({ image: 'result-minus' });
        this.minusImage.width = 32;
        this.minusImage.height = 32;
        this.minusImage.x = -79;
        this.minusImage.y = 28;
        this.minusImage.onPress.connect(() => this.changeProps('minus'));
        this.panel.addChild(this.minusImage);

        this.propsChangeBox = new Graphics();
        this.propsChangeBox.beginFill(0x2C136C); // 设置填充颜色
        // 绘制一个圆角矩形，参数依次是：x, y, 宽度, 高度, radius
        this.propsChangeBox.drawRoundedRect(-53, 9, 107, 40, 8);
        this.panel.addChild(this.propsChangeBox);

        this.propsNum = new Label('', { fill: 0xffffff, align: 'center', fontSize: 28 });
        this.propsNum.y = 28;
        this.panel.addChild(this.propsNum);

        this.useRemindLabel = new Label('', { fill: 0xffffff, align: 'center', fontSize: 13 });
        this.useRemindLabel.text = '使用后本次游戏分数x2 可叠加';
        this.useRemindLabel.y = 75;
        this.panel.addChild(this.useRemindLabel);

        this.finalScoreLabel = new Label('', { fill: 0xffffff, align: 'left', fontSize: 19 });
        this.finalScoreLabel.y = 118;
        this.finalScoreLabel.x = -91;
        this.panel.addChild(this.finalScoreLabel);

        this.finalScore = new Label('', {
            fill: 0xffda00,
            align: 'right',
            fontSize: 19,
            fontWeight: 'bold',
        });
        this.finalScore.y = 118;
        this.finalScore.x = 91;
        this.panel.addChild(this.finalScore);

        this.getPropsLabel = new Label('', { fill: 0xffffff, align: 'left', fontSize: 19 });
        this.getPropsLabel.y = 153;
        this.getPropsLabel.x = -91;
        this.panel.addChild(this.getPropsLabel);

        this.getPropsNum = new Label('', {
            fill: 0xffda00,
            align: 'right',
            fontSize: 19,
            fontWeight: 'bold',
        });
        this.getPropsNum.y = 153;
        this.getPropsNum.x = 91;
        this.panel.addChild(this.getPropsNum);

        this.bottomBase = new NineSlicePlane(Texture.from('rounded-rectangle'), 32, 32, 32, 32);
        this.bottomBase.tint = 0x2c136c;
        this.bottomBase.height = 200;
        this.addChild(this.bottomBase);

        this.continueButton = new LargeButtonConfirm();
        this.addChild(this.continueButton);
        this.continueButton.onPress.connect(() => this.doubleProp());

        this.maskTransition = new MaskTransition();
    }

    /** Prepare the screen just before showing 在展示之前准备好屏幕  */
    public async prepare() {
        this.bottomBase.visible = false;
        this.continueButton.visible = false;
        this.panel.visible = false;
        this.dragon.visible = false;

        this.scoreLabel.text = `本次得分`;
        this.additionalLabel.text = `额外加成`;
        this.finalScoreLabel.text = '最终得分';
        this.getPropsLabel.text = `获得道具`;
        // const mode = userSettings.getGameMode();
        // const performance = userStats.load(mode);
        
    }

    /** 调整屏幕大小，每当窗口大小改变时触发  */
    public resize(width: number, height: number) {
        this.dragon.x = width * 0.5 - 96;
        this.dragon.y = height * 0.5 - 295;
        this.panel.x = width * 0.5;
        this.panel.y = height * 0.5;
        this.continueButton.x = width * 0.5;
        this.continueButton.y = height - 90;
        this.bottomBase.width = width;
        this.bottomBase.y = height - 100;
        this.settingsButton.x = width - 30;
        this.settingsButton.y = 30 + getStatusBarHeight();
    }

    /** 显示带有动画的屏幕  */
    public async show() {
        bgm.play('common/bgm-main.mp3', { volume: 0.5 });
        // 游戏屏幕隐藏为覆盖视口的单一颜色，该颜色会被替换
        // 通过这种过渡，显示此屏幕
        // 不要转场动画
        // this.maskTransition?.playTransitionIn();

        // 在显示所有屏幕组件之前稍等片刻
        await waitFor(0.5);
        const mode = userSettings.getGameMode();
        const performance = userStats.load(mode);
        // TODO 游戏结束后获取道具待处理
        errorRemind('0001');
        await this.getGameProps();
        await this.finishGame(performance.score);
        this.showDragon();
        await this.showPanel();
        console.log(this.gameProps, '游戏结束返回的参数');
        this.score.text = performance.score;
        console.log('得分', performance.score);
        if (this.gameProps?.multiple === 2) {
            this.finalScore.text = performance.score * 2;
            this.additionalData.text = `X2倍`;
        } else {
            this.finalScore.text = performance.score;
            this.additionalData.text = `无`;
        }
        if (performance.score >= 800) {
            this.getPropsNum.text = `翻倍卡 1 个`;
        } else {
            this.getPropsNum.text = `无`;
        }
        this.canUseNum.text = `可使用 ${this.propsInfo?.propBalance} 个`;
        this.propsNum.text = 0;
        await this.animateGradeMessage(performance.grade);
        this.showBottom();
    }

    /** 翻倍卡加减方法 */
    public changeProps(type) {
        if (type === 'plus') {
            if (parseInt(this.propsNum.text) >= parseInt(this.propsInfo.propBalance)) {
                return;
            }
            this.propsNum.text = parseInt(this.propsNum.text) + 1;
            if (this.gameProps?.multiple === 2) {
                if (parseInt(this.propsNum.text) > 48) {
                    this.additionalData.style.fontSize = 14;
                }
                this.finalScore.text =
                    parseInt(this.gameProps.baseScore) * (parseInt(this.propsNum.text) + 1) * 2;
                this.additionalData.text = `X${(parseInt(this.propsNum.text) + 1) * 2}倍`;
            } else {
                if (parseInt(this.propsNum.text) > 49) {
                    this.additionalData.style.fontSize = 14;
                }
                this.finalScore.text =
                    parseInt(this.gameProps.doubleScore) * parseInt(this.propsNum.text) * 2;
                this.additionalData.text = `X${parseInt(this.propsNum.text) * 2}倍`;
            }
        } else {
            if (parseInt(this.propsNum.text) < 1) {
                console.log('小于0', this.finalScore.text, this.propsNum.text);
                return;
            }
            this.propsNum.text = parseInt(this.propsNum.text) - 1;
            if (parseInt(this.propsNum.text) == 0) {
                if (this.gameProps?.multiple === 2) {
                    this.additionalData.text = `X2倍`;
                } else {
                    this.additionalData.text = `无`;
                }
                this.finalScore.text = parseInt(this.gameProps.doubleScore);
                console.log('等于0', this.finalScore.text, this.propsNum.text);
                return;
            }
            console.log('大于0', this.finalScore.text, this.propsNum.text);
            if (this.gameProps?.multiple === 2) {
                this.additionalData.text = `X${(parseInt(this.propsNum.text) + 1) * 2}倍`;
                this.finalScore.text =
                    parseInt(this.gameProps.baseScore) * (parseInt(this.propsNum.text) + 1) * 2;
                if (parseInt(this.propsNum.text) < 49) {
                    this.additionalData.style.fontSize = 19;
                }
            } else {
                this.additionalData.text = `X${parseInt(this.propsNum.text) * 2}倍`;
                this.finalScore.text =
                    parseInt(this.gameProps.baseScore) * parseInt(this.propsNum.text) * 2;
                if (parseInt(this.propsNum.text) < 50) {
                    this.additionalData.style.fontSize = 19;
                }
            }
        }
    }

    public encryptByAES(data) {
        const isQtx = getUrlParam('channel') === 'qtx';
        const isQdMetro = getUrlParam('channel') === 'qdmetro';
        const ua = navigator.userAgent || '';
        const isIos = /iphone|ipod/i.test(ua);
        const objStr = JSON.stringify(data);
        if (isQtx) {
            console.log('执行青碳行app加密', objStr);
            if (isIos) {
                const message = {
                    content: objStr,
                    iv,
                    callBack: 'APPEncryptionCallBack',
                };
                console.log('执行青碳行app加密1', message);
                window.APPEncryptionCallBack = (obj) => {

                console.log('执行青碳行app加密2', obj.text);
                let params = {
                    data: obj.text,
                    iv: iv,
                    channel: getUrlParam('channel') ?? 'qtx',
                };
                return gameOver(params).then((res) => {
                    console.log('游戏结束', res);
                    if (res.respcod == '01') {
                        this.gameProps = res.data;
                    } else {
                        errorRemind(res.respcod);
                    }
                });
                };
                window.webkit.messageHandlers.QTX_H5_ENCRYPT_AES.postMessage(message);
            } else {
                const sign = window.CarbonWebView.encryptByAES(objStr, iv);
                let params = {
                    data: sign,
                    iv: iv,
                    channel: getUrlParam('channel') ?? 'qtx',
                };
                return gameOver(params).then((res) => {
                    console.log('游戏结束', res);
                    if (res.respcod == '01') {
                        this.gameProps = res.data;
                    } else {
                        errorRemind(res.respcod);
                    }
                });
                
            }
        } else if (isQdMetro) {
            if (isIos) {
                const message = {
                    content: objStr,
                    iv,
                    callBack: 'APPEncryptionCallBack',
                };
                window.APPEncryptionCallBack = (obj) => {
                    let params = {
                        data: obj.text,
                        iv: iv,
                        channel: getUrlParam('channel') ?? 'qtx',
                    };
                    return gameOver(params).then((res) => {
                        console.log('游戏结束', res);
                        if (res.respcod == '01') {
                            this.gameProps = res.data;
                        } else {
                            errorRemind(res.respcod);
                        }
                    });
                    
                };
                window.webkit.messageHandlers.QDMETRO_H5_ENCRYPT_AES.postMessage(message);
            } else {
                const sign = window.AndroidWebView.encryptByAES(objStr, iv);
                let params = {
                    data: sign,
                    iv: iv,
                    channel: getUrlParam('channel') ?? 'qtx',
                };
                return gameOver(params).then((res) => {
                    console.log('游戏结束', res);
                    if (res.respcod == '01') {
                        this.gameProps = res.data;
                    } else {
                        errorRemind(res.respcod);
                    }
                });
            }
        }else {
            let params = {
                data: encrypt(objStr),
                iv: iv,
                channel: getUrlParam('channel') ?? 'qtx',
            };
            return gameOver(params).then((res) => {
                console.log('游戏结束', res);
                if (res.respcod == '01') {
                    this.gameProps = res.data;
                } else {
                    errorRemind(res.respcod);
                }
            });
        }
    }


    public async finishGame(score) {
        let encryptData = {
            gameId: getUrlParam('gameId') ?? localStorage.getItem('gameId'),
            baseScore: score,
        };
        return this.encryptByAES(encryptData);
    }

    /** 获取游戏道具 */
    public getGameProps() {
        return getGameProps({ actId: getUrlParam('actId') ?? '020fceb12fda440fa8a322951a4719aa' }).then(
            (res) => {
                if (res.respcod == '01') {
                    console.log(res, '游戏道具');
                    if (res.data.length > 0) {
                        this.propsInfo = res.data[0] as propsType;
                    }
                } else {
                    errorRemind(res.respcod);
                }
            },
        );
    }

    /** 使用道具翻倍 */

    public doubleProp() {
        if (this.propsNum.text === '0') {
            jump();
            return;
        }
        let params = {
            gameId: getUrlParam('gameId') ?? localStorage.getItem('gameId'),
            actId: getUrlParam('actId') ?? '020fceb12fda440fa8a322951a4719aa',
            doubleProp: {
                propId: this.propsInfo.propId,
                propNum: this.propsNum.text,
            },
        };
        doubleProp(params).then((res) => {
            if (res.respcod == '01') {
                console.log(res, '道具翻倍接口返回');
                jump();
            } else {
                errorRemind(res.respcod);
            }
        });
    }

    /** 用动画隐藏屏幕  */
    public async hide() {
        this.hideBottom();
        await this.hideDragon();
        await this.hidePanel();
    }

    /** 揭开面板后面的动画龙  */
    private async showDragon() {
        gsap.killTweensOf(this.dragon.scale);
        gsap.killTweensOf(this.dragon.pivot);
        this.dragon.visible = true;
        this.dragon.scale.set(0);
        this.dragon.pivot.y = -300;
        gsap.to(this.dragon.pivot, {
            y: 0,
            duration: 0.7,
            ease: 'back.out',
            delay: 0.1,
        });
        await gsap.to(this.dragon.scale, {
            x: 1,
            y: 1,
            duration: 0.3,
            ease: 'back.out',
            delay: 0.2,
        });
    }

    /** 将动画龙隐藏在面板后面  */
    private async hideDragon() {
        gsap.killTweensOf(this.dragon.pivot);
        await gsap.to(this.dragon.pivot, {
            y: -100,
            duration: 0.2,
            ease: 'back.in',
        });
        this.dragon.scale.set(0);
    }

    /** 显示容器盒面板动画  */
    private async showPanel() {
        gsap.killTweensOf(this.panel.scale);
        this.panel.visible = true;
        this.panel.scale.set(0);
        await gsap.to(this.panel.scale, {
            x: 1,
            y: 1,
            duration: 0.4,
            ease: 'back.out',
        });
    }

    /** 隐藏容器框面板动画  */
    private async hidePanel() {
        gsap.killTweensOf(this.panel.scale);
        await gsap.to(this.panel.scale, {
            x: 0,
            y: 0,
            duration: 0.3,
            ease: 'back.in',
        });
    }

    /** 显示页脚项目（紫色底座 + 播放按钮）动画  */
    private async showBottom() {
        this.bottomBase.visible = true;
        this.continueButton.visible = true;
        gsap.killTweensOf(this.bottomBase);
        this.bottomBase.pivot.y = -200;
        gsap.killTweensOf(this.continueButton.pivot);
        this.continueButton.pivot.y = -200;

        gsap.to(this.bottomBase.pivot, {
            y: 0,
            duration: 0.3,
            ease: 'back.out',
            delay: 0.3,
        });

        await gsap.to(this.continueButton.pivot, {
            y: 0,
            duration: 0.4,
            ease: 'back.out',
            delay: 0.4,
        });
    }

    /** 隐藏页脚项目（紫色底座 + 播放按钮）动画  */
    private async hideBottom() {
        gsap.killTweensOf(this.bottomBase);
        gsap.killTweensOf(this.continueButton.pivot);

        gsap.to(this.bottomBase.pivot, {
            y: -200,
            duration: 0.3,
            ease: 'back.in',
        });

        await gsap.to(this.continueButton.pivot, {
            y: -200,
            duration: 0.4,
            ease: 'back.in',
        });
    }

    /**  游戏成绩收益信息 */
    private async animateGradeMessage(grade: number) {
        await waitFor(0.1);
        if (grade < 1) {
            sfx.play('common/sfx-incorrect.wav');
        } else {
            sfx.play('common/sfx-special.wav');
        }
    }
}
