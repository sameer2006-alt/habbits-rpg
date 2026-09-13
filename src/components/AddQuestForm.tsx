import { useState } from "react";
import type { StatName } from "../types/game";
import { QUEST_REWARD_LIMITS, validateAndSanitizeQuestReward } from "../data/quests";

interface AddQuestFormProps {
  onSubmit: (quest: {
    title: string;
    description: string;
    category: string;
    xpReward: number;
    coinReward: number;
    stat: StatName;
    statAmount: number;
  }) => void;
  onCancel: () => void;
}

const PRESETS = {
  easy: { xp: 25, coins: 5, stat: 1 },
  medium: { xp: 75, coins: 15, stat: 3 },
  hard: { xp: 150, coins: 30, stat: 5 },
};

const STAT_OPTIONS: { value: StatName; label: string }[] = [
  { value: "strength", label: "Strength" },
  { value: "intelligence", label: "Intelligence" },
  { value: "vitality", label: "Vitality" },
  { value: "focus", label: "Focus" },
  { value: "discipline", label: "Discipline" },
  { value: "consistency", label: "Consistency" },
];

export default function AddQuestForm({ onSubmit, onCancel }: AddQuestFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stat, setStat] = useState<StatName>("discipline");
  const [xpReward, setXpReward] = useState(50);
  const [coinReward, setCoinReward] = useState(10);
  const [statAmount, setStatAmount] = useState(2);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const applyPreset = (preset: keyof typeof PRESETS) => {
    setXpReward(PRESETS[preset].xp);
    setCoinReward(PRESETS[preset].coins);
    setStatAmount(PRESETS[preset].stat);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const validation = validateAndSanitizeQuestReward(xpReward, coinReward, statAmount);
    if (!validation.valid) {
      setErrorMessage(validation.error || "Reward values are outside allowed limits.");
      return;
    }

    setErrorMessage(null);
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category: stat.toUpperCase(),
      xpReward: validation.sanitized.xpReward,
      coinReward: validation.sanitized.coinReward,
      stat,
      statAmount: validation.sanitized.statAmount,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: "1px solid #444", padding: "12px", margin: "12px 0" }}>
      <h3>New Quest</h3>

      <div>
        <input
          type="text"
          placeholder="Quest title (e.g. Meditate)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label>Boosts stat: </label>
        <select value={stat} onChange={(e) => setStat(e.target.value as StatName)}>
          {STAT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span>Quick presets: </span>
        <button type="button" onClick={() => applyPreset("easy")}>Easy</button>{" "}
        <button type="button" onClick={() => applyPreset("medium")}>Medium</button>{" "}
        <button type="button" onClick={() => applyPreset("hard")}>Hard</button>
      </div>

      <div>
        <label>XP reward (1 - {QUEST_REWARD_LIMITS.maxXP}): </label>
        <input
          type="number"
          min={QUEST_REWARD_LIMITS.minXP}
          max={QUEST_REWARD_LIMITS.maxXP}
          step={1}
          value={xpReward}
          onChange={(e) => {
            setXpReward(Number(e.target.value));
            setErrorMessage(null);
          }}
        />
      </div>

      <div>
        <label>Coin reward (0 - {QUEST_REWARD_LIMITS.maxCoins}): </label>
        <input
          type="number"
          min={QUEST_REWARD_LIMITS.minCoins}
          max={QUEST_REWARD_LIMITS.maxCoins}
          step={1}
          value={coinReward}
          onChange={(e) => {
            setCoinReward(Number(e.target.value));
            setErrorMessage(null);
          }}
        />
      </div>

      <div>
        <label>Stat amount (0 - {QUEST_REWARD_LIMITS.maxStatReward}): </label>
        <input
          type="number"
          min={QUEST_REWARD_LIMITS.minStatReward}
          max={QUEST_REWARD_LIMITS.maxStatReward}
          step={1}
          value={statAmount}
          onChange={(e) => {
            setStatAmount(Number(e.target.value));
            setErrorMessage(null);
          }}
        />
      </div>

      {errorMessage && (
        <div style={{ color: "#ef4444", fontSize: "0.9rem", margin: "8px 0" }}>
          {errorMessage}
        </div>
      )}

      <button type="submit">Create Quest</button>{" "}
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
}