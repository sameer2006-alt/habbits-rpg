import type { AchievementIcon } from "../../types/game";

interface AchievementIconProps {
  icon: AchievementIcon;
  size?: number;
  color?: string;
}

const paths: Record<AchievementIcon, string> = {
  sword: "M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2",
  flame: "M12 22c-4 0-7-3-7-7 0-3 2-5 4-7l1-1 1 1c1.5 1.5 2 3.5 1 5.5 1-.5 2-2 2-4 2 2 3 4 3 5.5 0 4-2.5 7-5 7z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4v14h16V4H6.5A2.5 2.5 0 0 0 4 6.5V4z",
  code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  dumbbell: "M6.5 6.5h11M6 12H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h2M18 12h2a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-2M6 16H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h2M18 16h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-2M6 8v8M18 8v8",
  drop: "M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42",
  crown: "M2 4l3 12h14l3-12-6 7-4-9-4 9-6-7z",
  skull: "M12 2a8 8 0 0 0-8 8c0 3 1.5 5.5 4 7v3h8v-3c2.5-1.5 4-4 4-7a8 8 0 0 0-8-8zM9 14h.01M15 14h.01",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z",
  gem: "M6 3h12l4 6-10 12L2 9l4-6z",
  coin: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v12M8 12h8",
  heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z",
  target: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  lightning: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  scroll: "M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 0 1-2 2zM6 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h2V5a2 2 0 0 0-2-2zM10 3v14h10V5a2 2 0 0 0-2-2H10z",
  mountain: "M3 20L9 8l4 6 3-4 5 10H3z",
  moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  trophy: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 22V14M14 22V14M6 2h12v7a6 6 0 0 1-12 0V2z",
  brain: "M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2zM9 18h6M10 22h4",
  chain: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
};

export default function AchievementIconSvg({ icon, size = 20, color = "currentColor" }: AchievementIconProps) {
  const d = paths[icon] ?? paths.star;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}
