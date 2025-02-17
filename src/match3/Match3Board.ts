import { Container, Graphics } from 'pixi.js';
import { pool } from '../utils/pool';
import { Match3 } from './Match3';
import { Match3Config, match3GetBlocks } from './Match3Config';
import { Match3Piece } from './Match3Piece';
import {
    Match3Position,
    match3SetPieceType,
    match3GetPieceType,
    match3CreateGrid,
    match3ForEach,
    Match3Grid,
    Match3Type,
} from './Match3Utility';

/**
 * 保存网格状态并控制其视觉表示，相应地创建和移除棋子。
 * 在这个游戏的惯例中，“grid”通常指的是三消状态（类型数组），而“board”是带有精灵图的视觉表现形式。
 */
export class Match3Board {
    /** “Match3”实例 */
    public match3: Match3;
    /** 仅含数字的网格状态*/
    public grid: Match3Grid = [];
    /** 当前在网格中正在使用的所有图块精灵。 */
    public pieces: Match3Piece[] = [];
    /** 遮蔽棋盘尺寸内的所有棋子。 */
    public piecesMask: Graphics;
    /** 用于放置图块精灵的容器。 */
    public piecesContainer: Container;
    /** boaard 中的行数 */
    public rows = 0;
    /** 棋盘的列数 */
    public columns = 0;
    /** 每个板槽的尺寸（宽度和高度） */
    public tileSize = 0;
    /** 游戏可用的常见类型列表 */
    public commonTypes: Match3Type[] = [];
    /** 将棋子类型映射到棋子名称。 */
    public typesMap!: Record<number, string>;

    constructor(match3: Match3) {
        this.match3 = match3;

        this.piecesContainer = new Container();
        this.match3.addChild(this.piecesContainer);

        this.piecesMask = new Graphics();
        this.piecesMask.beginFill(0xff0000, 0.5);
        this.piecesMask.drawRect(-2, -2, 4, 4);
        this.match3.addChild(this.piecesMask);
        this.piecesContainer.mask = this.piecesMask;
    }

    /**
     * 设置初始网格状态并在视图中填满棋子。
     * @param 《Match3》配置参数
     */
    public setup(config: Match3Config) {
        this.rows = config.rows;
        this.columns = config.columns;
        this.tileSize = config.tileSize;
        this.piecesMask.width = this.getWidth();
        this.piecesMask.height = this.getHeight();
        this.piecesContainer.visible = true;

        // 游戏中将要使用的方块列表（包括特殊方块）。
        const blocks = match3GetBlocks(config.mode);

        this.typesMap = {};

        // 组织类型并设置特殊处理程序。
        // 棋子类型将根据它们在方块字符串数组中的位置来定义。
        // 示例：如果“piece-dragon”在块列表中是第二个（blocks[1]），它的类型将是 2。
        for (let i = 0; i < blocks.length; i++) {
            const name = blocks[i];
            const type = i + 1;
            // 添加一个特殊处理程序，该块指代一个特殊部分，否则将其设为普通类型。
            if (this.match3.special.isSpecialAvailable(name)) {
                this.match3.special.addSpecialHandler(name, type);
            } else {
                this.commonTypes.push(type);
            }
            this.typesMap[type] = name;
        }

        // 创建初始网格状态
        this.grid = match3CreateGrid(this.rows, this.columns, this.commonTypes);

        // 用棋子精灵填满视觉板。
        match3ForEach(this.grid, (gridPosition: Match3Position, type: Match3Type) => {
            this.createPiece(gridPosition, type);
        });
    }

    /**
     * 处理所有棋子并清理棋盘。
     */
    public reset() {
        let i = this.pieces.length;
        while (i--) {
            const piece = this.pieces[i];
            this.disposePiece(piece);
        }
        this.pieces.length = 0;
    }

    /**
     * 在特定的网格位置创建一个新的物件。
     * @param position 新棋子将被放置的网格位置。
     * @param type nre 片的类型
     */
    public createPiece(position: Match3Position, pieceType: Match3Type) {
        const name = this.typesMap[pieceType];
        const piece = pool.get(Match3Piece);
        const viewPosition = this.getViewPositionByGridPosition(position);
        piece.onMove = (from, to) => this.match3.actions.actionMove(from, to);
        piece.onTap = (position) => this.match3.actions.actionTap(position);
        piece.setup({
            name,
            type: pieceType,
            size: this.match3.config.tileSize,
            interactive: true,
            highlight: this.match3.special.isSpecial(pieceType),
        });
        piece.row = position.row;
        piece.column = position.column;
        piece.x = viewPosition.x;
        piece.y = viewPosition.y;
        this.pieces.push(piece);
        this.piecesContainer.addChild(piece);
        return piece;
    }

