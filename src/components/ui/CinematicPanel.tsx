import React from "react";

export interface CinematicPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "void";
  glow?: "none" | "crimson" | "gold" | "cyan";
  reticle?: boolean;
  tag?: string;
  headerTitle?: string;
  headerAction?: React.ReactNode;
}

export const CinematicPanel: React.FC<CinematicPanelProps> = ({
  children,
  variant = "default",
  glow = "none",
  reticle = false,
  tag,
  headerTitle,
  headerAction,
  className = "",
  ...props
}) => {
  const variantClass =
    variant === "elevated"
      ? "cinematic-panel--elevated"
      : variant === "void"
      ? "cinematic-panel--void"
      : "";

  const glowClass =
    glow === "crimson"
      ? "cinematic-panel--glow-crimson"
      : glow === "gold"
      ? "cinematic-panel--glow-gold"
      : glow === "cyan"
      ? "cinematic-panel--glow-cyan"
      : "";

  const reticleClass = reticle ? "reticle-frame" : "";

  return (
    <div
      className={`cinematic-panel ${variantClass} ${glowClass} ${reticleClass} ${className}`.trim()}
      {...props}
    >
      {(headerTitle || tag || headerAction) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem 1rem",
            borderBottom: "1px solid var(--burgundy-outline)",
            background: "rgba(38, 23, 29, 0.4)",
          }}
        >
          {headerTitle && (
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.875rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-primary)",
              }}
            >
              {headerTitle}
            </span>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {tag && <span className="text-label-sm">{tag}</span>}
            {headerAction}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default CinematicPanel;

