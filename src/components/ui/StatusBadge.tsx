import React from "react";

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "crimson" | "gold" | "cyan" | "emerald";
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant = "default",
  icon,
  children,
  className = "",
  ...props
}) => {
  const variantClass = variant !== "default" ? `status-badge--${variant}` : "";

  return (
    <span className={`status-badge ${variantClass} ${className}`.trim()} {...props}>
      {icon && <span style={{ display: "inline-flex", alignItems: "center" }}>{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default StatusBadge;

