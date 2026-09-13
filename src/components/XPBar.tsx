import { motion } from "framer-motion";
import { getRequiredXP } from "../utils/levelSystem";

interface XPBarProps {
  level: number;
  currentXP: number;
  showLevelText?: boolean;
}

function XPBar({ level, currentXP, showLevelText = false }: XPBarProps) {
  const requiredXP = getRequiredXP(level);
  const safeRequiredXP = Math.max(1, requiredXP || 1);
  const safeCurrentXP = Math.max(0, currentXP || 0);
  const percentage = Math.max(0, Math.min(100, (safeCurrentXP / safeRequiredXP) * 100));

  return (
    <div className="xp-bar-container">
      {showLevelText && <p style={{ margin: "0 0 4px", fontSize: "0.8rem", fontWeight: 700 }}>LEVEL {level}</p>}

      <div
        style={{
          width: "100%",
          height: "14px",
          background: "rgba(10, 0, 6, 0.8)",
          border: "1px solid #361019",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #7c3aed, #c084fc)",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.7rem",
          color: "#8a6b70",
          marginTop: "4px",
          fontFamily: "monospace",
        }}
      >
        <span>{percentage.toFixed(0)}%</span>
        <span>
          {safeCurrentXP} / {safeRequiredXP} XP
        </span>
      </div>
    </div>
  );
}

export default XPBar;