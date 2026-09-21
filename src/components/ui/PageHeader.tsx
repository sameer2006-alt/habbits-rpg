import React from "react";

export interface PageHeaderProps {
  tag?: string;
  tagIcon?: React.ReactNode;
  title: string;
  subtitle?: string;
  meta?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  tag,
  tagIcon,
  title,
  subtitle,
  meta,
  className = "",
}) => {
  return (
    <div
      className={`page-header ${className}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        marginBottom: "1.75rem",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          {tag && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                color: "var(--crimson-light)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.6875rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              {tagIcon}
              <span>{tag}</span>
            </div>
          )}
          <h1 className="text-headline-lg" style={{ margin: 0 }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-body-sm" style={{ margin: 0, maxWidth: "680px" }}>
              {subtitle}
            </p>
          )}
        </div>

        {meta && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.625rem",
            }}
          >
            {meta}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;

