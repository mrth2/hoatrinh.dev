import idleRaw from './avatar-idle.txt?raw';

export const ROWS = 55;
export const COLS = 85;
export const CHAR_ASPECT = 0.6;
export const HIDE_BELOW_HEIGHT = 300;

// Rows (0-indexed) that contain the glasses/visor region.
const GLASSES_ROW_START = 20;
const GLASSES_ROW_END = 33; // inclusive

// Columns (0-indexed) within each glasses row that receive the amber glow.
// Row 23 (main visor): left lens cols 20-44, bridge 45-54, right lens 55-79.
// Using this range clips the face-outline chars on both sides.
const GLASSES_COL_START = 20;
const GLASSES_COL_END = 79; // inclusive

// Right-arm bounding box (0-indexed). The idle raster has the arms crossed.
// Wave frames replace only this row range with alternative content.
const ARM_ROW_START = 27;
const ARM_ROW_END = 34; // inclusive

// Eye/pupil rows within the visor interior (0-indexed).
// Replacing ↑ arrows only in the inner pupil zones of each lens
// simulates the avatar looking left or right.
// Inner zones were determined by mapping actual ↑ clusters:
//   left pupil:  cols 37-39 (rows 24-26)  → target range 35-43
//   right pupil: cols 60-62 (rows 24-26)  → target range 58-66
// This avoids the outer-left cluster (21-26), lone bridge-edge chars
// (44, 55), and outer-right cluster (73-78).
const EYE_ROW_START = 23;
const EYE_ROW_END = 26;
const BRIDGE_COL_START = 45; // left lens: cols 20-44, bridge: 45-54, right lens: 55-79
const BRIDGE_COL_END = 54;
const LEFT_PUPIL_START = 35;
const LEFT_PUPIL_END = 43;
const RIGHT_PUPIL_START = 58;
const RIGHT_PUPIL_END = 66;

export type FrameSegment = { text: string; kind: 'body' | 'glow' };

const idleRows = idleRaw.split('\n');

function segmentRows(rows: string[]): FrameSegment[] {
  const segments: FrameSegment[] = [];

  const pre = rows.slice(0, GLASSES_ROW_START).join('\n');
  segments.push({ kind: 'body', text: `${pre}\n` });

  for (let r = GLASSES_ROW_START; r <= GLASSES_ROW_END; r++) {
    const row = rows[r] ?? '';
    const left = row.slice(0, GLASSES_COL_START);
    const center = row.slice(GLASSES_COL_START, GLASSES_COL_END + 1);
    const right = row.slice(GLASSES_COL_END + 1);
    if (left) segments.push({ kind: 'body', text: left });
    if (center) segments.push({ kind: 'glow', text: center });
    segments.push({ kind: 'body', text: `${right}\n` });
  }

  const post = rows.slice(GLASSES_ROW_END + 1).join('\n');
  segments.push({ kind: 'body', text: post });

  return segments;
}

function withArm(rows: string[], armRows: string[]): string[] {
  const out = [...rows];
  for (let i = 0; i < armRows.length; i++) {
    const target = ARM_ROW_START + i;
    if (target <= ARM_ROW_END && target < out.length) {
      out[target] = armRows[i] ?? out[target] ?? '';
    }
  }
  return out;
}

// Arm-region replacement strings. Each string is a full row (COLS chars) but
// only the right-arm area differs from FRAME_IDLE's corresponding row. All
// three poses raise the right arm progressively.
// Row indices map to ARM_ROW_START..ARM_ROW_END.