    /**
     * 弃掉一个棋子，将其从棋盘上移除。
     * @param piece 待移除的部件
     */
    public disposePiece(piece: Match3Piece) {
        if (this.pieces.includes(piece)) {
            this.pieces.splice(this.pieces.indexOf(piece), 1);
        }
        if (piece.parent) {
            piece.parent.removeChild(piece);
        }
        pool.giveBack(piece);
    }

    /**
     * 在棋盘上生成一个新棋子，如果有棋子在同一位置，则移除该棋子。
     * @param position 棋子应该出现的位置。
     * @param pieceType 待生成棋子的类型
     */
    public async spawnPiece(position: Match3Position, pieceType: Match3Type) {
        const oldPiece = this.getPieceByPosition(position);
        if (oldPiece) this.disposePiece(oldPiece);
        match3SetPieceType(this.grid, position, pieceType);
        if (!pieceType) return;
        const piece = this.createPiece(position, pieceType);
        await piece.animateSpawn();
    }

    /**
     * 从棋盘上取出一块，如果它是特殊棋子，则触发其效果。
     * @param position 要弹出的棋子的网格位置
     * @param causedBySpecial 如果“砰”的一声是由特效引起的。
     */
    public async popPiece(position: Match3Position, causedBySpecial = false) {
        const piece = this.getPieceByPosition(position);
        const type = match3GetPieceType(this.grid, position);
        if (!type || !piece) return;
        const isSpecial = this.match3.special.isSpecial(type);
        const combo = this.match3.process.getProcessRound();

        // 将网格中的棋子位置设置为 0，并将其从棋盘上移除。
        match3SetPieceType(this.grid, position, 0);
        const popData = { piece, type, combo, isSpecial, causedBySpecial };
        this.match3.stats.registerPop(popData);
        this.match3.onPop?.(popData);
        if (this.pieces.includes(piece)) {
            this.pieces.splice(this.pieces.indexOf(piece), 1);
        }
        await piece.animatePop();
        this.disposePiece(piece);

        // 触发与此物品相关的任何特殊效果，如果有的话。
        await this.match3.special.trigger(type, position);
    }

    /**
     * Pop a list of pieces all together将一系列碎片同时弹出。
     * @param positions 待弹出位置列表
     * @param causedBySpecial 如果这是由特效引起的。
     */
    public async popPieces(positions: Match3Position[], causedBySpecial = false) {
        const animPromises = [];
        for (const position of positions) {
            animPromises.push(this.popPiece(position, causedBySpecial));
        }
        await Promise.all(animPromises);
    }

    /**
     * 通过网格位置找到一个图形精灵。
     * @param position 查找的网格位置
     * @returns
     */
    public getPieceByPosition(position: Match3Position) {
        for (const piece of this.pieces) {
            if (piece.row === position.row && piece.column === position.column) {
                return piece;
            }
        }
        return null;
    }

    /**
     * 将网格位置（行和列）转换为视图位置（x 和 y）。
     * @param position 待转换的网格位置
     * @returns 棋盘上等效的 x 和 y 位置
     */
    public getViewPositionByGridPosition(position: Match3Position) {
        const offsetX = ((this.columns - 1) * this.tileSize) / 2;
        const offsetY = ((this.rows - 1) * this.tileSize) / 2;
        const x = position.column * this.tileSize - offsetX;
        const y = position.row * this.tileSize - offsetY;
        return { x, y };
    }

    /**
     * 找出网格位置中的棋子类型。
     * @param position
     * @returns 这件物品的类型
     */
    public getTypeByPosition(position: Match3Position) {
        return match3GetPieceType(this.grid, position);
    }

    /** 获取棋盘的可视宽度。 */
    public getWidth() {
        return this.tileSize * this.columns;
    }

    /** 获取棋盘的视觉高度。 */
    public getHeight() {
        return this.tileSize * this.rows;
    }

    /** 暂停所有片段动画。 */
    public pause() {
        for (const piece of this.pieces) piece.pause();
    }

    /** 重置所有片段动画。 */
    public resume() {
        for (const piece of this.pieces) piece.resume();
    }

    /** 将一块置于所有其他物品的前面。 */
    public bringToFront(piece: Match3Piece) {
        this.piecesContainer.addChild(piece);
    }
}
