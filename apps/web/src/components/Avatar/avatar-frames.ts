import idleRaw from './avatar-idle.txt?raw';

export const ROWS = 55;
export const COLS = 85;
export const CHAR_ASPECT = 0.6;
export const HIDE_BELOW_HEIGHT = 300;

// Rows (0-indexed) that contain the glasses/visor band. Rendered with amber
// glow. Chosen from visual inspection of the raster.
const GLASSES_ROW_START = 19;
const GLASSES_ROW_END = 22; // inclusive

// Right-arm bounding box (0-indexed). The idle raster has the arms crossed.
// Wave frames replace only this row range with alternative content.
const ARM_ROW_START = 27;
const ARM_ROW_END = 34; // inclusive

export type FrameSegment = { text: string; kind: 'body' | 'glow' };

const idleRows = idleRaw.split('\n');

function segmentRows(rows: string[]): FrameSegment[] {
  const pre = rows.slice(0, GLASSES_ROW_START).join('\n');
  const glow = rows.slice(GLASSES_ROW_START, GLASSES_ROW_END + 1).join('\n');
  const post = rows.slice(GLASSES_ROW_END + 1).join('\n');
  return [
    { kind: 'body', text: `${pre}\n` },
    { kind: 'glow', text: `${glow}\n` },
    { kind: 'body', text: post },
  ];
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
