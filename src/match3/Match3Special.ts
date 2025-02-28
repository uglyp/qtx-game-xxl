import { Match3 } from './Match3';
import { Match3SpecialBlast } from './specials/Match3SpecialBlast';
import { Match3SpecialColour } from './specials/Match3SpecialColour';
import { Match3SpecialColumn } from './specials/Match3SpecialColumn';
import { Match3SpecialRow } from './specials/Match3SpecialRow';
import { match3GetMatches, Match3Position, Match3Type } from './Match3Utility';

/** Interface for special handler
 *  特殊处理程序接口
 */
export interface Match3SpecialHandler {
    /** Match3 instance */
    match3: Match3;
    /** The piece type attributed to this special
     * 特殊道具的类型属性
     */
    pieceType: Match3Type;
    /** Find out match patters and spawn special pieces
     * 找出匹配模式并生成特殊的棋子
     */
    process(matches: Match3Position[][]): Promise<void>;
    /** Trigger the special effect in position
     * 在位置触发特效
     */
    trigger(pieceType: Match3Type, position: Match3Position): Promise<void>;
}

/** Special handler constructor interface
 *  特殊处理程序构造函数接口
 */
export interface Match3SpecialHandlerConstructor {
    new (match3: Match3, pieceType: Match3Type): Match3SpecialHandler;
}

/** All available specials - handlers can be found inside `match3/specials/` folder
 *  所有可用的特殊处理程序都可以在“match3/specials/”文件夹中找到
 */
const availableSpecials: Record<string, Match3SpecialHandlerConstructor> = {
    /** Pops out the entire row
     *  弹出整个行
     */
    'special-row': Match3SpecialRow,
    /** Pops out the entire column
     * 弹出整个列
     */
    'special-column': Match3SpecialColumn,
    /** Pops out all pieces of a single type
     *  弹出单一类型的所有部分
     */
    'special-colour': Match3SpecialColour,
    /** Pops out surrounding pieces
     *  弹出周围的部分
     */
    'special-blast': Match3SpecialBlast,
};

/**
 * Controls the special pieces in the game. Each special piece should have its own
 * special handler that will figure out match patterns (process) that will cause them to spawn
 * and release its power (trigger) when touched or popped out.
 */
export class Match3Special {
    /** The Match3 instance */
    public match3: Match3;
    /** List of special types defined for this session */
    public specialTypes: Match3Type[] = [];
    /** List of all special handlers - one per special type */
    public specialHandlers: Match3SpecialHandler[] = [];

    constructor(match3: Match3) {
        this.match3 = match3;
    }

    /** Remove all specials handlers */
    public reset() {
        this.specialTypes.length = 0;
        this.specialHandlers.length = 0;
    }

    /** Check if there are a special handler available with given name */
    public isSpecialAvailable(name: string) {
        return !!availableSpecials[name];
    }

    /**
     * Add a new special handler if its available
     * @param name The name of the special piece
     * @param pieceType The type attributed to this special in the grid
     * @returns
     */
    public addSpecialHandler(name: string, pieceType: Match3Type) {
        if (!availableSpecials[name]) return;
        this.specialTypes.push(pieceType);
        this.specialHandlers.push(new availableSpecials[name](this.match3, pieceType));
    }

    /**
     * Process all specials with existing matches
     */
    public async process() {
        for (const special of this.specialHandlers) {
            const matches = match3GetMatches(this.match3.board.grid);
            await special.process(matches);
        }
    }

    /**
     * Trigger a special in a grid position
     * @param pieceType The type of the special to be triggered
     * @param position The position in the grid
     * @returns
     */
    public async trigger(pieceType: Match3Type, position: Match3Position) {
        if (!this.isSpecial(pieceType)) return;
        for (const special of this.specialHandlers) {
            await special.trigger(pieceType, position);
        }
    }

    /**
     * Check if a piece type refers to one of the specials
     * @param type The piece type to check
     * @returns If special (true) or not (false)
     */
    public isSpecial(pieceType: Match3Type) {
        return this.specialTypes.includes(pieceType);
    }
}
