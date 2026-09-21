import React from "react";

export interface DarkInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  prefixLabel?: string;
  error?: string | boolean;
  helperText?: string;
  wrapperClassName?: string;
}

export const DarkInput = React.forwardRef<HTMLInputElement, DarkInputProps>(
  (
    {
      prefixLabel,
      error,
      helperText,
      wrapperClassName = "",
      className = "",
      ...props
    },
    ref
  ) => {
    const isError = Boolean(error);

    return (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <div
          className={`dark-input-wrapper ${isError ? "dark-input-wrapper--error" : ""} ${wrapperClassName}`.trim()}
        >
          {prefixLabel && <span className="dark-input-prefix">{prefixLabel}</span>}
          <input
            ref={ref}
            className={`dark-input-field ${className}`.trim()}
            {...props}
          />
        </div>
        {typeof error === "string" && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6875rem",
              color: "var(--crimson-light)",
              paddingLeft: "0.25rem",
            }}
          >
            {error}
          </span>
        )}
        {!isError && helperText && (
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.6875rem",
              color: "var(--text-dim)",
              paddingLeft: "0.25rem",
            }}
          >
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

DarkInput.displayName = "DarkInput";

export default DarkInput;

