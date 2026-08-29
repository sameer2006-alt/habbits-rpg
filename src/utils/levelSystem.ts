export function getRequiredXP(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.35));
}
export function calculateLevel(totalXP: number): number {
  let level = 1;
  while (totalXP >= getRequiredXP(level)) {
    totalXP -= getRequiredXP(level);
    level++;
  }
  return level;
}
export function getXPIntoCurrentLevel(totalXP: number): number {
  let level = 1;
  while (totalXP >= getRequiredXP(level)) {
    totalXP -= getRequiredXP(level);
    level++;
  }
  return totalXP;
}