const WAVE_1_ARM_ROWS: string[] = [
  ' ↙↙↓↖ →↙↙↗↑↙↓→↙↗↑      ↑                    ↙↑        ↑→                    ↑↑     ↗↑→ ↖            ',
  ' ↙↙↓  ↘↙↙↗↑→↙    ↑      ↑↑                  ↑            ↑                  ↑↑      ↑↗→ ↗→↑→↓→↑↗↓↓→↑ ',
  ' ↙←↓↖ ↘↙↗↑→  →↘↘↙↑↑     ↑  ↑↑↑↑↖          ↑↑              ↑↑           →↑↑↑  ↑     →↑←↗ ↓            ',
  '↖↙↙↓↖ →↘↗↑↖↘↙↙←←←↑↑     ↑           ↓→→→                    →↑↗↘↖          ↑↗    ↑↑↓↖↗     ←    ↖↗↘ ',
  ' ↖↙↓↖ ←→↗↑↙↙↙↙↙←↖↑↑↑   ↑                                                  ↑   →↑↑   ↑ ↙↖←    ↙↖ ←  ',
  ' ↖↙↙→  →↗↑↓←↙↙←←←↖↖↑↑↑↑↑↑                                                ↑↑↑↑↑↑↘↙→→   ↑↓← ↓↓    ↖↖ ',
  '  ↙↙→  ↗↗↑↓↙↙↙↙↙↙↙↖↖↖  ↑↑                 ↑↑        ↑↑                  ↑  ←↖↙↙↙↙↓→↑     ←        ',
  ' ↑↙→↑↙ ↑↖↖↑↑↗↑→→→→→→→→↘↑→ ↑                      ↗↑↓                     ↑↑↗↑↘↓↓↓↓↓↓↙↑ ↖ ↗    ↙↓↖   ',
];

const WAVE_2_ARM_ROWS: string[] = [
  ' ↙↙↓↖ →↙↙↗→↖↓→↙↗↑      ↑                    ↙↑        ↑→                    ↑↑     ↗↑→ ↖            ',
  ' ↙↙↓  ↘↙↙↗→↖    ↑      ↑↑                  ↑            ↑                  ↑↑      ↑↗→ ↗→↑→↓→↑↗↓↓→↑ ',
  ' ↙←↓↖ ↘↙↗→↖  →↘↘↙↑↑     ↑  ↑↑↑↑↖          ↑↑              ↑↑           →↑↑↑  ↑     →↑←↗ ↓            ',
  '↖↙↙↓↖ →↘↗→↖↘↙↙←←←↑↑     ↑           ↓→→→                    →↑↗↘↖          ↑↗    ↑↑↓↖↗     ←    ↖↗↘ ',
  ' ↖↙↓↖ ←→↗→↖↙↙↙↙←↖↑↑↑   ↑                                                  ↑   →↑↑   ↑ ↙↖←    ↙↖ ←  ',
  ' ↖↙↙→  →↗→↖↓←↙↙←←←↖↖↑↑↑↑↑↑                                                ↑↑↑↑↑↑↘↙→→   ↑↓← ↓↓    ↖↖ ',
  '  ↙↙→  ↗↗↗↓↙↙↙↙↙↙↙↖↖↖  ↑↑                 ↑↑        ↑↑                  ↑  ←↖↙↙↙↙↓→↑     ←        ',
  ' ↑↙→↑↙ ↑↖↖↑↑↗↑→→→→→→→→↘↑→ ↑                      ↗↑↓                     ↑↑↗↑↘↓↓↓↓↓↓↙↑ ↖ ↗    ↙↓↖   ',
];

const WAVE_3_ARM_ROWS: string[] = [
  ' ↙↙↓↖ →↙↙↗↗↖↓→↙↗↑      ↑                    ↙↑        ↑→                    ↑↑     ↗↑→ ↖            ',
  ' ↙↙↓  ↘↙↙↗↗↖    ↑      ↑↑                  ↑            ↑                  ↑↑      ↑↗→ ↗→↑→↓→↑↗↓↓→↑ ',
  ' ↙←↓↖ ↘↙↗↗↖  →↘↘↙↑↑     ↑  ↑↑↑↑↖          ↑↑              ↑↑           →↑↑↑  ↑     →↑←↗ ↓            ',
  '↖↙↙↓↖ →↘↗↗↖↘↙↙←←←↑↑     ↑           ↓→→→                    →↑↗↘↖          ↑↗    ↑↑↓↖↗     ←    ↖↗↘ ',
  ' ↖↙↓↖ ←→↗↗↖↙↙↙↙←↖↑↑↑   ↑                                                  ↑   →↑↑   ↑ ↙↖←    ↙↖ ←  ',
  ' ↖↙↙→  →↗↗↖↓←↙↙←←←↖↖↑↑↑↑↑↑                                                ↑↑↑↑↑↑↘↙→→   ↑↓← ↓↓    ↖↖ ',
  '  ↙↙→  ↗↗↗↓↙↙↙↙↙↙↙↖↖↖  ↑↑                 ↑↑        ↑↑                  ↑  ←↖↙↙↙↙↓→↑     ←        ',
  ' ↑↙→↑↙ ↑↖↖↑↑↗↑→→→→→→→→↘↑→ ↑                      ↗↑↓                     ↑↑↗↑↘↓↓↓↓↓↓↙↑ ↖ ↗    ↙↓↖   ',
];

