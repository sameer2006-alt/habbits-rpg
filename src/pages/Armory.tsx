import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Sparkles,
  Package,
  Crown,
  Check,
  Lock,
  Save,
  Info,
  Layers,
  ArrowRightLeft,
  Swords,
  Cpu,
  ChevronDown,
  ChevronUp,
  Pencil,
  X,
} from "lucide-react";
import type { Player, StatName } from "../types/game";
import {
  type ItemDefinition,
  type EquipmentSlot,
  type ItemCategory,
  RARITY_COLORS,
} from "../data/items";
import {
  fetchPlayerInventory,
  type PlayerInventoryItem,
} from "../lib/inventoryData";
import {
  type PlayerEquipment,
  equipItem,
  unequipSlot,
  calculateEffectiveStats,
} from "../lib/equipmentData";
import {
  fetchPlayerTitles,
  equipTitle,
  type TitleDefinition,
} from "../lib/titlesData";
import { TITLES_CATALOG } from "../data/titles";
import {
  fetchPlayerLoadouts,
  saveLoadout,
  equipLoadout,
  type PlayerLoadout,
  MAX_LOADOUTS,
} from "../lib/loadoutsData";
import { AVATAR_PRESETS } from "../data/avatars";
import { getRankDefinition } from "../data/ranks";
import Avatar from "../components/Avatar";
import "./Armory.css";

interface ArmoryProps {
  userId: string;
  player: Player;
  equipment: PlayerEquipment;
  onEquipmentChange: (eq: PlayerEquipment) => void;
  equippedTitle?: TitleDefinition | null;
  onTitleChange: (title: TitleDefinition) => void;
  powerScore: number;
}

type ArmoryTab = "equipment" | "inventory" | "loadouts" | "titles";

