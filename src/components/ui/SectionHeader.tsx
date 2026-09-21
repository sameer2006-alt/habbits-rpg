import React from "react";

export interface SectionHeaderProps {
  category?: string;
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  category,
  title,
  action,
  className = "",
}) => {
  return (
    <div
      className={`section-header ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "1rem",
        paddingBottom: "0.5rem",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div>
        {category && (
          <span
            className="text-label-sm"
            style={{ color: "var(--crimson-light)", display: "block", marginBottom: "0.2rem" }}
          >
            {category}
          </span>
        )}
        <h2 className="text-headline-sm" style={{ margin: 0 }}>
          {title}
        </h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default SectionHeader;

