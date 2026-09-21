import React from "react";

export interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "gold" | "cyan";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  loading = false,
  disabled,
  className = "",
  ...props
}) => {
  const variantClass = `btn-glow--${variant}`;
  const sizeClass = `btn-glow--${size}`;

  return (
    <button
      className={`btn-glow ${variantClass} ${sizeClass} ${className}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span
          style={{
            display: "inline-block",
            width: 14,
            height: 14,
            border: "2px solid rgba(255, 255, 255, 0.3)",
            borderTopColor: "currentColor",
            borderRadius: "50%",
            animation: "tacticalSpin 0.7s linear infinite",
          }}
        />
      ) : (
        icon && <span style={{ display: "inline-flex", alignItems: "center" }}>{icon}</span>
      )}
      <span>{children}</span>
      {!loading && iconRight && (
        <span style={{ display: "inline-flex", alignItems: "center" }}>{iconRight}</span>
      )}
    </button>
  );
};

export default GlowButton;

