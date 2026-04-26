import type { CellState, Player } from './types';

// 24 positions on the board.
// Outer ring:  0-7  (corners at 0,2,4,6 — midpoints at 1,3,5,7)
// Middle ring: 8-15
// Inner ring: 16-23
//
// Coordinate layout (col, row in a 0-6 grid, step 80px):
//   0:(0,0)  1:(3,0)  2:(6,0)
//   7:(0,3)           3:(6,3)
//   6:(0,6)  5:(3,6)  4:(6,6)
//   8:(1,1)  9:(3,1) 10:(5,1)
//  15:(1,3)          11:(5,3)
//  14:(1,5) 13:(3,5) 12:(5,5)
//  16:(2,2) 17:(3,2) 18:(4,2)
//  23:(2,3)          19:(4,3)
//  22:(2,4) 21:(3,4) 20:(4,4)

export const MILLS: [number, number, number][] = [
  // Outer ring
  [0, 1, 2], [2, 3, 4], [4, 5, 6], [6, 7, 0],
  // Middle ring
  [8, 9, 10], [10, 11, 12], [12, 13, 14], [14, 15, 8],
  // Inner ring
  [16, 17, 18], [18, 19, 20], [20, 21, 22], [22, 23, 16],
  // Cross lines (outer midpoint → middle midpoint → inner midpoint)
  [1, 9, 17], [3, 11, 19], [5, 13, 21], [7, 15, 23],
];

export const ADJACENCY: number[][] = [
  [1, 7],        // 0  outer TL
  [0, 2, 9],     // 1  outer T mid
  [1, 3],        // 2  outer TR
  [2, 4, 11],    // 3  outer R mid
  [3, 5],        // 4  outer BR
  [4, 6, 13],    // 5  outer B mid
  [5, 7],        // 6  outer BL
  [6, 0, 15],    // 7  outer L mid
  [9, 15],       // 8  middle TL
  [8, 10, 17],   // 9  middle T mid
  [9, 11],       // 10 middle TR
  [10, 12, 19],  // 11 middle R mid
  [11, 13],      // 12 middle BR
  [12, 14, 21],  // 13 middle B mid
  [13, 15],      // 14 middle BL
  [14, 8, 23],   // 15 middle L mid
  [17, 23],      // 16 inner TL
  [16, 18, 9],   // 17 inner T mid — also connects up to middle T (9)
  [17, 19],      // 18 inner TR
  [18, 20, 11],  // 19 inner R mid — also connects right to middle R (11)
  [19, 21],      // 20 inner BR
  [20, 22, 13],  // 21 inner B mid — also connects down to middle B (13)
  [21, 23],      // 22 inner BL
  [22, 16, 15],  // 23 inner L mid — also connects left to middle L (15)
];

export function countPieces(board: CellState[], player: Player): number {
  return board.filter(v => v === player).length;
}

export function checkMill(board: CellState[], pos: number, player: Player): boolean {
  return MILLS.some(mill => mill.includes(pos) && mill.every(p => board[p] === player));
}

export function isInMill(board: CellState[], pos: number): boolean {
  const player = board[pos];
  if (!player) return false;
  return MILLS.some(mill => mill.includes(pos) && mill.every(p => board[p] === player));
}

export function canRemove(board: CellState[], pos: number, opponent: Player): boolean {
  if (board[pos] !== opponent) return false;
  if (!isInMill(board, pos)) return true;
  // Can only remove from a mill when every opponent piece is in a mill
  return board.every((v, i) => v !== opponent || isInMill(board, i));
}

export function getValidMoves(board: CellState[], pos: number, flying: boolean): number[] {
  if (flying) {
    return board.map((v, i) => (v === null ? i : -1)).filter(i => i >= 0);
  }
  return ADJACENCY[pos].filter(adj => board[adj] === null);
}

export function hasValidMoves(board: CellState[], player: Player, flying: boolean): boolean {
  return board.some((v, pos) => v === player && getValidMoves(board, pos, flying).length > 0);
}

export function getMills(board: CellState[], player: Player): number[] {
  const inMill = new Set<number>();
  for (const mill of MILLS) {
    if (mill.every(p => board[p] === player)) {
      mill.forEach(p => inMill.add(p));
    }
  }
  return Array.from(inMill);
}
