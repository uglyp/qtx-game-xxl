import { Match3, Match3OnMatchData, Match3OnPopData } from './Match3';

/** Default gameplay stats data */
const defaultStatsData = {
    score: 0,
    matches: 0,
    pops: 0,
    specials: 0,
    grade: 0,
};

/** gameplay stats data */
export type Match3StatsData = typeof defaultStatsData;

/**
 * Computes scores and general gameplay stats during the session.
 */
export class Match3Stats {
    /** The Match3 instance */
    private match3: Match3;
    /** Current internal stats data */
    private data: Match3StatsData;

    constructor(match3: Match3) {
        this.match3 = match3;
        this.data = { ...defaultStatsData };
    }

    /**
     * Reset all stats
     */
    public reset() {
        this.data = { ...defaultStatsData };
    }

    /**
     * Update stats params based on given params
     * @param data The piece pop data
     */
    public registerPop(data: Match3OnPopData) {
        const points = data.causedBySpecial ? 3 : 1;
        this.data.score += points;
        this.data.pops += 1;
        if (data.isSpecial) {
            this.data.specials += 1;
        }
    }

    /**
     * Update stats params based on given match data
     * 根据给定的匹配数据更新统计参数
     * @param data The match data
     */
    public registerMatch(data: Match3OnMatchData) {
        console.log(this.data.score, 'this.data.score');
        console.log(
            data.matches,
            'data.matches',
            data.matches.length,
            'data.matches.length',
            data.combo,
            'data.combo',
        );
        // 
        for (const match of data.matches) {
            console.log(match, 'match');
            console.log(match.length, 'match.length');
            // 3消 match.length = 3，4消 match.length = 4， data.matches.length = 1
            // 十字消 data.matches.length = 2，代表一次性消了两组，这两组有可能是 3 + 3 ， 3 + 4 ，3 + 5
            // combo代表连消次数
            const points = match.length + data.matches.length * data.combo;
            console.log(points, 'points');
            this.data.score += points;
            this.data.matches += 1;
        }
        console.log('this.data.score ', this.data.score , 'this.data',this.data,);
    }

    /**
     * Calculate a grade from 0 (worst) to 3 (best) based on given score and playtime
     * 根据给定的分数和游戏时间计算从0(最差)到3(最好)的分数
     * @param score The score to calculated
     * @param playTime The play time (in milliseconds) of the score 分数的播放时间(以毫秒计)
     * @returns An number (0 to 3) representing the grade
     */
    public caulculateGrade(score: number, playTime: number) {
        const avgPointsPerSecond = 8;
        const gameplayTimeInSecs = playTime / 1000;
        const pointsPerSecond = score / gameplayTimeInSecs;

        let grade = 0;
        if (pointsPerSecond > avgPointsPerSecond * 2) {
            grade = 3;
        } else if (pointsPerSecond > avgPointsPerSecond) {
            grade = 2;
        } else if (pointsPerSecond > avgPointsPerSecond * 0.1) {
            grade = 1;
        }

        return grade;
    }

    public getScore() {
        return this.data.score;
    }

    /**
     * Retrieve full gameplay session performance in an object
     *  在一个对象中检索完整的游戏会话性能
     */
    public getGameplayPerformance() {
        const grade = this.caulculateGrade(this.data.score, this.match3.timer.getTime());
        return { ...this.data, grade };
    }
}
