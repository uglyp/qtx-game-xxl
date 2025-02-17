import { Container } from 'pixi.js';
import gsap from 'gsap';
import { Match3, Match3OnMatchData, Match3OnMoveData, Match3OnPopData } from '../match3/Match3';
import { Shelf } from '../ui/Shelf';
import { getUrlParam, getUrlParamNumber } from '../utils/getUrlParams';
import { GameTimer } from '../ui/GameTimer';
import { navigation } from '../utils/navigation';
import { ResultScreen } from './ResultScreen';
import { GameScore } from '../ui/GameScore';
import { CloudLabel } from '../ui/CloudLabel';
import { i18n } from '../utils/i18n';
import { Cauldron } from '../ui/Cauldron';
import { RippleButton } from '../ui/RippleButton';
import { SettingsPopup } from '../popups/SettingsPopup';
import { PausePopup } from '../popups/PausePopup';
import { JumpPopup } from '../popups/JumpPopup';
import { GameCountdown } from '../ui/GameCountdown';
import { GameEffects } from '../ui/GameEffects';
import { bgm } from '../utils/audio';
import { userSettings } from '../utils/userSettings';
import { GameTimesUp } from '../ui/GameTimesUp';
import { GameOvertime } from '../ui/GameOvertime';
import { app } from '../main';
import { waitFor } from '../utils/asyncUtils';
import { match3GetConfig, Match3Mode } from '../match3/Match3Config';
import { userStats } from '../utils/userStats';
import { gameOver, startGame } from '../api/index';
import { jump, errorRemind, getStatusBarHeight } from '../utils/common';





/** 游戏视图 */
export class GameScreen extends Container {
    /** 视图所需要的资源 */
    public static assetBundles = ['game', 'common'];
    /** 游戏实例 */
    public readonly match3: Match3;
    /** 香炉 */
    public readonly cauldron: Cauldron;
    /** 游戏容器 */
    public readonly gameContainer: Container;
    /** 游戏计时器 */
    public readonly timer: GameTimer;
    /** 游戏分数 */
    public readonly score: GameScore;
    /** 组合消除时显示的信息 example: combo! */
    public readonly comboMessage: CloudLabel;
    /** 组合消除时显示的连续次数  example: x2 */
    public readonly comboLevel: CloudLabel;
    /** 左上角游戏暂停按钮 */
    public readonly pauseButton: RippleButton;
    /** 设置按钮，点击打开设置面板 */
    public readonly settingsButton: RippleButton;
    /** 返回按钮 */
    public readonly backButton: RippleButton;
    /** 游戏开始，显示倒计时 */
    public readonly countdown: GameCountdown;
    /** 游戏即将结束，显示的10s倒计时 */
    public readonly overtime: GameOvertime;
    /** 游戏即将结束，显示的times up 云 */
    public readonly timesUp: GameTimesUp;
    /** 游戏的书架背景 */
    public readonly shelf?: Shelf;
    /** 特效层 */
    public readonly effects?: GameEffects;
    /** 游戏结束设置为true*/
    private finished = false;

    constructor() {
        super();

        this.pauseButton = new RippleButton({
            image: 'icon-pause',
            ripple: 'icon-pause-stroke',
        });
        this.pauseButton.onPress.connect(() => navigation.presentPopup(PausePopup));
        this.addChild(this.pauseButton);

        this.settingsButton = new RippleButton({
            image: 'icon-settings',
            ripple: 'icon-settings-stroke',
        });
        this.settingsButton.onPress.connect(() => navigation.presentPopup(SettingsPopup));
        this.addChild(this.settingsButton);

        this.backButton = new RippleButton({
            image: 'icon-back',
            ripple: 'icon-back-stroke',
        });
        this.backButton.onPress.connect(() => navigation.presentPopup(JumpPopup));

        this.addChild(this.backButton);

        this.gameContainer = new Container();
        this.addChild(this.gameContainer);

        this.shelf = new Shelf();
        this.gameContainer.addChild(this.shelf);

        this.match3 = new Match3();
        this.match3.onMove = this.onMove.bind(this);
        this.match3.onMatch = this.onMatch.bind(this);
        this.match3.onPop = this.onPop.bind(this);
        this.match3.onProcessComplete = this.onProcessComplete.bind(this);
        this.match3.onTimesUp = this.onTimesUp.bind(this);
        this.gameContainer.addChild(this.match3);

        this.score = new GameScore();
        this.addChild(this.score);

        this.comboMessage = new CloudLabel({ color: 0x2c136c, labelColor: 0xffffff });
        this.comboMessage.text = i18n.comboMessage;
        this.comboMessage.hide(false);
        this.addChild(this.comboMessage);

        this.comboLevel = new CloudLabel({ color: 0x2c136c, labelColor: 0xffffff });
        this.comboLevel.text = 'x8';
        this.comboLevel.hide(false);
        this.addChild(this.comboLevel);

        this.cauldron = new Cauldron(true);
        this.addChild(this.cauldron);

        this.timer = new GameTimer();
        this.cauldron.addContent(this.timer);

        this.effects = new GameEffects(this);
        this.addChild(this.effects);

        this.countdown = new GameCountdown();
        this.addChild(this.countdown);

        this.overtime = new GameOvertime();
        this.addChild(this.overtime);

        this.timesUp = new GameTimesUp();
        this.addChild(this.timesUp);
        // this.screenToast = new Toast('哈哈哈哈哈');
    }

