import type { CellState } from './types';

// SVG positions for each of the 24 board intersections.
// Laid out on a 0-480 grid (step = 80px):
//   col 0=0, 1=80, 2=160, 3=240, 4=320, 5=400, 6=480
const POS: [number, number][] = [
  [0, 0],   [240, 0],   [480, 0],   // 0  1  2   outer top row
  [480, 240],                         // 3         outer right mid
  [480, 480], [240, 480], [0, 480],  // 4  5  6   outer bottom row
  [0, 240],                           // 7         outer left mid
  [80, 80],  [240, 80],  [400, 80],  // 8  9  10  middle top row
  [400, 240],                         // 11        middle right mid
  [400, 400], [240, 400], [80, 400], // 12 13 14  middle bottom row
  [80, 240],                          // 15        middle left mid
  [160, 160], [240, 160], [320, 160], // 16 17 18  inner top row
  [320, 240],                          // 19        inner right mid
  [320, 320], [240, 320], [160, 320], // 20 21 22  inner bottom row
  [160, 240],                          // 23        inner left mid
];

// Every line segment drawn on the board (pairs of position indices).
const SEGMENTS: [number, number][] = [
  // Outer square
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0],
  // Middle square
  [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [15, 8],
  // Inner square
  [16, 17], [17, 18], [18, 19], [19, 20], [20, 21], [21, 22], [22, 23], [23, 16],
  // Cross lines connecting the three rings at midpoints
  [1, 9], [9, 17],
  [3, 11], [11, 19],
  [5, 13], [13, 21],
  [7, 15], [15, 23],
];

const PR = 20;  // piece radius
const NR = 7;   // empty node radius
const PAD = 36;
const VSIZE = 480 + PAD * 2;

interface BoardProps {
  board: CellState[];
  selectedPos: number | null;
  validMoves: number[];
  removable: number[];
  millPositions: number[];
  onClick: (pos: number) => void;
}

export default function Board({
  board,
  selectedPos,
  validMoves,
  removable,
  millPositions,
  onClick,
}: BoardProps) {
  return (
    <div className="board-wrapper">
      <svg
        viewBox={`${-PAD} ${-PAD} ${VSIZE} ${VSIZE}`}
        className="board-svg"
        aria-label="Morabaraba game board"
      >
        {/* Wooden board background */}
        <rect
          x={-PAD} y={-PAD}
          width={VSIZE} height={VSIZE}
          fill="#5C3317"
          rx={14}
        />
        {/* Subtle grain texture overlay */}
        <rect
          x={-PAD} y={-PAD}
          width={VSIZE} height={VSIZE}
          fill="url(#grain)"
          rx={14}
          opacity={0.08}
        />

        <defs>
          <pattern id="grain" patternUnits="userSpaceOnUse" width="4" height="4">
            <line x1="0" y1="0" x2="4" y2="4" stroke="#fff" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="blackPiece" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#555" />
            <stop offset="100%" stopColor="#111" />
          </radialGradient>
          <radialGradient id="whitePiece" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="100%" stopColor="#ccc" />
          </radialGradient>
          <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Board lines */}
        {SEGMENTS.map(([a, b], i) => (
          <line
            key={i}
            x1={POS[a][0]} y1={POS[a][1]}
            x2={POS[b][0]} y2={POS[b][1]}
            stroke="#C4913A"
            strokeWidth="3"
            strokeLinecap="round"
          />
        ))}

        {/* Render each position */}
        {board.map((cell, pos) => {
          const [x, y] = POS[pos];
          const isSel = selectedPos === pos;
          const isMove = validMoves.includes(pos);
          const isRem = removable.includes(pos);
          const isMill = millPositions.includes(pos);

          return (
            <g
              key={pos}
              onClick={() => onClick(pos)}
              style={{ cursor: 'pointer' }}
              role="button"
              aria-label={`Position ${pos}${cell ? ` (${cell})` : ' (empty)'}`}
            >
              {/* Selected pulse ring */}
              {isSel && (
                <circle cx={x} cy={y} r={PR + 10} fill="none" stroke="#FFD700" strokeWidth="3" opacity="0.6" strokeDasharray="6 3" />
              )}

              {/* Valid move ring */}
              {isMove && !cell && (
                <circle cx={x} cy={y} r={PR + 6} fill="#2d8a4e33" stroke="#2d8a4e" strokeWidth="2" />
              )}

              {/* Removable piece ring */}
              {isRem && cell && (
                <circle cx={x} cy={y} r={PR + 8} fill="none" stroke="#e53e3e" strokeWidth="2.5" strokeDasharray="5 3" />
              )}

              {/* Mill glow */}
              {isMill && cell && (
                <circle cx={x} cy={y} r={PR + 5} fill="#FFD70022" stroke="#FFD700" strokeWidth="1.5" opacity="0.7" />
              )}

              {/* The piece or empty node */}
              {cell ? (
                <circle
                  cx={x} cy={y}
                  r={PR}
                  fill={cell === 'black' ? 'url(#blackPiece)' : 'url(#whitePiece)'}
                  stroke={isSel ? '#FFD700' : isRem ? '#e53e3e' : cell === 'black' ? '#333' : '#aaa'}
                  strokeWidth={isSel || isRem ? 3 : 1.5}
                  filter="url(#shadow)"
                />
              ) : (
                <circle
                  cx={x} cy={y}
                  r={isMove ? PR - 6 : NR}
                  fill={isMove ? '#2d8a4e55' : '#C4913A'}
                  stroke={isMove ? '#2d8a4e' : '#8B5E2A'}
                  strokeWidth="1.5"
                />
              )}

              {/* Highlight dot on white pieces for depth */}
              {cell === 'white' && (
                <circle cx={x - 6} cy={y - 6} r={4} fill="white" opacity="0.45" />
              )}
              {cell === 'black' && (
                <circle cx={x - 6} cy={y - 6} r={3} fill="white" opacity="0.2" />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
