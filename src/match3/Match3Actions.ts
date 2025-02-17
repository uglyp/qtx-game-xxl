import { Match3 } from './Match3';
import { Match3Piece } from './Match3Piece';
import {
    Match3Position,
    match3GetPieceType,
    match3CloneGrid,
    match3SwapPieces,
    match3GetMatches,
} from './Match3Utility';

/** Interface for actions configuration动作配置接口 */
interface Match3ActionsConfig {
    freeMoves: boolean;
}

/**
 * These are the actions player can take: move pieces (swap) or tap if they are special.这些是玩家可以采取的行动：移动棋子（交换），或者如果棋子是特殊的就点击。
 * Action effects happens instantly, and the game will deal with whatever state the grid ends up with.行动效果立即发生，并且游戏将处理网格最终所处的任何状态。
 */
export class Match3Actions {
    /** The match3 instance */
    public match3: Match3;

    /** Free all moves, meaning that they will always be valid regardles of matching results 所有移动都是免费的，这意味着无论匹配结果如何，它们始终都是有效的。 */
    public freeMoves = false;

    constructor(match3: Match3) {
        this.match3 = match3;
    }

    /**
     * Set up actions with given configuration 使用给定配置设置操作。
     * @param config Actions config params 操作配置参数
     */
    public setup(config: Match3ActionsConfig) {
        this.freeMoves = config.freeMoves;
    }

    /**
     * Basic move action that swap two pieces in the grid. Can be disallowed and reverted if
     * the move does not involve special pieces neither create any new matches, unless free moves
     * is enabled.基本移动操作，在网格中交换两个棋子。如果移动既不涉及特殊棋子也不产生任何新的匹配（除非启用了自由移动），则可以被禁止和撤销。
     * @param from The origin grid position of the move移动的起始网格位置
     * @param to The destination grid position of the move移动的目标网格位置
     */
    public async actionMove(from: Match3Position, to: Match3Position) {
        if (!this.match3.isPlaying()) return;

        // Check if there are pieces on each of the 2 positions, and if they are not locked 检查这两个位置上是否有棋子，并且它们是否未被锁定。
        const pieceA = this.match3.board.getPieceByPosition(from);
        const pieceB = this.match3.board.getPieceByPosition(to);
        if (!pieceA || !pieceB || pieceA.isLocked() || pieceB.isLocked()) return;

        // Check the grid types currently involved in the move 检查当前涉及移动的网格类型。
        const typeA = this.match3.board.getTypeByPosition(from);
        const typeB = this.match3.board.getTypeByPosition(to);
        if (!typeA || !typeB) return;

        // Execute the pieces swap - might be reverted if invalid 执行碎片交换——如果无效可能会被撤销。
        console.log('[Match3] ACTION! Move:', from, 'to:', to);
        await this.swapPieces(pieceA, pieceB);
        this.match3.process.start();
    }

    /**
     * Tap action only allowed for special pieces, triggering their effects in place 点击操作仅允许用于特殊棋子，在原位触发它们的效果。
     * @param position The grid position of the action 动作的网格位置
     */
    public async actionTap(position: Match3Position) {
        if (!this.match3.isPlaying()) return;

        // Check the piece and type in the touched grid position 检查棋子并输入触摸的网格位置。
        const piece = this.match3.board.getPieceByPosition(position);
        const type = this.match3.board.getTypeByPosition(position);
        if (!piece || !this.match3.special.isSpecial(type) || piece.isLocked()) return;

        // Execute the tap action, popping the piece out which will trigger its special effects 执行点击操作，弹出棋子，这将触发其特殊效果。
        console.log('[Match3] ACTION! Tap:', position);
        await this.match3.board.popPiece(piece);
        this.match3.process.start();
    }

