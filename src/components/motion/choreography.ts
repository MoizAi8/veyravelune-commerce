function ease(value: number, start: number, end: number) {
  const t = Math.min(1, Math.max(0, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

export const chapterStarts = [0, .08, .30, .48, .68, .85] as const;
export const chapterStops = [0, .20, .40, .58, .79, .98] as const;

export function chapterAt(value: number) {
  return chapterStarts.reduce<number>((current, start, index) => value >= start ? index : current, 0);
}

export function choreography(value: number) {
  const enter = ease(value, .035, .14);
  const turn = ease(value, .12, .28);
  const pass = ease(value, .26, .36);
  const inspect = ease(value, .32, .47);
  const cross = ease(value, .445, .545);
  const orbit = ease(value, .49, .67);
  const lift = ease(value, .635, .736);
  const gallery = ease(value, .67, .775);
  const final = ease(value, .84, .945);
  return {
    sofa: { x: 1.12 + (1-enter)*6 - pass*8, z: -.95*(1-enter) + turn*.35 - pass*2.3, angle: -.88 + enter*.32 + turn*.83 + pass*.58 },
    vase: { x: 1.62 + (1-pass)*6 - cross*7, z: -.85 + inspect*1.16 - cross*1.75, angle: -.42 + pass*.84 + inspect*1.4 + cross*.6 },
    bed: { x: 1.24 + (1-cross)*7 - lift*8, z: -.32 + orbit*.22 - lift*2, angle: -.94 + orbit*.54 },
    chandelier: { x: 1.48, y: 4.9-gallery*3.79, angle: -.43 + gallery*.91 },
    gallery, chamber: cross*(1-lift), warmth: gallery, veil: enter*(1-final),
    camera: { x: .26 + turn*.32 - inspect*.35 + orbit*.48 - gallery*.55, y: 1.62 + enter*.18 - inspect*.26 + orbit*.45 - gallery*.42, z: 7.2 - enter*.62 - turn*.18 + cross*.28 + gallery*.35, aim: .95 + gallery*.31 },
  };
}