export default function Armory({
  userId,
  player,
  equipment,
  onEquipmentChange,
  equippedTitle,
  onTitleChange,
  powerScore,
}: ArmoryProps) {
  const [activeTab, setActiveTab] = useState<ArmoryTab>("equipment");
  const [inventory, setInventory] = useState<PlayerInventoryItem[]>([]);
  const [unlockedTitleIds, setUnlockedTitleIds] = useState<string[]>([]);
  const [loadouts, setLoadouts] = useState<PlayerLoadout[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | "all">("all");
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [showPowerFormula, setShowPowerFormula] = useState(false);

  // Loadout name editing
  const [editingLoadoutSlot, setEditingLoadoutSlot] = useState<number | null>(null);
  const [loadoutNameInput, setLoadoutNameInput] = useState("");

  const rankDef = getRankDefinition(player.progress.rank);

  const currentPreset =
    AVATAR_PRESETS.find((p) => p.id === player.profile?.avatarId) ??
    AVATAR_PRESETS[0];

  const displayedName = player.profile?.name || currentPreset.name;

  const effectiveStats = useMemo(() => {
    return calculateEffectiveStats(player.stats, equipment);
  }, [player.stats, equipment]);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setStatusMessage({ text, type });
    window.setTimeout(() => setStatusMessage(null), 3500);
  };

  const loadData = useCallback(async () => {
    try {
      const [invData, titlesData, loadoutsData] = await Promise.all([
        fetchPlayerInventory(userId),
        fetchPlayerTitles(userId),
        fetchPlayerLoadouts(userId),
      ]);
      setInventory(invData);
      setUnlockedTitleIds(titlesData);
      setLoadouts(loadoutsData);
    } catch (err) {
      console.warn("Failed to load armory data:", err);
    }
  }, [userId]);

  useEffect(() => {
    let isMounted = true;
    if (userId) {
      Promise.all([
        fetchPlayerInventory(userId),
        fetchPlayerTitles(userId),
        fetchPlayerLoadouts(userId),
      ])
        .then(([invData, titlesData, loadoutsData]) => {
          if (isMounted) {
            setInventory(invData);
            setUnlockedTitleIds(titlesData);
            setLoadouts(loadoutsData);
          }
        })
        .catch((err) => {
          console.warn("Failed to load armory data:", err);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Equip handler
  const handleEquipItem = async (itemId: string) => {
    const res = await equipItem(userId, itemId);
    if (res.success && res.equipment) {
      onEquipmentChange(res.equipment);
      showFeedback(`Equipped gear item!`);
      void loadData();
    } else {
      showFeedback(res.error || "Failed to equip item.", "error");
    }
  };

  // Unequip handler
  const handleUnequip = async (slot: EquipmentSlot) => {
    const updated = await unequipSlot(userId, slot);
    onEquipmentChange(updated);
    showFeedback(`Unequipped ${slot}.`);
    void loadData();
  };

  // Title equip handler
  const handleEquipTitle = async (titleId: string) => {
    const res = await equipTitle(userId, titleId);
    if (res.success && res.title) {
      onTitleChange(res.title);
      showFeedback(`Equipped title: "${res.title.name}"!`);
    } else {
      showFeedback(res.error || "Failed to equip title.", "error");
    }
  };

  // Loadout save handler
  const handleSaveCurrentLoadout = async (slotNumber: number, customName?: string) => {
    const currentName = customName || loadouts.find((l) => l.slotNumber === slotNumber)?.name || `Loadout Preset ${slotNumber}`;
    const res = await saveLoadout(userId, slotNumber, currentName, {
      weaponItemId: equipment.weaponItemId,
      armorItemId: equipment.armorItemId,
      accessoryItemId: equipment.accessoryItemId,
    });

    if (res.success && res.loadout) {
      const updated = [...loadouts.filter((l) => l.slotNumber !== slotNumber), res.loadout].sort(
        (a, b) => a.slotNumber - b.slotNumber
      );
      setLoadouts(updated);
      setEditingLoadoutSlot(null);
      showFeedback(`Saved current gear to Slot ${slotNumber} (${currentName})!`);
    } else {
      showFeedback(res.error || "Failed to save loadout.", "error");
    }
  };

  // Loadout equip handler
  const handleEquipLoadoutPreset = async (slotNumber: number) => {
    const res = await equipLoadout(userId, slotNumber);
    if (res.success && res.equipment) {
      onEquipmentChange(res.equipment);
      showFeedback(`Activated loadout preset ${slotNumber}!`);
      void loadData();
    } else {
      showFeedback(res.error || "Failed to activate loadout.", "error");
    }
  };

  const filteredInventory = inventory.filter((item) => {
    if (selectedCategory === "all") return true;
    return item.definition?.category === selectedCategory;
  });

  const getOwnedEligibleForSlot = (slot: EquipmentSlot) => {
    return inventory.filter((item) => item.definition?.slot === slot);
  };

  // Compute total active stat bonuses
  const activeGearBonuses = useMemo(() => {
    const bonuses: Partial<Record<StatName, number>> = {};
    const items = [equipment.weapon, equipment.armor, equipment.accessory].filter(Boolean) as ItemDefinition[];
    for (const item of items) {
      if (item.statModifiers) {
        for (const [stat, val] of Object.entries(item.statModifiers)) {
          bonuses[stat as StatName] = (bonuses[stat as StatName] || 0) + val;
        }
      }
    }
    return bonuses;
  }, [equipment]);

  const activeSlotCount = [equipment.weaponItemId, equipment.armorItemId, equipment.accessoryItemId].filter(Boolean).length;

  return (
    <main className="armory-root">
      {/* ── HERO CHAMBER BANNER ── */}
      <section className="armory-hero-banner">
        <div className="armory-hero-top">
          <div className="armory-hero-title-group">
            <div className="armory-hero-tag">
              <span className="armory-hero-tag-pulse" />
              <span>SYSTEM PROTOCOL // ARMORY MATRIX</span>
            </div>
            <h1 className="armory-hero-title">HUNTER ARMORY</h1>
            <p className="armory-hero-desc">
              Manage tactical loadouts, calibrated equipment, vault storage, and hunter titles.
            </p>
          </div>

          {/* Quick Hunter Identity Block */}
          <div className="armory-identity-block">
            <div className="armory-identity-avatar-box">
              <Avatar
                avatarId={player.profile?.avatarId}
                level={player.progress.level}
                rank={player.progress.rank}
                size={48}
                showRank={false}
                showLevel={false}
              />
              <span className="armory-identity-rank-tag">{player.progress.rank}</span>
            </div>

            <div className="armory-identity-meta">
              <div className="armory-identity-name-row">
                <span className="armory-identity-name">{displayedName}</span>
                <span className="armory-identity-badge">
                  {equippedTitle ? equippedTitle.name : currentPreset.category.toUpperCase()}
                </span>
              </div>
              <div className="armory-identity-telemetry">
                <span>LVL <strong>{player.progress.level}</strong></span>
                <span>/</span>
                <span>PWR <strong style={{ color: "var(--crimson-light, #ffb4ab)" }}>{powerScore.toLocaleString()} CP</strong></span>
                <span>/</span>
                <span style={{ color: "var(--gold-highlight, #ffb77d)" }}>{player.progress.coins} COINS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Reference Guide Bar */}
        <div className="armory-quick-guide">
          <span className="armory-quick-guide-item">
            <strong style={{ color: "var(--cyan-tactical, #38bdf8)" }}>INVENTORY:</strong> What you own
          </span>
          <span className="armory-quick-guide-sep">•</span>
          <span className="armory-quick-guide-item">
            <strong style={{ color: "#10b981" }}>EQUIPMENT:</strong> What you're currently using
          </span>
          <span className="armory-quick-guide-sep">•</span>
          <span className="armory-quick-guide-item">
            <strong style={{ color: "var(--gold-highlight, #ffb77d)" }}>LOADOUTS:</strong> Saved equipment builds
          </span>
          <span className="armory-quick-guide-sep">•</span>
          <span className="armory-quick-guide-item">
            <strong style={{ color: "var(--gold-amber, #f59e0b)" }}>TITLES:</strong> Unlocked identities
          </span>
          <span className="armory-quick-guide-sep">•</span>
          <span className="armory-quick-guide-item">
            <strong style={{ color: "var(--crimson-light, #ffb4ab)" }}>POWER SCORE:</strong> Real calculated rating
          </span>
        </div>
      </section>

      {/* ── FEEDBACK NOTIFICATION ── */}
      {statusMessage && (
        <div
          className={`armory-alert-box ${
            statusMessage.type === "error" ? "armory-alert-box--error" : "armory-alert-box--success"
          }`}
        >
          <Info size={16} />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ── TABS NAVIGATION ── */}
      <div className="armory-tab-bar">
        <button
          type="button"
          className={`armory-tab-btn ${activeTab === "equipment" ? "armory-tab-btn--active" : ""}`}
          onClick={() => setActiveTab("equipment")}
        >
          <div className="armory-tab-label">
            <Shield size={16} />
            <span>EQUIPMENT</span>
          </div>
          <span className="armory-tab-sub">Current Gear ({activeSlotCount}/3)</span>
        </button>

        <button
          type="button"
          className={`armory-tab-btn ${activeTab === "inventory" ? "armory-tab-btn--active" : ""}`}
          onClick={() => setActiveTab("inventory")}
        >
          <div className="armory-tab-label">
            <Package size={16} />
            <span>INVENTORY ({inventory.length})</span>
          </div>
          <span className="armory-tab-sub">Owned Items</span>
        </button>

        <button
          type="button"
          className={`armory-tab-btn ${activeTab === "loadouts" ? "armory-tab-btn--active" : ""}`}
          onClick={() => setActiveTab("loadouts")}
        >
          <div className="armory-tab-label">
            <Layers size={16} />
            <span>LOADOUTS (Max 5)</span>
          </div>
          <span className="armory-tab-sub">Saved Builds</span>
        </button>

        <button
          type="button"
          className={`armory-tab-btn ${activeTab === "titles" ? "armory-tab-btn--active" : ""}`}
          onClick={() => setActiveTab("titles")}
        >
          <div className="armory-tab-label">
            <Crown size={16} />
            <span>TITLES ({unlockedTitleIds.length}/{TITLES_CATALOG.length})</span>
          </div>
          <span className="armory-tab-sub">Unlocked Identities</span>
        </button>
      </div>

      {/* ── TAB 1: EQUIPMENT CHAMBER ── */}
      {activeTab === "equipment" && (
        <div className="armory-equipment-layout">
          {/* Active Gear Matrix Section */}
          <div className="armory-section-card">
            <div className="armory-section-header">
              <div className="armory-section-title-group">
                <Shield size={18} style={{ color: "var(--crimson-vivid, #dc2626)" }} />
                <h2 className="armory-section-title">ACTIVE GEAR MATRIX</h2>
              </div>
              <span className="armory-section-badge">
                {activeSlotCount} / 3 SLOTS CONVERGED
              </span>
            </div>

            <div className="armory-gear-slots-list">
              {/* Weapon Slot */}
              <EquipmentSlotItem
                slot="weapon"
                slotLabel="WEAPON"
                item={equipment.weapon}
                onUnequip={() => handleUnequip("weapon")}
                ownedEligible={getOwnedEligibleForSlot("weapon")}
                onEquipItem={handleEquipItem}
              />

              {/* Armor Slot */}
              <EquipmentSlotItem
                slot="armor"
                slotLabel="ARMOR"
                item={equipment.armor}
                onUnequip={() => handleUnequip("armor")}
                ownedEligible={getOwnedEligibleForSlot("armor")}
                onEquipItem={handleEquipItem}
              />

              {/* Accessory Slot */}
              <EquipmentSlotItem
                slot="accessory"
                slotLabel="ACCESSORY"
                item={equipment.accessory}
                onUnequip={() => handleUnequip("accessory")}
                ownedEligible={getOwnedEligibleForSlot("accessory")}
                onEquipItem={handleEquipItem}
              />
            </div>

            {/* Total Active Gear Attributes Banner */}
            <div className="armory-total-boost-banner">
              <span className="armory-total-boost-title">TOTAL ACTIVE GEAR ATTRIBUTES</span>
              <div className="armory-total-boost-values">
                {Object.keys(activeGearBonuses).length > 0
                  ? Object.entries(activeGearBonuses)
                      .map(([stat, val]) => `+${val} ${stat.toUpperCase().slice(0, 3)}`)
                      .join(" • ")
                  : "NO ACTIVE STAT BONUSES (EQUIP GEAR TO BOOST)"}
              </div>
            </div>
          </div>

          {/* Companion Column: Power Score + Effective Stats */}
          <div className="armory-stats-column">
            {/* Power Score Combat Readiness Card */}
            <div className="armory-power-score-card">
              <div className="armory-power-top-row">
                <span className="armory-section-badge">METRIC EVALUATION</span>
                <span className="armory-identity-badge" style={{ borderColor: rankDef.color, color: rankDef.color }}>
                  {rankDef.badgeLabel} CAP
                </span>
              </div>

              <div className="armory-power-center">
                <span style={{ fontSize: "0.72rem", color: "var(--crimson-light, #ffb4ab)", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}>
                  HUNTER COMBAT POWER
                </span>
                <div className="armory-power-num-group">
                  <span className="armory-power-number">{powerScore.toLocaleString()}</span>
                  <span className="armory-power-unit">CP</span>
                </div>

                <div className="armory-power-track">
                  <div
                    className="armory-power-fill"
                    style={{
                      width: `${Math.min(100, Math.max(15, Math.round((powerScore % 5000) / 50)))}%`,
                    }}
                  />
                </div>

                <div className="armory-power-progress-sub">
                  <span>RANK TIER: {rankDef.badgeLabel}</span>
                  <Link to="/ranks" style={{ color: "var(--gold-highlight, #ffb77d)", textDecoration: "none" }}>
                    ROADMAP ➔
                  </Link>
                </div>
              </div>

              {/* Accordion Calculation Breakdown */}
              <div className="armory-formula-accordion">
                <button
                  type="button"
                  className="armory-formula-toggle"
                  onClick={() => setShowPowerFormula(!showPowerFormula)}
                >
                  <span>[ HOW IS THIS CALCULATED? ]</span>
                  {showPowerFormula ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showPowerFormula && (
                  <div className="armory-formula-rows">
                    <div className="armory-formula-row">
                      <span>Level Base</span>
                      <strong>+100 per Level</strong>
                    </div>
                    <div className="armory-formula-row">
                      <span>Rank Tier Standing</span>
                      <strong>+500 per Tier (F=0 to LEGENDARY=4,500)</strong>
                    </div>
                    <div className="armory-formula-row">
                      <span>Effective Attributes</span>
                      <strong>+10 per Stat point</strong>
                    </div>
                    <div className="armory-formula-row">
                      <span>Completed Quests</span>
                      <strong>+15 per Quest</strong>
                    </div>
                    <div className="armory-formula-row">
                      <span>Best Streak</span>
                      <strong>+25 per Day</strong>
                    </div>
                    <div className="armory-formula-row">
                      <span>Boss Victories</span>
                      <strong>+150 per Boss</strong>
                    </div>
                    <div className="armory-formula-row">
                      <span>Achievements</span>
                      <strong>+50 per Unlocked</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Effective Attributes Card (Base + Equipment = Effective) */}
            <div className="armory-effective-stats-card">
              <div className="armory-section-header">
                <div className="armory-section-title-group">
                  <Sparkles size={18} style={{ color: "var(--gold-amber, #f59e0b)" }} />
                  <h3 className="armory-section-title">EFFECTIVE ATTRIBUTES</h3>
                </div>
              </div>

              <div className="armory-formula-banner">
                <span>[ BASE ]</span>
                <span style={{ color: "var(--crimson-vivid, #dc2626)", fontWeight: 700 }}>+</span>
                <span style={{ color: "var(--crimson-light, #ffb4ab)" }}>[ EQUIPMENT ]</span>
                <span style={{ fontWeight: 700 }}>=</span>
                <span style={{ color: "var(--gold-highlight, #ffb77d)", fontWeight: 700 }}>[ EFFECTIVE ]</span>
              </div>

              <div className="armory-stat-breakdown-list">
                {(
                  [
                    { stat: "strength", label: "STRENGTH", sub: "Physical / Movement" },
                    { stat: "intelligence", label: "INTELLIGENCE", sub: "Reading / Studies" },
                    { stat: "vitality", label: "VITALITY", sub: "Hydration / Sleep" },
                    { stat: "focus", label: "FOCUS", sub: "Deep Work Sprints" },
                    { stat: "discipline", label: "DISCIPLINE", sub: "Daily Directives" },
                    { stat: "consistency", label: "CONSISTENCY", sub: "Streak Retention" },
                  ] as { stat: StatName; label: string; sub: string }[]
                ).map(({ stat, label, sub }) => {
                  const base = player.stats[stat] || 0;
                  const eff = effectiveStats[stat] || 0;
                  const bonus = eff - base;
                  const maxDisplayStat = Math.max(30, eff + 5);
                  const basePct = Math.min(100, Math.round((base / maxDisplayStat) * 100));
                  const bonusPct = Math.min(100 - basePct, Math.round((bonus / maxDisplayStat) * 100));

                  return (
                    <div key={stat} className="armory-stat-breakdown-item">
                      <div className="armory-stat-breakdown-row">
                        <div className="armory-stat-breakdown-name-group">
                          <span className="armory-stat-breakdown-name">{label}</span>
                          <span className="armory-stat-breakdown-sub">({sub})</span>
                        </div>
                        <div className="armory-stat-breakdown-math">
                          <span>{base}</span>
                          {bonus > 0 && (
                            <span style={{ color: "var(--crimson-light, #ffb4ab)", fontWeight: 700 }}>
                              + {bonus}
                            </span>
                          )}
                          <span>=</span>
                          <strong style={{ color: bonus > 0 ? "var(--gold-highlight, #ffb77d)" : "#fff" }}>
                            {eff}
                          </strong>
                        </div>
                      </div>

                      <div className="armory-stat-dual-track">
                        <div className="armory-stat-base-fill" style={{ width: `${basePct}%` }} />
                        {bonus > 0 && (
                          <div className="armory-stat-bonus-fill" style={{ width: `${bonusPct}%` }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: INVENTORY VAULT ── */}
      {activeTab === "inventory" && (
        <div className="armory-inventory-container">
          {/* Filter Pills */}
          <div className="armory-inventory-filter-bar">
            {(["all", "equipment", "consumable", "special"] as (ItemCategory | "all")[]).map((cat) => (
              <button
                key={cat}
                type="button"
                className={`armory-filter-pill ${selectedCategory === cat ? "armory-filter-pill--active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {filteredInventory.length === 0 ? (
            <div className="armory-section-card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
              <Package size={40} color="var(--text-dim, #64748b)" style={{ margin: "0 auto 0.75rem" }} />
              <p style={{ color: "#fff", margin: "0 0 0.5rem", fontWeight: 700 }}>No items in this category.</p>
              <p style={{ color: "var(--text-dim, #64748b)", fontSize: "0.85rem", margin: "0 auto 1.25rem", maxWidth: 440 }}>
                Defeat raid bosses or visit the Soul Merchant Bazaar to accumulate weapons, armor, and tactical supplies.
              </p>
              <Link to="/shop" className="armory-filter-pill armory-filter-pill--active" style={{ textDecoration: "none", alignSelf: "center" }}>
                Visit Shop
              </Link>
            </div>
          ) : (
            <div className="armory-inventory-grid">
              {filteredInventory.map((item) => {
                const def = item.definition;
                if (!def) return null;
                const rarityColor = RARITY_COLORS[def.rarity];
                const isEquipped =
                  equipment.weaponItemId === def.id ||
                  equipment.armorItemId === def.id ||
                  equipment.accessoryItemId === def.id;

                return (
                  <div
                    key={item.id}
                    className="armory-item-card"
                    style={{
                      borderColor: isEquipped ? "#10b981" : rarityColor,
                    }}
                  >
                    <div>
                      <div className="armory-item-top">
                        <span
                          className="armory-item-rarity-badge"
                          style={{ borderColor: rarityColor, color: rarityColor }}
                        >
                          {def.rarity} • {def.category}
                        </span>
                        <span className="armory-item-qty">×{item.quantity}</span>
                      </div>

                      <h3 className="armory-item-name">{def.name}</h3>
                      <p className="armory-item-desc">{def.description}</p>

                      {def.statModifiers && (
                        <div className="armory-item-bonuses">
                          {Object.entries(def.statModifiers).map(([stat, bonus]) => (
                            <span key={stat} className="armory-item-bonus-pill">
                              +{bonus} {stat.toUpperCase().slice(0, 3)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      {def.slot ? (
                        isEquipped ? (
                          <div className="armory-item-equipped-status">
                            <Check size={16} /> Equipped in {def.slot.toUpperCase()}
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="armory-item-action-btn armory-item-action-btn--equip"
                            onClick={() => handleEquipItem(def.id)}
                          >
                            Equip as {def.slot.toUpperCase()}
                          </button>
                        )
                      ) : def.category === "consumable" ? (
                        <button
                          type="button"
                          className="armory-item-action-btn armory-item-action-btn--use"
                          onClick={() => showFeedback(`Used ${def.name}! Vitality restored.`)}
                        >
                          Use Consumable
                        </button>
                      ) : (
                        <div style={{ fontSize: "0.75rem", color: "var(--text-dim, #64748b)", textAlign: "center", padding: "0.35rem" }}>
                          Special Quest Trophy
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: LOADOUTS (SAVED BUILDS 1 TO 5) ── */}
      {activeTab === "loadouts" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="armory-section-card">
            <div className="armory-section-header">
              <div className="armory-section-title-group">
                <Layers size={18} style={{ color: "var(--gold-highlight, #ffb77d)" }} />
                <h2 className="armory-section-title">TACTICAL LOADOUT PRESETS (1 TO 5)</h2>
              </div>
              <span className="armory-section-badge">MAX {MAX_LOADOUTS} PRESETS</span>
            </div>
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--text-secondary, #c9b6b6)", lineHeight: 1.45 }}>
              Equipping a loadout preset replaces your currently equipped gear with your saved configuration. Item ownership is validated atomically.
            </p>
          </div>

          <div className="armory-loadouts-grid">
            {Array.from({ length: MAX_LOADOUTS }, (_, i) => i + 1).map((slotNum) => {
              const loadout = loadouts.find((l) => l.slotNumber === slotNum);
              const isActive =
                loadout &&
                loadout.weaponItemId === equipment.weaponItemId &&
                loadout.armorItemId === equipment.armorItemId &&
                loadout.accessoryItemId === equipment.accessoryItemId;

              const isEditing = editingLoadoutSlot === slotNum;

              return (
                <div
                  key={slotNum}
                  className={`armory-loadout-card ${isActive ? "armory-loadout-card--active" : ""}`}
                >
                  <div>
                    <div className="armory-loadout-top">
                      <span className="armory-loadout-slot-num">SLOT #{slotNum.toString().padStart(2, "0")}</span>
                      {isActive && <span className="armory-loadout-active-badge">ACTIVE</span>}
                    </div>

                    <div className="armory-loadout-name-row">
                      {isEditing ? (
                        <div style={{ display: "flex", gap: "0.375rem", width: "100%" }}>
                          <input
                            type="text"
                            value={loadoutNameInput}
                            onChange={(e) => setLoadoutNameInput(e.target.value)}
                            placeholder="Preset name..."
                            style={{
                              background: "#070709",
                              border: "1px solid var(--crimson-vivid, #dc2626)",
                              borderRadius: "4px",
                              color: "#fff",
                              padding: "0.25rem 0.5rem",
                              fontSize: "0.85rem",
                              flex: 1,
                            }}
                          />
                          <button
                            type="button"
                            className="armory-filter-pill armory-filter-pill--active"
                            style={{ padding: "0.25rem 0.5rem" }}
                            onClick={() => handleSaveCurrentLoadout(slotNum, loadoutNameInput.trim())}
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            className="armory-filter-pill"
                            style={{ padding: "0.25rem 0.5rem" }}
                            onClick={() => setEditingLoadoutSlot(null)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className="armory-loadout-name">{loadout?.name || `Loadout Preset ${slotNum}`}</h3>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingLoadoutSlot(slotNum);
                              setLoadoutNameInput(loadout?.name || `Preset ${slotNum}`);
                            }}
                            title="Rename Preset"
                            style={{ background: "transparent", border: "none", color: "var(--text-dim, #64748b)", cursor: "pointer" }}
                          >
                            <Pencil size={13} />
                          </button>
                        </>
                      )}
                    </div>

                    <div className="armory-loadout-items-summary">
                      <div>
                        <strong>Weapon: </strong>
                        {loadout?.weapon ? loadout.weapon.name : loadout?.weaponItemId ? loadout.weaponItemId : "Empty"}
                      </div>
                      <div>
                        <strong>Armor: </strong>
                        {loadout?.armor ? loadout.armor.name : loadout?.armorItemId ? loadout.armorItemId : "Empty"}
                      </div>
                      <div>
                        <strong>Accessory: </strong>
                        {loadout?.accessory ? loadout.accessory.name : loadout?.accessoryItemId ? loadout.accessoryItemId : "Empty"}
                      </div>
                    </div>
                  </div>

                  <div className="armory-loadout-actions">
                    {loadout ? (
                      <button
                        type="button"
                        className="armory-loadout-equip-btn"
                        disabled={isActive}
                        onClick={() => handleEquipLoadoutPreset(slotNum)}
                      >
                        {isActive ? "Currently Active" : "Equip Loadout"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="armory-loadout-equip-btn"
                        style={{ background: "var(--surface-container, #18161b)" }}
                        onClick={() => {
                          setLoadoutNameInput(`Preset ${slotNum}`);
                          void handleSaveCurrentLoadout(slotNum, `Preset ${slotNum}`);
                        }}
                      >
                        <Save size={13} style={{ marginRight: 4 }} /> Save Current Gear
                      </button>
                    )}

                    <button
                      type="button"
                      className="armory-loadout-overwrite-btn"
                      title="Overwrite with currently equipped items"
                      onClick={() => {
                        setEditingLoadoutSlot(slotNum);
                        setLoadoutNameInput(loadout?.name || `Preset ${slotNum}`);
                      }}
                    >
                      <ArrowRightLeft size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 4: HUNTER TITLES ── */}
      {activeTab === "titles" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="armory-section-card">
            <div className="armory-section-header">
              <div className="armory-section-title-group">
                <Crown size={18} style={{ color: "var(--gold-amber, #f59e0b)" }} />
                <h2 className="armory-section-title">HUNTER PRESTIGE TITLES</h2>
              </div>
              <span className="armory-section-badge">
                UNLOCKED: {unlockedTitleIds.length} / {TITLES_CATALOG.length}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--text-secondary, #c9b6b6)", lineHeight: 1.45 }}>
              Prestige titles are unlocked through milestone accomplishments. Only one title may be equipped at a time, broadcasting your identity across your Hunter dossier.
            </p>
          </div>

          <div className="armory-titles-grid">
            {TITLES_CATALOG.map((title) => {
              const isUnlocked = unlockedTitleIds.includes(title.id);
              const isEquipped = equippedTitle?.id === title.id;

              return (
                <div
                  key={title.id}
                  className={`armory-title-card ${isEquipped ? "armory-title-card--equipped" : ""} ${
                    !isUnlocked ? "armory-title-card--locked" : ""
                  }`}
                  style={{
                    borderColor: isEquipped ? title.badgeColor : undefined,
                  }}
                >
                  <div>
                    <div className="armory-title-top">
                      <span
                        className="armory-item-rarity-badge"
                        style={{
                          borderColor: title.badgeColor,
                          color: title.badgeColor,
                        }}
                      >
                        {title.rarity}
                      </span>
                      {isEquipped ? (
                        <span style={{ fontSize: "0.72rem", color: title.badgeColor, fontWeight: 700 }}>
                          [EQUIPPED]
                        </span>
                      ) : isUnlocked ? (
                        <span style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 700 }}>
                          Unlocked
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.72rem", color: "var(--text-dim, #64748b)", display: "flex", alignItems: "center", gap: 3 }}>
                          <Lock size={12} /> Locked
                        </span>
                      )}
                    </div>

                    <h3 className="armory-title-name" style={{ color: title.badgeColor }}>
                      {title.name}
                    </h3>
                    <p className="armory-title-desc">{title.description}</p>

                    <div
                      className="armory-title-condition"
                      style={{ borderLeftColor: title.badgeColor }}
                    >
                      <strong style={{ color: "var(--gold-light, #ffdcc3)" }}>Condition: </strong>
                      {title.unlockCondition}
                    </div>
                  </div>

                  <div>
                    {isUnlocked ? (
                      <button
                        type="button"
                        className="armory-title-equip-btn"
                        style={{
                          borderColor: isEquipped ? title.badgeColor : undefined,
                        }}
                        disabled={isEquipped}
                        onClick={() => handleEquipTitle(title.id)}
                      >
                        {isEquipped ? "Currently Equipped" : "Equip Title"}
                      </button>
                    ) : (
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--text-dim, #64748b)",
                          textAlign: "center",
                          padding: "0.5rem",
                          fontStyle: "italic",
                        }}
                      >
                        Complete condition to awaken title
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}

// ── EQUIPMENT SLOT SUBCOMPONENT ──
function EquipmentSlotItem({
  slot,
  slotLabel,
  item,
  onUnequip,
  ownedEligible,
  onEquipItem,
}: {
  slot: EquipmentSlot;
  slotLabel: string;
  item?: ItemDefinition;
  onUnequip: () => void;
  ownedEligible: PlayerInventoryItem[];
  onEquipItem: (id: string) => void;
}) {
  const [isChanging, setIsChanging] = useState(false);
  const rarityColor = item ? RARITY_COLORS[item.rarity] : "#8a6b70";

  const Icon = slot === "weapon" ? Swords : slot === "armor" ? Shield : Cpu;

  return (
    <div
      className="armory-gear-slot-item"
      style={{
        borderColor: item ? rarityColor : "rgba(67, 50, 53, 0.4)",
      }}
    >
      {item ? (
        <>
          <div className="armory-gear-slot-main">
            <div className="armory-gear-slot-left">
              <div
                className="armory-gear-slot-icon-box"
                style={{
                  borderColor: rarityColor,
                  color: rarityColor,
                  boxShadow: `inset 0 0 10px rgba(0, 0, 0, 0.5), 0 0 10px ${rarityColor}33`,
                }}
              >
                <Icon size={22} />
              </div>

              <div className="armory-gear-slot-info">
                <div className="armory-gear-slot-header">
                  <span className="armory-gear-slot-category" style={{ color: rarityColor }}>
                    {slotLabel}
                  </span>
                  <span
                    className="armory-gear-slot-rarity-pill"
                    style={{
                      background: `${rarityColor}22`,
                      color: rarityColor,
                    }}
                  >
                    {item.rarity}
                  </span>
                </div>
                <h3 className="armory-gear-slot-name">{item.name}</h3>
                {item.statModifiers && (
                  <div className="armory-gear-slot-bonuses" style={{ color: "var(--crimson-light, #ffb4ab)" }}>
                    {Object.entries(item.statModifiers)
                      .map(([s, val]) => `+${val} ${s.toUpperCase()}`)
                      .join(" • ")}
                  </div>
                )}
              </div>
            </div>

            <div className="armory-gear-slot-right">
              <span className="armory-gear-slot-qty">
                OWNED ×{ownedEligible.find((i) => i.definition?.id === item.id)?.quantity || 1}
              </span>
              <span className="armory-gear-slot-equipped-tag">
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--crimson-vivid, #dc2626)",
                    boxShadow: "0 0 6px var(--crimson-vivid, #dc2626)",
                  }}
                />
                EQUIPPED
              </span>
            </div>
          </div>

          <p className="armory-gear-slot-desc">{item.description}</p>

          <div className="armory-gear-slot-actions">
            <button
              type="button"
              className="armory-gear-action-btn armory-gear-action-btn--change"
              onClick={() => setIsChanging(!isChanging)}
            >
              {isChanging ? "Close Selector" : `Change ${slotLabel} (${ownedEligible.length} owned)`}
            </button>
            <button
              type="button"
              className="armory-gear-action-btn armory-gear-action-btn--unequip"
              onClick={onUnequip}
            >
              Unequip
            </button>
          </div>
        </>
      ) : (
        <div className="armory-gear-slot-empty">
          <div
            className="armory-gear-slot-icon-box"
            style={{ opacity: 0.5, margin: "0 auto" }}
          >
            <Icon size={22} />
          </div>
          <span className="armory-gear-slot-empty-title">
            Empty Slot — No {slotLabel} Equipped
          </span>
          <button
            type="button"
            className="armory-gear-action-btn armory-gear-action-btn--change"
            onClick={() => setIsChanging(!isChanging)}
          >
            {isChanging ? "Close Selector" : `+ Equip ${slotLabel} (${ownedEligible.length} available)`}
          </button>
        </div>
      )}

      {/* Eligible Items Dropdown / Selector */}
      {isChanging && (
        <div
          style={{
            marginTop: "0.5rem",
            paddingTop: "0.75rem",
            borderTop: "1px solid rgba(67, 50, 53, 0.4)",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          {ownedEligible.length === 0 ? (
            <p style={{ fontSize: "0.75rem", color: "var(--text-dim, #64748b)", margin: "0.25rem 0" }}>
              No eligible {slot} items in inventory. Defeat bosses or visit the shop to obtain gear.
            </p>
          ) : (
            ownedEligible.map((inv) => {
              const def = inv.definition;
              if (!def) return null;
              const isCurrent = item?.id === def.id;
              const rColor = RARITY_COLORS[def.rarity];

              return (
                <div
                  key={inv.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.5rem 0.75rem",
                    background: "rgba(7, 7, 9, 0.6)",
                    borderRadius: "6px",
                    border: `1px solid ${isCurrent ? "#10b981" : rColor}`,
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.8125rem", color: "#fff", fontWeight: 700 }}>
                      {def.name}
                    </div>
                    <div style={{ fontSize: "0.6875rem", color: "var(--text-dim, #64748b)", fontFamily: "var(--font-mono, monospace)" }}>
                      {Object.entries(def.statModifiers || {})
                        .map(([s, b]) => `+${b} ${s.slice(0, 3).toUpperCase()}`)
                        .join(", ")}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="armory-filter-pill armory-filter-pill--active"
                    style={{
                      fontSize: "0.6875rem",
                      padding: "0.3rem 0.6rem",
                      opacity: isCurrent ? 0.6 : 1,
                      cursor: isCurrent ? "default" : "pointer",
                    }}
                    disabled={isCurrent}
                    onClick={() => {
                      onEquipItem(def.id);
                      setIsChanging(false);
                    }}
                  >
                    {isCurrent ? "Equipped" : "Equip"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