    /** Check if a move from origin to destination is valid 检查从原点到目标点的移动是否有效。 */
    private validateMove(from: Match3Position, to: Match3Position) {
        // If free moves is on, all moves are valid 如果自由移动开启，那么所有移动都是有效的。
        if (this.freeMoves) return true;

        const type = match3GetPieceType(this.match3.board.grid, from);
        const specialFrom = this.match3.special.isSpecial(type);
        const specialTo = this.match3.special.isSpecial(
            match3GetPieceType(this.match3.board.grid, to),
        );

        // Always allow move that either or both are special pieces 始终允许移动其中一个或两个都是特殊棋子的情况。
        if (specialFrom || specialTo) return true;

        // Clone current grid so we can manipulate it safely克隆当前网格，以便我们可以安全地对其进行操作。
        const tempGrid = match3CloneGrid(this.match3.board.grid);

        // Swap pieces in the temporary cloned grid 在临时克隆的网格中交换碎片。
        match3SwapPieces(tempGrid, from, to);

        // Get all matches created by this move in the temporary grid获取此移动在临时网格中创建的所有匹配项。
        const newMatches = match3GetMatches(tempGrid, [from, to]);

        // Only validate moves that creates new matches 仅验证能产生新匹配的移动。
        return newMatches.length >= 1;
    }

    /** Attempt to swap two pieces positions in the board, and revert the movement if disallowed尝试交换棋盘上两个棋子的位置，如果不被允许则恢复该移动。 */
    private async swapPieces(pieceA: Match3Piece, pieceB: Match3Piece) {
        // Get grid positions from pieces 从棋子中获取网格位置。
        const positionA = pieceA.getGridPosition();
        const positionB = pieceB.getGridPosition();
        console.log('[Match3] Swap', positionA, positionB);

        // Find out view positions based on grid positions 根据网格位置找出视图位置。
        const viewPositionA = this.match3.board.getViewPositionByGridPosition(positionA);
        const viewPositionB = this.match3.board.getViewPositionByGridPosition(positionB);

        // Validate move if that creates any matches or if free moves is enabled 如果移动会产生任何匹配或者免费移动已启用，则验证该移动。
        const valid = this.validateMove(positionA, positionB);

        // Fire the callback, even if the move is invalid 即使移动无效，也要触发回调。
        this.match3.onMove?.({
            from: positionA,
            to: positionB,
            valid,
        });

        if (valid) {
            // If move is valid, swap types in the grid and update view coordinates 如果移动有效，则在网格中交换类型并更新视图坐标。
            match3SwapPieces(this.match3.board.grid, positionA, positionB);
            pieceA.row = positionB.row;
            pieceA.column = positionB.column;
            pieceB.row = positionA.row;
            pieceB.column = positionA.column;
        }

        // Animate pieces to their new positions 将棋子动画移动到它们的新位置。
        this.match3.board.bringToFront(pieceA);
        await Promise.all([
            pieceA.animateSwap(viewPositionB.x, viewPositionB.y),
            pieceB.animateSwap(viewPositionA.x, viewPositionA.y),
        ]);

        if (!valid) {
            // Revert pieces to their original position if move is not valid 如果移动无效，则将棋子恢复到其原始位置。
            const viewPositionA = this.match3.board.getViewPositionByGridPosition(positionA);
            const viewPositionB = this.match3.board.getViewPositionByGridPosition(positionB);
            this.match3.board.bringToFront(pieceB);
            await Promise.all([
                pieceA.animateSwap(viewPositionA.x, viewPositionA.y),
                pieceB.animateSwap(viewPositionB.x, viewPositionB.y),
            ]);
        } else if (
            this.match3.special.isSpecial(match3GetPieceType(this.match3.board.grid, positionA))
        ) {
            // Pop piece A if is special如果 A 是特殊的，则弹出 A 块。
            await this.match3.board.popPiece(positionA);
        } else if (
            this.match3.special.isSpecial(match3GetPieceType(this.match3.board.grid, positionB))
        ) {
            // Pop piece B if is special 如果 B 块是特殊的，则弹出 B 块。
            await this.match3.board.popPiece(positionB);
        }
    }
}