    /** 游戏视图展示前的游戏的配置，当前视图中元素内容的配置 */
    public prepare() {
        const match3Config = match3GetConfig({
            rows: getUrlParamNumber('rows') ?? 9,
            columns: getUrlParamNumber('columns') ?? 7,
            tileSize: getUrlParamNumber('tileSize') ?? 50,
            freeMoves: getUrlParam('freeMoves') !== null,
            duration: getUrlParamNumber('duration') ?? 60,
            mode: (getUrlParam('mode') as Match3Mode) ?? userSettings.getGameMode(),
        });

        this.finished = false;
        this.shelf?.setup(match3Config);
        this.match3.setup(match3Config);
        this.pauseButton.hide(false);
        this.cauldron.hide(false);
        this.score.hide(false);
        gsap.killTweensOf(this.gameContainer.pivot);
        this.gameContainer.pivot.y = -navigation.height * 0.7;
        gsap.killTweensOf(this.timer.scale);
    }

    /** 更新视图 */
    public update() {
        this.match3.update(app.ticker.deltaMS);
        this.timer.updateTime(this.match3.timer.getTimeRemaining());
        this.overtime.updateTime(this.match3.timer.getTimeRemaining());
        this.score.setScore(this.match3.stats.getScore());
    }

    /** 暂停游戏，弹出时自动触发 */
    public async pause() {
        this.gameContainer.interactiveChildren = false;
        this.match3.pause();
    }

    /** 恢复游戏*/
    public async resume() {
        this.gameContainer.interactiveChildren = true;
        this.match3.resume();
    }

    /**  完全重置游戏，清除所有棋子和架子块  */
    public reset() {
        this.shelf?.reset();
        this.match3.reset();
    }

    /** 在浏览器窗口大小变化时，调整视图大小 */
    public resize(width: number, height: number) {
        const div = height * 0.3;
        const centerX = width * 0.5;
        const centerY = height * 0.5;

        this.gameContainer.x = centerX;
        this.gameContainer.y = div + this.match3.board.getHeight() * 0.5 + 20;
        this.score.x = centerX;
        this.score.y = 10 + getStatusBarHeight();
        this.comboMessage.x = centerX - 150;
        this.comboMessage.y = div - 50;
        this.comboLevel.x = centerX + 150;
        this.comboLevel.y = div - 50;
        this.cauldron.x = centerX;
        this.cauldron.y = div - 60;
        this.pauseButton.x = width - 30;
        this.pauseButton.y = 80 + getStatusBarHeight();
        this.settingsButton.x = width - 30;
        this.settingsButton.y = 30 + getStatusBarHeight();
        this.backButton.x = 30;
        this.backButton.y = 30 + getStatusBarHeight();
        this.countdown.x = centerX;
        this.countdown.y = centerY;
        this.timesUp.x = centerX;
        this.timesUp.y = centerY;
        this.overtime.x = this.gameContainer.x;
        this.overtime.y = this.gameContainer.y;
    }

    /** 显示视图 */
    public async show() {
        bgm.play('common/bgm-game.mp3', { volume: 0.5 });
        await gsap.to(this.gameContainer.pivot, { y: 0, duration: 0.5, ease: 'back.out' });
        await this.countdown.show();
        await this.cauldron.show();
        await this.countdown.hide();
        this.score.show();
        this.pauseButton.show();
        this.match3.startPlaying();
    }

    public async hide() {
        this.overtime.hide();
        this.effects?.playGridExplosion();
        await waitFor(0.3);
        await this.timesUp.playRevealAnimation();
        await this.timesUp.playExpandAnimation();
    }

    /** 移动一个棋子时触发 */
    private onMove(data: Match3OnMoveData) {
        this.effects?.onMove(data);
    }

    /**  当 match3 在网格中检测到一个或多个匹配时激发  */
    private onMatch(data: Match3OnMatchData) {
        if (data.combo > 1) {
            this.comboMessage.show();
            this.comboLevel.show();
            this.comboLevel.text = 'x' + data.combo;
        }

        this.effects?.onMatch(data);
    }

    /** 当棋子从棋盘上弹出时触发 */
    private onPop(data: Match3OnPopData) {
        this.effects?.onPop(data);
    }

    /** 当match3网格完成自动处理时触发 */
    private onProcessComplete() {
        this.comboMessage.hide();
        this.comboLevel.hide();
        // Only finishes the game if timer already ended
        if (!this.match3.timer.isRunning()) this.finish();
    }

    /**  游戏计时器结束时激发  */
    private onTimesUp() {
        this.pauseButton.hide();
        this.match3.stopPlaying();
        // Only finishes the game if match3 is not auto-processing the grid
        // 只有在 match3 未自动处理网格时才完成游戏
        if (!this.match3.process.isProcessing()) this.finish();
    }

    /**  完成游戏，保存统计数据并查看结果  */
    private async finish() {
        if (this.finished) return;
        this.finished = true;
        this.match3.stopPlaying();
        const performance = this.match3.stats.getGameplayPerformance();

        userStats.save(this.match3.config.mode, performance);
        console.log(`本次分数为：${JSON.stringify(performance)}`);
        console.log('hahhahahhahhhahah', getUrlParam('gameId'));
        // if (!getUrlParam('gameId')) {
            // await this.setStartGame();
            navigation.showScreen(ResultScreen);
            // return
        // }
        // navigation.showScreen(ResultScreen);
    }

    public setStartGame() {
        // 开始游戏
        return startGame({
            actId: '020fceb12fda440fa8a322951a4719aa',
            gameType: 'xiaoxiaole',
        }).then((res) => {
            console.log('开始游戏', res);
            localStorage.setItem('gameId', res.data.id);
        });
    }

    /** 当浏览器窗口切换走时自动暂停 */
    public blur() {
        if (!navigation.currentPopup && this.match3.isPlaying()) {
            navigation.presentPopup(PausePopup);
        }
    }
}
