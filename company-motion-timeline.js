/** One narrative clock shared by the particle shader and its three progress tracks. */
export const HERO_STAGE_STARTS = Object.freeze([0, 1.8, 6.2]);
export const HERO_STORY_END = 8.5;

export function getHeroTimeline(elapsed) {
  const time = Math.max(0, Number.isFinite(elapsed) ? elapsed : 0);
  const ends = [...HERO_STAGE_STARTS.slice(1), HERO_STORY_END];
  const progress = HERO_STAGE_STARTS.map((start, index) =>
    Math.min(1, Math.max(0, (time - start) / (ends[index] - start))));
  const smooth = value => value * value * (3 - 2 * value);
  return {
    step: time < HERO_STAGE_STARTS[1] ? 0 : time < HERO_STAGE_STARTS[2] ? 1 : 2,
    progress,
    gather: smooth(progress[1]),
    action: smooth(progress[2]),
    complete: time >= HERO_STORY_END,
  };
}
