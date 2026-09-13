import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, X, ShieldAlert } from "lucide-react";
import { AVATAR_PRESETS, type AvatarPreset, type Gender } from "../data/avatars";
import Avatar from "./Avatar";

interface SystemIdentityModalProps {
  isOpen: boolean;
  currentName?: string;
  currentAvatarId?: string;
  playerLevel: number;
  playerRank: string;
  onConfirm: (name: string, avatarId: string) => void;
  onClose: () => void;
}

export default function SystemIdentityModal({
  isOpen,
  currentName = "",
  currentAvatarId = "m_warrior_blade",
  playerLevel,
  playerRank,
  onConfirm,
  onClose,
}: SystemIdentityModalProps) {
  const [selectedId, setSelectedId] = useState<string>(currentAvatarId);
  const [genderFilter, setGenderFilter] = useState<Gender | "all">("all");
  const [nameInput, setNameInput] = useState<string>(
    currentName && currentName !== "Player" ? currentName : ""
  );

  if (!isOpen) return null;

  const filteredPresets = AVATAR_PRESETS.filter((preset) => {
    if (genderFilter !== "all" && preset.gender !== genderFilter) return false;
    return true;
  });

  const activePreset: AvatarPreset =
    AVATAR_PRESETS.find((p) => p.id === selectedId) ||
    AVATAR_PRESETS.find((p) => p.id === currentAvatarId) ||
    AVATAR_PRESETS[0];

  const handleSelectPreset = (preset: AvatarPreset) => {
    setSelectedId(preset.id);
    // If the name is blank or matches another preset's name, suggest the newly selected preset's name
    if (
      !nameInput.trim() ||
      AVATAR_PRESETS.some((p) => p.name.toLowerCase() === nameInput.trim().toLowerCase())
    ) {
      setNameInput(preset.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = nameInput.trim() || activePreset.name;
    onConfirm(finalName, selectedId);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div
          className="system-identity-window"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {/* Holographic Top Banner */}
          <div className="system-identity-topbar">
            <div className="system-identity-topbar-left">
              <ShieldAlert size={16} className="system-hologram-icon" />
              <span className="system-tag-label">[ SYSTEM DIRECTIVE: IDENTIFICATION ]</span>
            </div>
            <button className="system-close-btn" onClick={onClose} aria-label="Close">
              <X size={16} />
            </button>
          </div>

          {/* System Prompt Question */}
          <div className="system-identity-header">
            <h2 className="system-identity-question">
              Awakened Player, what shall you be identified as?
            </h2>
            <p className="system-identity-subtext">
              The System requests your designation and avatar persona to calibrate your quests, rank progression, and battle status.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="system-identity-form">
            {/* Step 1: Designation / Name Input */}
            <div className="system-step-box">
              <div className="system-step-title">
                <span className="system-step-number">01</span>
                <span>Enter Your Chosen Name / Alias:</span>
              </div>
              <div className="system-name-input-wrapper">
                <input
                  type="text"
                  className="system-name-input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder={`e.g. ${activePreset.name}, Shadow, Hunter...`}
                  maxLength={24}
                  autoFocus
                />
                <button
                  type="button"
                  className="system-name-preset-btn"
                  onClick={() => setNameInput(activePreset.name)}
                >
                  Adopt &ldquo;{activePreset.name}&rdquo;
                </button>
              </div>
              <div className="system-input-hint">
                This name will be displayed in your Profile, Rank Status, and Quest Log.
              </div>
            </div>

            {/* Step 2: Avatar Persona Selection */}
            <div className="system-step-box">
              <div className="system-step-title-row">
                <div className="system-step-title">
                  <span className="system-step-number">02</span>
                  <span>Choose Your Avatar Persona:</span>
                </div>
                {/* Gender Tabs */}
                <div className="system-gender-selector">
                  {(["all", "male", "female"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      className={`system-gender-btn ${genderFilter === g ? "active" : ""}`}
                      onClick={() => setGenderFilter(g)}
                    >
                      {g === "all" ? "All" : g === "male" ? "♂ Male (8)" : "♀ Female (8)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Persona Preview Strip */}
              <div className="system-active-avatar-strip">
                <Avatar
                  avatarId={activePreset.id}
                  level={playerLevel}
                  rank={playerRank}
                  size={64}
                  showRank={false}
                  showLevel={true}
                />
                <div className="system-strip-info">
                  <div className="system-strip-title-row">
                    <strong className="system-strip-name">
                      {nameInput.trim() || activePreset.name}
                    </strong>
                    <span
                      className="system-strip-tag"
                      style={{
                        borderColor: activePreset.accentColor,
                        color: activePreset.accentColor,
                      }}
                    >
                      {activePreset.gender === "female" ? "Female" : "Male"} • {activePreset.category.toUpperCase()}
                    </span>
                  </div>
                  <div className="system-strip-subtitle">{activePreset.title}</div>
                </div>
              </div>

              {/* Avatar Grid */}
              <div className="system-avatar-scroll-area">
                <div className="system-avatar-cards-grid">
                  {filteredPresets.map((preset) => {
                    const isSelected = preset.id === selectedId;
                    return (
                      <div
                        key={preset.id}
                        className={`system-avatar-option-card ${isSelected ? "selected" : ""}`}
                        onClick={() => handleSelectPreset(preset)}
                      >
                        {isSelected && (
                          <div className="system-selected-check">
                            <Check size={11} />
                          </div>
                        )}
                        <Avatar
                          avatarId={preset.id}
                          level={playerLevel}
                          rank={playerRank}
                          size={52}
                          showRank={false}
                          showLevel={false}
                        />
                        <span className="system-card-name">{preset.name}</span>
                        <span className="system-card-class" style={{ color: preset.accentColor }}>
                          {preset.category}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="system-identity-actions">
              <button
                type="button"
                className="action-btn secondary"
                onClick={onClose}
              >
                Decide Later
              </button>
              <button
                type="submit"
                className="system-confirm-btn"
              >
                <Sparkles size={16} /> CONFIRM IDENTITY & INITIALIZE
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

