import React from "react";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: "crimson" | "gold" | "cyan" | "emerald";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  showLeadingPoint?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = "crimson",
  size = "md",
  showLabel = false,
  label,
  showLeadingPoint = true,
  className = "",
  ...props
}) => {
  const percentage = Math.max(0, Math.min(100, Math.round((value / max) * 100)));

  const sizeClass =
    size === "lg"
      ? "progress-track--lg"
      : size === "sm"
      ? "progress-track--sm"
      : "";

  const variantClass = `progress-bar-fill--${variant}`;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.375rem" }} {...props}>
      {(showLabel || label) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {label && <span className="text-label-sm">{label}</span>}
          {showLabel && (
            <span className="text-label-sm" style={{ color: "var(--text-primary)" }}>
              {value} / {max} [{percentage}%]
            </span>
          )}
        </div>
      )}
      <div className={`progress-track ${sizeClass} ${className}`.trim()}>
        <div
          className={`progress-bar-fill ${variantClass}`}
          style={{
            width: `${percentage}%`,
            ...(!showLeadingPoint ? { "::after": { display: "none" } } : {}),
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

