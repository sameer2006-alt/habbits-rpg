import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Flame,
  Skull,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import "./EventOverlay.css";

export type EventType =
  | "quest_complete"
  | "level_up"
  | "achievement"
  | "streak_milestone"
  | "day_complete"
  | "boss_defeat"
  | "system_directive"
  | "perfect_day"
  | "weekly_challenge"
  | "monthly_challenge"
  | "season_milestone"
  | "random_event";

export interface GameEvent {
  type: EventType;
  title: string;
  subtitle?: string;
  rewards?: {
    xp?: number;
    coins?: number;
    stat?: string;
    item?: string;
  };
}

interface EventOverlayProps {
  event: GameEvent | null;
  onClose?: () => void;
}

interface EventConfig {
  icon: typeof Sparkles;
  color: string;
  label: string;
  glow: string;
  intensity: "low" | "medium" | "high" | "very-high";
}

const EVENT_CONFIG: Record<EventType, EventConfig> = {
  quest_complete: {
    icon: CheckCircle2,
    color: "#dc2626",
    label: "DIRECTIVE FULFILLED",
    glow: "rgba(220, 38, 38, 0.4)",
    intensity: "low",
  },
  level_up: {
    icon: Zap,
    color: "#ffb4ab",
    label: "LEVEL SURGE",
    glow: "rgba(220, 38, 38, 0.5)",
    intensity: "medium",
  },
  achievement: {
    icon: Trophy,
    color: "#ffd700",
    label: "TROPHY UNLOCKED",
    glow: "rgba(255, 215, 0, 0.45)",
    intensity: "medium",
  },
  streak_milestone: {
    icon: Flame,
    color: "#f97316",
    label: "DISCIPLINE STREAK",
    glow: "rgba(249, 115, 22, 0.4)",
    intensity: "medium",
  },
  day_complete: {
    icon: CheckCircle2,
    color: "#22c55e",
    label: "DAY CYCLE CONCLUDED",
    glow: "rgba(34, 197, 94, 0.4)",
    intensity: "low",
  },
  boss_defeat: {
    icon: Skull,
    color: "#ef4444",
    label: "WORLD BOSS SLAIN",
    glow: "rgba(220, 38, 38, 0.6)",
    intensity: "high",
  },
  system_directive: {
    icon: Sparkles,
    color: "#38bdf8",
    label: "SYSTEM DIRECTIVE",
    glow: "rgba(56, 189, 248, 0.45)",
    intensity: "medium",
  },
  perfect_day: {
    icon: Award,
    color: "#ffd700",
    label: "PERFECT PROTOCOL DAY",
    glow: "rgba(255, 215, 0, 0.55)",
    intensity: "medium",
  },
  weekly_challenge: {
    icon: Trophy,
    color: "#38bdf8",
    label: "WEEKLY CAMPAIGN RESOLVED",
    glow: "rgba(56, 189, 248, 0.5)",
    intensity: "medium",
  },
  monthly_challenge: {
    icon: Trophy,
    color: "#c084fc",
    label: "MONTHLY CAMPAIGN CONQUERED",
    glow: "rgba(192, 132, 252, 0.55)",
    intensity: "medium",
  },
  season_milestone: {
    icon: Sparkles,
    color: "#ffd700",
    label: "SEASON MILESTONE ATTAINED",
    glow: "rgba(255, 215, 0, 0.65)",
    intensity: "very-high",
  },
  random_event: {
    icon: Zap,
    color: "#ffb77d",
    label: "ANOMALY SURGE",
    glow: "rgba(255, 183, 125, 0.45)",
    intensity: "low",
  },
};

export default function EventOverlay({ event, onClose }: EventOverlayProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && event) {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [event, onClose]);

  if (!event) return null;

  const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.quest_complete;
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        className={`cinematic-event-overlay intensity-${config.intensity}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={event.title}
      >
        {/* Ambient Pulsing Glow */}
        <div
          className="event-ambient-glow"
          style={{ background: `radial-gradient(circle, ${config.glow}, transparent 70%)` }}
          aria-hidden="true"
        />

        {/* Modal Card */}
        <motion.div
          className="event-card-box"
          style={
            {
              "--event-border-color": config.color,
              "--event-glow-color": config.glow,
            } as React.CSSProperties
          }
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: -20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Category Tag */}
          <div className="event-category-pill" style={{ color: config.color }}>
            <span
              className="event-category-dot"
              style={{ background: config.color, boxShadow: `0 0 8px ${config.color}` }}
              aria-hidden="true"
            />
            <span>{config.label}</span>
          </div>

          {/* Icon Badge Frame */}
          <motion.div
            className="event-icon-frame"
            initial={{ scale: 0.6, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, duration: 0.4, type: "spring", stiffness: 220 }}
          >
            <Icon size={38} color={config.color} style={{ filter: `drop-shadow(0 0 14px ${config.glow})` }} />
          </motion.div>

          {/* Headline Title */}
          <motion.h2
            className="event-headline"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {event.title}
          </motion.h2>

          {/* Subtitle / Description */}
          {event.subtitle && (
            <motion.p
              className="event-subheadline"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
            >
              {event.subtitle}
            </motion.p>
          )}

          {/* Dismiss Action Button */}
          <button
            type="button"
            className="event-dismiss-cta"
            onClick={onClose}
          >
            <span>CLAIM &amp; CONTINUE</span>
            <ChevronRight size={16} aria-hidden="true" />
          </button>

          <span className="event-tap-hint">CLICK ANYWHERE OR PRESS ESC TO DISMISS</span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
