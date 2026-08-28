export type Player = 'black' | 'white';
export type CellState = Player | null;
export type GamePhase = 'placement' | 'movement';

export interface GameState {
  board: CellState[];
  currentPlayer: Player;
  phase: GamePhase;
  piecesToPlace: { black: number; white: number };
  selectedPos: number | null;
  mustRemove: boolean;
  gameOver: boolean;
  winner: Player | null;
}
