import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trophy, Flame, CheckCircle2, Skull } from "lucide-react";

export type EventType =
  | "quest_complete"
  | "achievement"
  | "streak_milestone"
  | "day_complete"
  | "boss_defeat"
  | "system_directive"
  | "perfect_day"
  | "weekly_challenge"
  | "monthly_challenge"
  | "season_milestone";

interface GameEvent {
  type: EventType;
  title: string;
  subtitle?: string;
}

interface EventOverlayProps {
  event: GameEvent | null;
  onClose?: () => void;
}

const EVENT_CONFIG: Record<EventType, {
  icon: typeof Sparkles;
  color: string;
  label: string;
  glow: string;
}> = {
  quest_complete: {
    icon: Sparkles,
    color: "#e63946",
    label: "QUEST",
    glow: "rgba(230, 57, 70, 0.3)",
  },
  achievement: {
    icon: Trophy,
    color: "#c9a876",
    label: "ACHIEVEMENT",
    glow: "rgba(201, 168, 118, 0.3)",
  },
  streak_milestone: {
    icon: Flame,
    color: "#f97316",
    label: "STREAK",
    glow: "rgba(249, 115, 22, 0.3)",
  },
  day_complete: {
    icon: CheckCircle2,
    color: "#22c55e",
    label: "SYSTEM",
    glow: "rgba(34, 197, 94, 0.3)",
  },
  boss_defeat: {
    icon: Skull,
    color: "#ec4899",
    label: "RAID BOSS SLAIN",
    glow: "rgba(236, 72, 153, 0.45)",
  },
  system_directive: {
    icon: Sparkles,
    color: "#06b6d4",
    label: "SYSTEM DIRECTIVE",
    glow: "rgba(6, 182, 212, 0.4)",
  },
  perfect_day: {
    icon: Sparkles,
    color: "#ffd700",
    label: "PERFECT DAY",
    glow: "rgba(255, 215, 0, 0.5)",
  },
  weekly_challenge: {
    icon: Trophy,
    color: "#38bdf8",
    label: "WEEKLY CHALLENGE COMPLETE",
    glow: "rgba(56, 189, 248, 0.5)",
  },
  monthly_challenge: {
    icon: Trophy,
    color: "#c084fc",
    label: "MONTHLY CAMPAIGN CONQUERED",
    glow: "rgba(192, 132, 252, 0.55)",
  },
  season_milestone: {
    icon: Sparkles,
    color: "#ffd700",
    label: "SEASON MILESTONE ATTAINED",
    glow: "rgba(255, 215, 0, 0.6)",
  },
};

export default function EventOverlay({ event, onClose }: EventOverlayProps) {
  return (
    <AnimatePresence>
      {event !== null && (
        <motion.div
          className="event-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          onClick={onClose}
          style={{ cursor: "pointer" }}
        >
          <EventContent event={event} />
          <p style={{ marginTop: 16, fontSize: "0.75rem", color: "#8a6b70", letterSpacing: "0.1em" }}>
            Click anywhere to continue
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EventContent({ event }: { event: GameEvent }) {
  const config = EVENT_CONFIG[event.type];
  const Icon = config.icon;

  return (
    <>
      {/* Background glow pulse */}
      <motion.div
        className="event-glow"
        style={{ background: `radial-gradient(circle, ${config.glow}, transparent 70%)` }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.8, 1.4], opacity: [0, 0.8, 0.4] }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Category label */}
      <motion.p
        className="event-category"
        style={{ color: config.color }}
        initial={{ opacity: 0, letterSpacing: "4px" }}
        animate={{ opacity: 1, letterSpacing: "10px" }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        {config.label}
      </motion.p>

      {/* Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.25, duration: 0.4, type: "spring", stiffness: 200 }}
      >
        <Icon size={48} color={config.color} style={{ filter: `drop-shadow(0 0 12px ${config.glow})` }} />
      </motion.div>

      {/* Title */}
      <motion.h1
        className="event-title"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.45 }}
      >
        {event.title}
      </motion.h1>

      {/* Subtitle */}
      {event.subtitle && (
        <motion.p
          className="event-subtitle"
          style={{ color: config.color }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.35 }}
        >
          {event.subtitle}
        </motion.p>
      )}
    </>
  );
}
