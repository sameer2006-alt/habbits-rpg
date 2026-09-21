import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import "./Toast.css";

export type ToastType = "success" | "info" | "warning" | "error" | "reward";

export interface ToastProps {
  message: string | null;
  type?: ToastType;
  title?: string;
  onClose?: () => void;
  duration?: number;
}

function parseMessageDetails(rawMsg: string, fallbackType?: ToastType): {
  type: ToastType;
  category: string;
  title: string;
  desc: string;
  xpPill?: string;
  coinPill?: string;
} {
  const upper = rawMsg.toUpperCase();

  // 1. Determine Variant Type
  let resolvedType: ToastType = fallbackType || "info";
  if (!fallbackType) {
    if (upper.includes("FAIL") || upper.includes("ERROR") || upper.includes("REJECT") || upper.includes("DENIED")) {
      resolvedType = "error";
    } else if (upper.includes("INSUFFICIENT") || upper.includes("RESET") || upper.includes("WARNING") || upper.includes("CAUTION")) {
      resolvedType = "warning";
    } else if (upper.includes("ACHIEVEMENT") || upper.includes("VICTORY") || upper.includes("UNLOCKED") || upper.includes("ACCOMPLISHED")) {
      resolvedType = "reward";
    } else if (upper.includes("ADDED") || upper.includes("COMPLETE") || upper.includes("UPDATED") || upper.includes("PURCHASED") || upper.includes("EXECUTED")) {
      resolvedType = "success";
    } else {
      resolvedType = "info";
    }
  }

  // 2. Category Label
  const categoryMap: Record<ToastType, string> = {
    success: "[ SYSTEM // DIRECTIVE CONFIRMED ]",
    info: "[ SYSTEM TELEMETRY // NOTIFICATION ]",
    warning: "[ CAUTION // SYSTEM RESTRICTION ]",
    error: "[ PROTOCOL ERROR // EXCEPTION ]",
    reward: "[ SYSTEM FEAT // REWARD DISPATCH ]",
  };

  // 3. Extract XP & Coin Badges if present
  let xpPill: string | undefined;
  let coinPill: string | undefined;

  const xpMatch = rawMsg.match(/\+?\d+[\d,]*\s*XP/i);
  if (xpMatch) xpPill = xpMatch[0].trim();

  const coinMatch = rawMsg.match(/\+?\d+[\d,]*\s*(SOUL\s*)?COINS?/i);
  if (coinMatch) coinPill = coinMatch[0].trim();

  // 4. Extract Title & Description
  let title = "SYSTEM NOTIFICATION";
  let desc = rawMsg;

  if (rawMsg.includes(":")) {
    const parts = rawMsg.split(":");
    title = parts[0].trim();
    desc = parts.slice(1).join(":").trim();
  } else if (upper.includes("DAY ENDED")) {
    title = "DAY CYCLE ENDED";
    desc = rawMsg;
  } else if (upper.includes("EVENT ACCOMPLISHED")) {
    title = "EVENT ACCOMPLISHED";
    desc = "Directives resolved and rewards authenticated.";
  } else if (upper.includes("PURCHASE")) {
    title = "SANCTUM REQUISITION";
    desc = rawMsg;
  } else if (upper.includes("TITLE UNLOCKED")) {
    title = "HUNTER TITLE UNLOCKED";
    desc = rawMsg;
  } else if (upper.includes("DOUBLE XP")) {
    title = "BUFF CONSUMPTION";
    desc = rawMsg;
  }

  return {
    type: resolvedType,
    category: categoryMap[resolvedType],
    title,
    desc,
    xpPill,
    coinPill,
  };
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  title: customTitle,
  onClose,
  duration = 2000,
}) => {
  if (!message) return null;

  const details = parseMessageDetails(message, type);
  const finalTitle = customTitle || details.title;

  const renderIcon = () => {
    switch (details.type) {
      case "success":
        return <CheckCircle2 size={16} aria-hidden="true" />;
      case "warning":
        return <AlertTriangle size={16} aria-hidden="true" />;
      case "error":
        return <AlertCircle size={16} aria-hidden="true" />;
      case "reward":
        return <Award size={16} aria-hidden="true" />;
      case "info":
      default:
        return <Info size={16} aria-hidden="true" />;
    }
  };

  return (
    <div className="habbits-toast-container" aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        <motion.div
          key={message}
          className={`habbits-toast-card variant-${details.type}`}
          role="status"
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.92 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Left Vertical Beacon Anchor Bar */}
          <div className="toast-beacon-stripe" aria-hidden="true" />

          {/* Inner Content Row */}
          <div className="toast-inner-row">
            <div className="toast-left-group">
              {/* Icon Frame */}
              <div className="toast-icon-box" aria-hidden="true">
                {renderIcon()}
              </div>

              {/* Text Body */}
              <div className="toast-body">
                <div className="toast-category-tag">{details.category}</div>
                <h4 className="toast-title">{finalTitle}</h4>
                <p className="toast-desc">{details.desc}</p>

                {/* Optional Spoils Badges */}
                {(details.xpPill || details.coinPill) && (
                  <div className="toast-spoils-row">
                    {details.xpPill && (
                      <span className="toast-spoil-pill pill-xp">
                        ⚡ {details.xpPill}
                      </span>
                    )}
                    {details.coinPill && (
                      <span className="toast-spoil-pill pill-coins">
                        ● {details.coinPill}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Dismiss Button */}
            {onClose && (
              <button
                type="button"
                className="toast-dismiss-btn"
                onClick={onClose}
                aria-label="Dismiss notification"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Auto-dismiss Countdown Progress Bar */}
          <div className="toast-progress-track" aria-hidden="true">
            <div
              className="toast-progress-fill"
              style={{ animationDuration: `${duration}ms` }}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Toast;