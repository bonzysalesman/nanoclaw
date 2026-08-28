import { useState, useCallback } from 'react';
import Board from './Board';
import type { GameState, Player, GamePhase } from './types';
import {
  checkMill,
  canRemove,
  countPieces,
  getValidMoves,
  hasValidMoves,
  getMills,
} from './gameLogic';

const INITIAL_STATE: GameState = {
  board: Array(24).fill(null),
  currentPlayer: 'black',
  phase: 'placement',
  piecesToPlace: { black: 12, white: 12 },
  selectedPos: null,
  mustRemove: false,
  gameOver: false,
  winner: null,
};

function opp(player: Player): Player {
  return player === 'black' ? 'white' : 'black';
}

export default function App() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [showRules, setShowRules] = useState(false);

  const handleClick = useCallback((pos: number) => {
    setState(prev => {
      if (prev.gameOver) return prev;

      const board = [...prev.board];
      const { currentPlayer, phase, piecesToPlace, mustRemove, selectedPos } = prev;
      const opponent = opp(currentPlayer);

      // ── Remove an opponent piece after forming a mill ──
      if (mustRemove) {
        if (!canRemove(board, pos, opponent)) return prev;
        board[pos] = null;

        const bothDone = piecesToPlace.black === 0 && piecesToPlace.white === 0;
        const newPhase: GamePhase = bothDone ? 'movement' : 'placement';

        let gameOver = false;
        let winner: Player | null = null;

        if (newPhase === 'movement') {
          const oppCount = countPieces(board, opponent);
          if (oppCount < 3) {
            gameOver = true;
            winner = currentPlayer;
          } else if (!hasValidMoves(board, opponent, oppCount === 3)) {
            gameOver = true;
            winner = currentPlayer;
          }
        }

        return {
          ...prev,
          board,
          mustRemove: false,
          phase: newPhase,
          currentPlayer: gameOver ? currentPlayer : opponent,
          gameOver,
          winner,
        };
      }

      // ── Placement phase ──
      if (phase === 'placement') {
        if (board[pos] !== null || piecesToPlace[currentPlayer] === 0) return prev;

        board[pos] = currentPlayer;
        const newPiecesToPlace = {
          ...piecesToPlace,
          [currentPlayer]: piecesToPlace[currentPlayer] - 1,
        };

        if (checkMill(board, pos, currentPlayer)) {
          return { ...prev, board, piecesToPlace: newPiecesToPlace, mustRemove: true };
        }

        const bothDone = newPiecesToPlace.black === 0 && newPiecesToPlace.white === 0;
        const newPhase: GamePhase = bothDone ? 'movement' : 'placement';

        let gameOver = false;
        let winner: Player | null = null;

        if (bothDone) {
          const oppCount = countPieces(board, opponent);
          if (!hasValidMoves(board, opponent, oppCount === 3)) {
            gameOver = true;
            winner = currentPlayer;
          }
        }

        return {
          ...prev,
          board,
          piecesToPlace: newPiecesToPlace,
          phase: newPhase,
          currentPlayer: gameOver ? currentPlayer : opponent,
          gameOver,
          winner,
        };
      }

      // ── Movement phase ──
      if (selectedPos === null) {
        if (board[pos] !== currentPlayer) return prev;
        return { ...prev, selectedPos: pos };
      }

      if (pos === selectedPos) {
        return { ...prev, selectedPos: null };
      }

      const flying = piecesToPlace[currentPlayer] === 0 && countPieces(board, currentPlayer) === 3;
      const moves = getValidMoves(board, selectedPos, flying);

      if (moves.includes(pos)) {
        board[selectedPos] = null;
        board[pos] = currentPlayer;

        if (checkMill(board, pos, currentPlayer)) {
          return { ...prev, board, selectedPos: null, mustRemove: true };
        }

        const oppCount = countPieces(board, opponent);
        let gameOver = false;
        let winner: Player | null = null;

        if (oppCount < 3) {
          gameOver = true;
          winner = currentPlayer;
        } else if (!hasValidMoves(board, opponent, oppCount === 3)) {
          gameOver = true;
          winner = currentPlayer;
        }

        return {
          ...prev,
          board,
          selectedPos: null,
          currentPlayer: gameOver ? currentPlayer : opponent,
          gameOver,
          winner,
        };
      }

      // Clicking own piece reselects it
      if (board[pos] === currentPlayer) {
        return { ...prev, selectedPos: pos };
      }

      return prev;
    });
  }, []);

  const resetGame = () => setState({ ...INITIAL_STATE, board: Array(24).fill(null) });

  const { board, currentPlayer, phase, piecesToPlace, selectedPos, mustRemove, gameOver, winner } = state;
  const opponent = opp(currentPlayer);

  const flying =
    phase === 'movement' &&
    piecesToPlace[currentPlayer] === 0 &&
    countPieces(board, currentPlayer) === 3;

  const validMoves =
    selectedPos !== null && !mustRemove && phase === 'movement'
      ? getValidMoves(board, selectedPos, flying)
      : [];

  const removable = mustRemove
    ? board.map((v, i) => (canRemove(board, i, opponent) ? i : -1)).filter(i => i >= 0)
    : [];

  const millPositions = getMills(board, currentPlayer);

  const statusMessage = () => {
    if (gameOver) return `${winner === 'black' ? '⚫ Black' : '⚪ White'} wins!`;
    const name = currentPlayer === 'black' ? '⚫ Black' : '⚪ White';
    if (mustRemove) return `${name}: Select opponent's piece to remove`;
    if (phase === 'placement')
      return `${name}: Place a piece  (${piecesToPlace[currentPlayer]} remaining)`;
    if (selectedPos !== null) return `${name}: Move to a highlighted spot`;
    return `${name}: Select a piece to move${flying ? '  ✦ Flying!' : ''}`;
  };

  const blackOnBoard = countPieces(board, 'black');
  const whiteOnBoard = countPieces(board, 'white');

  return (
    <div className="app">
      <header>
        <h1>Morabaraba</h1>
        <p className="subtitle">12 Man Morris</p>
      </header>

      <div className="scoreboard">
        <div className={`player-card ${currentPlayer === 'black' && !gameOver ? 'active' : ''}`}>
          <div className="disc black-disc" />
          <div>
            <div className="player-label">Black</div>
            <div className="player-count">
              {phase === 'placement'
                ? `${blackOnBoard} placed · ${piecesToPlace.black} in hand`
                : `${blackOnBoard} piece${blackOnBoard !== 1 ? 's' : ''}`}
            </div>
          </div>
        </div>
        <div className="versus">VS</div>
        <div className={`player-card ${currentPlayer === 'white' && !gameOver ? 'active' : ''}`}>
          <div className="disc white-disc" />
          <div>
            <div className="player-label">White</div>
            <div className="player-count">
              {phase === 'placement'
                ? `${whiteOnBoard} placed · ${piecesToPlace.white} in hand`
                : `${whiteOnBoard} piece${whiteOnBoard !== 1 ? 's' : ''}`}
            </div>
          </div>
        </div>
      </div>

      <div className={`status-bar${mustRemove ? ' remove-mode' : ''}${gameOver ? ' game-over' : ''}`}>
        {statusMessage()}
      </div>

      <Board
        board={board}
        selectedPos={selectedPos}
        validMoves={validMoves}
        removable={removable}
        millPositions={millPositions}
        onClick={handleClick}
      />

      <div className="actions">
        {gameOver ? (
          <button className="btn-primary" onClick={resetGame}>Play Again</button>
        ) : (
          <button className="btn-secondary" onClick={resetGame}>New Game</button>
        )}
        <button className="btn-ghost" onClick={() => setShowRules(r => !r)}>
          {showRules ? 'Hide Rules' : 'Rules'}
        </button>
      </div>

      <div className="phase-tag">
        {phase === 'placement'
          ? `Placement phase · ${piecesToPlace.black + piecesToPlace.white} pieces left to place`
          : 'Movement phase'}
      </div>

      {showRules && (
        <div className="rules">
          <h3>How to Play</h3>
          <ol>
            <li><strong>Placement:</strong> Take turns placing your 12 pieces on any empty intersection.</li>
            <li><strong>Mill:</strong> When 3 of your pieces align along any line, it's a mill — remove one opponent piece (not from a mill, unless all theirs are).</li>
            <li><strong>Movement:</strong> Once all pieces are placed, slide pieces one step along a line per turn.</li>
            <li><strong>Flying:</strong> When you're down to 3 pieces, you may move to any empty position.</li>
            <li><strong>Win:</strong> Reduce your opponent to 2 pieces, or leave them with no legal moves.</li>
          </ol>
        </div>
      )}
    </div>
  );
}