export const FRAME_IDLE: FrameSegment[] = segmentRows(idleRows);
export const FRAME_WAVE_1: FrameSegment[] = segmentRows(withArm(idleRows, WAVE_1_ARM_ROWS));
export const FRAME_WAVE_2: FrameSegment[] = segmentRows(withArm(idleRows, WAVE_2_ARM_ROWS));
export const FRAME_WAVE_3: FrameSegment[] = segmentRows(withArm(idleRows, WAVE_3_ARM_ROWS));

export const WAVE_SEQUENCE: FrameSegment[][] = [
  FRAME_WAVE_1,
  FRAME_WAVE_2,
  FRAME_WAVE_3,
  FRAME_WAVE_2,
  FRAME_WAVE_1,
  FRAME_IDLE,
];
export const WAVE_FRAME_MS = 250;

// Shift ↑ arrows in the inner pupil zones by colShift columns.
// Clears each ↑ from its idle position and places it colShift away.
// Non-↑ chars and chars outside the zones are untouched.
function withEyeShift(rows: string[], colShift: number, arrowChar = '↑'): string[] {
  return rows.map((row, r) => {
    if (r < EYE_ROW_START || r > EYE_ROW_END) return row;
    const chars = [...row];
    function shiftZone(start: number, end: number) {
      const ups: number[] = [];
      for (let c = start; c <= end; c++) {
        if (row[c] === '↑') ups.push(c);
      }
      for (const c of ups) chars[c] = ' ';
      for (const c of ups) {
        const nc = c + colShift;
        if (nc >= 0 && nc < chars.length) chars[nc] = arrowChar;
      }
    }
    shiftZone(LEFT_PUPIL_START, LEFT_PUPIL_END);
    shiftZone(RIGHT_PUPIL_START, RIGHT_PUPIL_END);
    return chars.join('');
  });
}

// Diagonal and cardinal frames — each step is 45° of rotation + 2-col position shift.
// Shift interpolates: 0 → -2 → -4 → -2 → 0 → +2 → +4 → +2 → 0
const FRAME_STEP_UL: FrameSegment[] = segmentRows(withEyeShift(idleRows, -2, '↖'));
export const FRAME_LOOK_LEFT: FrameSegment[] = segmentRows(withEyeShift(idleRows, -4, '←'));
const FRAME_STEP_DL: FrameSegment[] = segmentRows(withEyeShift(idleRows, -2, '↙'));
export const FRAME_LOOK_DOWN: FrameSegment[] = segmentRows(withEyeShift(idleRows, 0, '↓'));
const FRAME_STEP_DR: FrameSegment[] = segmentRows(withEyeShift(idleRows, 2, '↘'));
export const FRAME_LOOK_RIGHT: FrameSegment[] = segmentRows(withEyeShift(idleRows, 4, '→'));
const FRAME_STEP_UR: FrameSegment[] = segmentRows(withEyeShift(idleRows, 2, '↗'));

// Full smooth cycle: ↑ → ↖ → ← → ↙ → ↓ → ↘ → → → ↗ → ↑
export const LOOKAROUND_SEQUENCE: FrameSegment[][] = [
  FRAME_STEP_UL,
  FRAME_LOOK_LEFT,
  FRAME_STEP_DL,
  FRAME_LOOK_DOWN,
  FRAME_STEP_DR,
  FRAME_LOOK_RIGHT,
  FRAME_STEP_UR,
  FRAME_IDLE,
];
export const LOOKAROUND_FRAME_MS = 300;
