import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles, Filter, Edit3 } from "lucide-react";
import { AVATAR_PRESETS, type AvatarPreset, type Gender } from "../data/avatars";
import Avatar from "./Avatar";

interface AvatarSelectorProps {
  isOpen: boolean;
  currentAvatarId?: string;
  currentName?: string;
  onSelectAvatar: (avatarId: string, customName?: string) => void;
  onClose: () => void;
  playerLevel: number;
  playerRank: string;
}

export default function AvatarSelector({
  isOpen,
  currentAvatarId = "m_warrior_blade",
  currentName = "",
  onSelectAvatar,
  onClose,
  playerLevel,
  playerRank,
}: AvatarSelectorProps) {
  const [selectedId, setSelectedId] = useState<string>(currentAvatarId);
  const [desiredName, setDesiredName] = useState<string>(currentName);
  const [genderFilter, setGenderFilter] = useState<Gender | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  if (!isOpen) return null;

  const filteredPresets = AVATAR_PRESETS.filter((preset) => {
    if (genderFilter !== "all" && preset.gender !== genderFilter) return false;
    if (categoryFilter !== "all" && preset.category !== categoryFilter) return false;
    return true;
  });

  const activePreset: AvatarPreset =
    AVATAR_PRESETS.find((p) => p.id === selectedId) ||
    AVATAR_PRESETS.find((p) => p.id === currentAvatarId) ||
    AVATAR_PRESETS[0];

  const handleSelectPreset = (preset: AvatarPreset) => {
    setSelectedId(preset.id);
    // If the name is blank or currently matches another preset's name, update it to the new preset
    if (
      !desiredName.trim() ||
      AVATAR_PRESETS.some((p) => p.name.toLowerCase() === desiredName.trim().toLowerCase())
    ) {
      setDesiredName(preset.name);
    }
  };

  const handleConfirm = () => {
    const finalName = desiredName.trim() || activePreset.name;
    onSelectAvatar(selectedId, finalName);
    onClose();
  };

  const categories = ["all", "warrior", "mage", "rogue", "cyber", "monk", "royal"];

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div
          className="avatar-modal-shell"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2 }}
        >
          {/* Modal Header */}
          <div className="avatar-modal-header">
            <div className="avatar-modal-title-wrap">
              <div className="avatar-modal-badge">
                <Sparkles size={14} /> Persona Customization
              </div>
              <h2>Choose Avatar & Set Your Name</h2>
              <p>Choose an avatar persona and customize your character name.</p>
            </div>
            <button className="avatar-modal-close" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>

          {/* Active Preview & Custom Name Banner */}
          <div className="avatar-active-preview-bar">
            <div className="avatar-preview-portrait">
              <Avatar
                avatarId={activePreset.id}
                level={playerLevel}
                rank={playerRank}
                size={74}
                showRank={false}
                showLevel={true}
              />
            </div>

            <div className="avatar-preview-details">
              <div className="avatar-preview-name-row">
                <span
                  className="avatar-preview-tag"
                  style={{
                    borderColor: activePreset.accentColor,
                    color: activePreset.accentColor,
                  }}
                >
                  {activePreset.gender === "female" ? "♀ Female" : "♂ Male"} • {activePreset.category.toUpperCase()}
                </span>
                <span className="avatar-preview-title">{activePreset.title}</span>
              </div>

              {/* User Custom Name Input Field */}
              <div className="avatar-name-input-group">
                <label htmlFor="avatar-custom-name" className="avatar-name-input-label">
                  <Edit3 size={12} /> Custom Character Name:
                </label>
                <div className="avatar-name-input-row">
                  <input
                    id="avatar-custom-name"
                    type="text"
                    className="avatar-custom-name-field"
                    value={desiredName}
                    onChange={(e) => setDesiredName(e.target.value)}
                    placeholder={`e.g. ${activePreset.name}`}
                    maxLength={24}
                  />
                  <button
                    type="button"
                    className="avatar-name-preset-pill"
                    onClick={() => setDesiredName(activePreset.name)}
                    title={`Use preset default name: ${activePreset.name}`}
                  >
                    Reset to &ldquo;{activePreset.name}&rdquo;
                  </button>
                </div>
              </div>
            </div>

            <button
              className="action-btn avatar-confirm-btn"
              onClick={handleConfirm}
            >
              <Check size={16} /> Equip Avatar
            </button>
          </div>

          {/* Filter Controls */}
          <div className="avatar-filters-row">
            {/* Gender Filters */}
            <div className="avatar-gender-tabs">
              {(["all", "male", "female"] as const).map((g) => (
                <button
                  key={g}
                  className={`avatar-filter-pill ${genderFilter === g ? "active" : ""}`}
                  onClick={() => setGenderFilter(g)}
                >
                  {g === "all" ? "All Genders" : g === "male" ? "♂ Male (8)" : "♀ Female (8)"}
                </button>
              ))}
            </div>

            {/* Category Filter Pills */}
            <div className="avatar-category-tags">
              <span className="avatar-cat-label"><Filter size={12} /> Class:</span>
              {categories.map((c) => (
                <button
                  key={c}
                  className={`avatar-cat-pill ${categoryFilter === c ? "active" : ""}`}
                  onClick={() => setCategoryFilter(c)}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Cards Grid */}
          <div className="avatar-grid-scroll">
            <div className="avatar-presets-grid">
              {filteredPresets.map((preset) => {
                const isSelected = preset.id === selectedId;
                const isCurrentlyEquipped = preset.id === currentAvatarId;

                return (
                  <div
                    key={preset.id}
                    className={`avatar-preset-card ${isSelected ? "selected" : ""} ${
                      isCurrentlyEquipped ? "equipped" : ""
                    }`}
                    onClick={() => handleSelectPreset(preset)}
                  >
                    {isCurrentlyEquipped && (
                      <span className="avatar-equipped-badge">EQUIPPED</span>
                    )}
                    {isSelected && !isCurrentlyEquipped && (
                      <span className="avatar-selected-badge"><Check size={11} /> READY</span>
                    )}

                    <div className="avatar-card-portrait">
                      <Avatar
                        avatarId={preset.id}
                        level={playerLevel}
                        rank={playerRank}
                        size={64}
                        showRank={false}
                        showLevel={false}
                      />
                    </div>

                    <div className="avatar-card-info">
                      <div className="avatar-card-name-row">
                        <strong className="avatar-card-name">{preset.name}</strong>
                        <span className="avatar-card-gender">
                          {preset.gender === "female" ? "♀" : "♂"}
                        </span>
                      </div>
                      <div className="avatar-card-title">{preset.title}</div>
                      <div
                        className="avatar-card-archetype"
                        style={{ color: preset.accentColor }}
                      >
                        {preset.category}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="avatar-modal-footer">
            <div className="avatar-count-hint">
              Selected: <strong style={{ color: "#f2e9e9" }}>{desiredName.trim() || activePreset.name}</strong> ({activePreset.title})
            </div>
            <div className="avatar-modal-actions">
              <button className="action-btn secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="action-btn primary" onClick={handleConfirm}>
                <Check size={16} /> Confirm & Save
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
