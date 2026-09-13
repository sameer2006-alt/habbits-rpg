import { getRankDefinition } from "../../data/ranks";

interface RankIconProps {
  rank: string;
  size?: number;
}

export default function RankIcon({ rank, size = 22 }: RankIconProps) {
  const rankDef = getRankDefinition(rank);
  const color = rankDef.color;


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
      {/* Star / rank emblem */}
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill={color}
        fillOpacity="0.2"
        stroke={color}
      />
    </svg>
  );
}

