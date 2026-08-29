import { getRequiredXP } from "../utils/levelSystem";

interface XPBarProps {
  level: number;
  currentXP: number;
}

function XPBar({ level, currentXP }: XPBarProps) {
  const requiredXP = getRequiredXP(level);
  const percentage = Math.min((currentXP / requiredXP) * 100, 100);

  return (
    <div>
      <p>LEVEL {level}</p>

      <div
        style={{
          width: "100%",
          height: "20px",
          background: "#222",
          borderRadius: "6px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: "#7c3aed",
            transition: "width 0.3s ease",
          }}
        />
      </div>

      <p>
        {currentXP} / {requiredXP} XP
      </p>
    </div>
  );
}

export default XPBar;