import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Sparkles,
  Package,
  Award,
  Crown,
  Check,
  Lock,
  Zap,
  Save,
  Info,
  Layers,
  ArrowRightLeft,
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
    if (userId) {
      void loadData();
    }
  }, [userId, loadData]);

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

  return (
    <main className="armory-hub-page">
      <div className="system-header">
        <h1>Armory & Deep RPG Systems</h1>
        <div>
          <h1>ARMORY</h1>
          <p style={{ margin: "4px 0 0", color: "#8a6b70", fontSize: "0.88rem" }}>
            Manage what you own, what you equip, and how your Hunter is built.
          </p>
        </div>
        <div className="inline-meta">
          <span
            className="value-badge"
            style={{
              borderColor: "#ffd700",
              color: "#ffd700",
              fontWeight: "bold",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Zap size={14} />
            POWER SCORE: {powerScore.toLocaleString()}
          </span>
          {equippedTitle && (
            <span
              className="value-badge"
              style={{
                borderColor: equippedTitle.badgeColor,
                color: equippedTitle.badgeColor,
              }}
            >
              <Award size={13} style={{ marginRight: 4 }} />
              {equippedTitle.name}
            </span>
          )}
          <Link
            to="/stats"
            className="value-badge"
            style={{ textDecoration: "none", color: "#f2e9e9" }}
          >
            Profile ➔
          </Link>
        </div>
      </div>

      {/* Quick Reference Guide Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "8px 12px",
          marginBottom: "16px",
          padding: "8px 14px",
          background: "rgba(0,0,0,0.35)",
          borderRadius: "6px",
          border: "1px solid rgba(138, 107, 112, 0.2)",
        }}
      >
        <div style={{ fontSize: "0.75rem", color: "#8a6b70" }}>
          <strong style={{ color: "#38bdf8" }}>INVENTORY:</strong> What you own
        </div>
        <span style={{ color: "rgba(138, 107, 112, 0.4)" }}>•</span>
        <div style={{ fontSize: "0.75rem", color: "#8a6b70" }}>
          <strong style={{ color: "#22c55e" }}>EQUIPMENT:</strong> What you're currently using
        </div>
        <span style={{ color: "rgba(138, 107, 112, 0.4)" }}>•</span>
        <div style={{ fontSize: "0.75rem", color: "#8a6b70" }}>
          <strong style={{ color: "#a855f7" }}>LOADOUTS:</strong> Saved equipment builds
        </div>
        <span style={{ color: "rgba(138, 107, 112, 0.4)" }}>•</span>
        <div style={{ fontSize: "0.75rem", color: "#8a6b70" }}>
          <strong style={{ color: "#ffd700" }}>TITLES:</strong> Achievements and identities you've unlocked
        </div>
        <span style={{ color: "rgba(138, 107, 112, 0.4)" }}>•</span>
        <div style={{ fontSize: "0.75rem", color: "#8a6b70" }}>
          <strong style={{ color: "#ffaa00" }}>POWER SCORE:</strong> Calculated strength from your progression and gear
        </div>
      </div>

      {statusMessage && (
        <div
          className={`panel-box alert-box ${statusMessage.type === "error" ? "alert-error" : "alert-success"}`}
          style={{
            marginBottom: 16,
            borderColor: statusMessage.type === "error" ? "#ef4444" : "#22c55e",
            color: statusMessage.type === "error" ? "#fca5a5" : "#86efac",
            background: "rgba(20, 9, 11, 0.95)",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Info size={16} />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Tabs Navigation with Dual Labels */}
      <div className="quest-filter-bar" style={{ marginBottom: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
        <button
          className={`filter-tab ${activeTab === "equipment" ? "active" : ""}`}
          onClick={() => setActiveTab("equipment")}
          style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "8px 12px", width: "100%" }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: "bold", fontSize: "0.85rem" }}>
            <Shield size={14} /> EQUIPMENT
          </span>
          <span style={{ fontSize: "0.7rem", color: activeTab === "equipment" ? "#ffd700" : "#8a6b70", fontWeight: "normal" }}>
            Current gear
          </span>
        </button>
        <button
          className={`filter-tab ${activeTab === "inventory" ? "active" : ""}`}
          onClick={() => setActiveTab("inventory")}
          style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "8px 12px", width: "100%" }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: "bold", fontSize: "0.85rem" }}>
            <Package size={14} /> INVENTORY ({inventory.length})
          </span>
          <span style={{ fontSize: "0.7rem", color: activeTab === "inventory" ? "#ffd700" : "#8a6b70", fontWeight: "normal" }}>
            Owned items
          </span>
        </button>
        <button
          className={`filter-tab ${activeTab === "loadouts" ? "active" : ""}`}
          onClick={() => setActiveTab("loadouts")}
          style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "8px 12px", width: "100%" }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: "bold", fontSize: "0.85rem" }}>
            <Layers size={14} /> LOADOUTS (Max 5)
          </span>
          <span style={{ fontSize: "0.7rem", color: activeTab === "loadouts" ? "#ffd700" : "#8a6b70", fontWeight: "normal" }}>
            Saved builds
          </span>
        </button>
        <button
          className={`filter-tab ${activeTab === "titles" ? "active" : ""}`}
          onClick={() => setActiveTab("titles")}
          style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "8px 12px", width: "100%" }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: "bold", fontSize: "0.85rem" }}>
            <Crown size={14} /> TITLES ({unlockedTitleIds.length}/{TITLES_CATALOG.length})
          </span>
          <span style={{ fontSize: "0.7rem", color: activeTab === "titles" ? "#ffd700" : "#8a6b70", fontWeight: "normal" }}>
            Unlocked identities
          </span>
        </button>
      </div>

      {/* ── TAB 1: EQUIPMENT (PAPER DOLL) ── */}
      {activeTab === "equipment" && (
        <div className="armory-equipment-tab">
          <div className="profile-hero-card" style={{ marginBottom: 20 }}>
            <div className="profile-hero-details" style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#f2e9e9", display: "flex", alignItems: "center", gap: 8 }}>
                    <Sparkles size={18} color="#ffd700" /> Active Hunter Loadout
                  </h2>
                  <p style={{ margin: "4px 0 0", color: "#8a6b70", fontSize: "0.85rem" }}>
                    Base stats + equipment bonuses = Effective combat stats. Base stats remain permanently uncorrupted.
                  </p>
                </div>
                <div
                  style={{
                    background: "rgba(255, 215, 0, 0.1)",
                    border: "1px solid #ffd700",
                    padding: "10px 16px",
                    borderRadius: 6,
                    textAlign: "right",
                    minWidth: "220px",
                  }}
                >
                  <div style={{ fontSize: "0.7rem", color: "#c9a876", textTransform: "uppercase", letterSpacing: "0.05em" }}>Calculated Power Score</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#ffd700" }}>{powerScore.toLocaleString()}</div>
                  <div style={{ fontSize: "0.7rem", color: "#8a6b70", margin: "2px 0 4px" }}>
                    Calculated from your current progression, stats, rank and equipment.
                  </div>
                  <button
                    onClick={() => setShowPowerFormula(!showPowerFormula)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#ffd700",
                      fontSize: "0.72rem",
                      cursor: "pointer",
                      padding: 0,
                      textDecoration: "underline",
                    }}
                  >
                    {showPowerFormula ? "Hide calculation details ▲" : "How is this calculated? ▼"}
                  </button>
                  {showPowerFormula && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: "8px 10px",
                        background: "rgba(0,0,0,0.6)",
                        borderRadius: 4,
                        border: "1px solid rgba(255, 215, 0, 0.25)",
                        fontSize: "0.7rem",
                        color: "#f2e9e9",
                        textAlign: "left",
                        lineHeight: 1.4,
                      }}
                    >
                      <div style={{ color: "#ffd700", fontWeight: "bold", marginBottom: 2 }}>Formula Breakdown:</div>
                      <div>• Level: +100 per Level</div>
                      <div>• Rank Tier: +500 per Tier (F=0 to LEGENDARY=4,500)</div>
                      <div>• Effective Stats: +10 per Stat point</div>
                      <div>• Completed Quests: +15 per Quest</div>
                      <div>• Best Streak: +25 per Day</div>
                      <div>• Boss Victories: +150 per Boss</div>
                      <div>• Achievements: +50 per Unlocked</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Effective Stats Row with Base + Bonus Breakdown */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: "0.75rem", color: "#8a6b70", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, fontWeight: "bold" }}>
                  EFFECTIVE STATS BREAKDOWN (BASE + EQUIPMENT)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
                  {(["strength", "intelligence", "vitality", "focus", "discipline", "consistency"] as StatName[]).map((stat) => {
                    const base = player.stats[stat] || 0;
                    const eff = effectiveStats[stat] || 0;
                    const bonus = eff - base;
                    return (
                      <div
                        key={stat}
                        className="stat-pill"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                          padding: "8px 10px",
                          background: "rgba(0,0,0,0.4)",
                          border: "1px solid rgba(138, 107, 112, 0.25)",
                        }}
                      >
                        <span className="card-title" style={{ fontSize: "0.7rem" }}>{stat.toUpperCase()}</span>
                        <div style={{ fontSize: "0.75rem", color: "#8a6b70" }}>
                          Base: <strong style={{ color: "#f2e9e9" }}>{base}</strong>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: bonus > 0 ? "#22c55e" : "#8a6b70" }}>
                          Bonus: <strong>{bonus > 0 ? `+${bonus}` : "0"}</strong>
                        </div>
                        <div style={{ fontSize: "0.88rem", fontWeight: "bold", color: "#ffd700", borderTop: "1px solid rgba(138, 107, 112, 0.25)", paddingTop: 3, marginTop: 1 }}>
                          Effective: {eff}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ margin: "8px 0 0", color: "#8a6b70", fontSize: "0.75rem", fontStyle: "italic" }}>
                  Equipment bonuses apply exclusively while gear is equipped. Your core attributes remain permanent and never corrupt.
                </div>
              </div>
            </div>
          </div>

          {/* 3 Equipment Slots */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {/* Slot: Weapon */}
            <EquipmentSlotCard
              slot="weapon"
              title="Weapon Slot"
              item={equipment.weapon}
              onUnequip={() => handleUnequip("weapon")}
              ownedEligible={getOwnedEligibleForSlot("weapon")}
              onEquipItem={handleEquipItem}
            />

            {/* Slot: Armor */}
            <EquipmentSlotCard
              slot="armor"
              title="Armor Slot"
              item={equipment.armor}
              onUnequip={() => handleUnequip("armor")}
              ownedEligible={getOwnedEligibleForSlot("armor")}
              onEquipItem={handleEquipItem}
            />

            {/* Slot: Accessory */}
            <EquipmentSlotCard
              slot="accessory"
              title="Accessory Slot"
              item={equipment.accessory}
              onUnequip={() => handleUnequip("accessory")}
              ownedEligible={getOwnedEligibleForSlot("accessory")}
              onEquipItem={handleEquipItem}
            />
          </div>
        </div>
      )}

      {/* ── TAB 2: INVENTORY ── */}
      {activeTab === "inventory" && (
        <div className="armory-inventory-tab">
          {/* Filter Pills */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {(["all", "equipment", "consumable", "special"] as (ItemCategory | "all")[]).map((cat) => (
              <button
                key={cat}
                className={`filter-tab ${selectedCategory === cat ? "active" : ""}`}
                style={{ padding: "6px 14px", fontSize: "0.8rem" }}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {filteredInventory.length === 0 ? (
            <div className="panel-box" style={{ textAlign: "center", padding: "40px 20px" }}>
              <Package size={36} color="#8a6b70" style={{ margin: "0 auto 12px" }} />
              <p style={{ color: "#f2e9e9", margin: "0 0 6px" }}>No items found in this category.</p>
              <p style={{ color: "#8a6b70", fontSize: "0.85rem", margin: 0 }}>
                Defeat raid bosses or purchase supplies at the Soul Merchant Bazaar to accumulate gear!
              </p>
              <Link to="/shop" className="action-btn" style={{ marginTop: 16, display: "inline-block", textDecoration: "none" }}>
                Visit Shop
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
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
                    className="panel-box"
                    style={{
                      borderColor: isEquipped ? "#22c55e" : rarityColor,
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                            padding: "2px 6px",
                            borderRadius: 4,
                            border: `1px solid ${rarityColor}`,
                            color: rarityColor,
                          }}
                        >
                          {def.rarity} • {def.category}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "#c9a876", fontWeight: "bold" }}>
                          x{item.quantity}
                        </span>
                      </div>

                      <h3 style={{ margin: "6px 0", fontSize: "0.95rem", color: "#f2e9e9" }}>{def.name}</h3>
                      <p style={{ margin: "0 0 10px", fontSize: "0.8rem", color: "#8a6b70", lineHeight: 1.3 }}>
                        {def.description}
                      </p>

                      {def.statModifiers && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                          {Object.entries(def.statModifiers).map(([stat, bonus]) => (
                            <span
                              key={stat}
                              style={{
                                fontSize: "0.7rem",
                                background: "rgba(34, 197, 94, 0.15)",
                                border: "1px solid #22c55e",
                                color: "#86efac",
                                padding: "2px 6px",
                                borderRadius: 4,
                              }}
                            >
                              +{bonus} {stat.toUpperCase().slice(0, 3)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: 10 }}>
                      {def.slot ? (
                        isEquipped ? (
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "#22c55e",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              justifyContent: "center",
                              padding: "6px",
                            }}
                          >
                            <Check size={14} /> Equipped in {def.slot.toUpperCase()}
                          </div>
                        ) : (
                          <button
                            className="action-btn"
                            style={{ width: "100%", fontSize: "0.8rem", padding: "6px 12px" }}
                            onClick={() => handleEquipItem(def.id)}
                          >
                            Equip as {def.slot.toUpperCase()}
                          </button>
                        )
                      ) : def.category === "consumable" ? (
                        <button
                          className="action-btn"
                          style={{ width: "100%", fontSize: "0.8rem", padding: "6px 12px" }}
                          onClick={() => showFeedback(`Used ${def.name}! Vitality restored.`)}
                        >
                          Use Consumable
                        </button>
                      ) : (
                        <div style={{ fontSize: "0.75rem", color: "#8a6b70", textAlign: "center" }}>
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

      {/* ── TAB 3: LOADOUTS (MAX 5) ── */}
      {activeTab === "loadouts" && (
        <div className="armory-loadouts-tab">
          <div className="panel-box" style={{ marginBottom: 20 }}>
            <div className="panel-topbar">
              <div className="card-title">Tactical Loadout Presets (1 to 5)</div>
            </div>
            <p style={{ margin: "6px 0 0", color: "#f2e9e9", fontSize: "0.88rem", fontWeight: "500" }}>
              Equipping a loadout replaces your current equipment with this saved setup.
            </p>
            <p style={{ margin: "4px 0 0", color: "#8a6b70", fontSize: "0.8rem" }}>
              Configure up to 5 custom equipment presets for different training regimes (e.g. Strength grinding vs Focus study sessions).
              Loadout activation validates complete item ownership before applying changes atomically.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
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
                  className="panel-box"
                  style={{
                    borderColor: isActive ? "#ffd700" : "#631826",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          color: isActive ? "#ffd700" : "#8a6b70",
                          textTransform: "uppercase",
                        }}
                      >
                        Slot {slotNum} {isActive ? "• [ACTIVE LOADOUT]" : ""}
                      </span>
                    </div>

                    {isEditing ? (
                      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                        <input
                          type="text"
                          value={loadoutNameInput}
                          onChange={(e) => setLoadoutNameInput(e.target.value)}
                          placeholder="Preset name..."
                          style={{
                            background: "#14090b",
                            border: "1px solid #631826",
                            color: "#f2e9e9",
                            padding: "4px 8px",
                            borderRadius: 4,
                            fontSize: "0.85rem",
                            flex: 1,
                          }}
                        />
                        <button
                          className="action-btn"
                          style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                          onClick={() => handleSaveCurrentLoadout(slotNum, loadoutNameInput.trim())}
                        >
                          Save
                        </button>
                        <button
                          className="action-btn"
                          style={{ padding: "4px 8px", fontSize: "0.8rem", background: "transparent" }}
                          onClick={() => setEditingLoadoutSlot(null)}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <h3 style={{ margin: "0 0 12px", fontSize: "1rem", color: "#f2e9e9" }}>
                        {loadout?.name || `Loadout Preset ${slotNum}`}
                      </h3>
                    )}

                    <div style={{ fontSize: "0.8rem", color: "#8a6b70", display: "flex", flexDirection: "column", gap: 4 }}>
                      <div>
                        <strong style={{ color: "#c9a876" }}>Weapon: </strong>
                        {loadout?.weapon ? loadout.weapon.name : loadout?.weaponItemId ? loadout.weaponItemId : "Empty"}
                      </div>
                      <div>
                        <strong style={{ color: "#c9a876" }}>Armor: </strong>
                        {loadout?.armor ? loadout.armor.name : loadout?.armorItemId ? loadout.armorItemId : "Empty"}
                      </div>
                      <div>
                        <strong style={{ color: "#c9a876" }}>Accessory: </strong>
                        {loadout?.accessory ? loadout.accessory.name : loadout?.accessoryItemId ? loadout.accessoryItemId : "Empty"}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                    {loadout ? (
                      <button
                        className="action-btn"
                        style={{
                          flex: 1,
                          fontSize: "0.8rem",
                          padding: "6px",
                          borderColor: isActive ? "#ffd700" : undefined,
                        }}
                        disabled={isActive}
                        onClick={() => handleEquipLoadoutPreset(slotNum)}
                      >
                        {isActive ? "Currently Active" : "Equip Loadout"}
                      </button>
                    ) : (
                      <button
                        className="action-btn"
                        style={{ flex: 1, fontSize: "0.8rem", padding: "6px" }}
                        onClick={() => {
                          setLoadoutNameInput(`Preset ${slotNum}`);
                          void handleSaveCurrentLoadout(slotNum, `Preset ${slotNum}`);
                        }}
                      >
                        <Save size={13} style={{ marginRight: 4 }} /> Save Gear Here
                      </button>
                    )}

                    <button
                      className="action-btn"
                      style={{
                        padding: "6px 10px",
                        fontSize: "0.8rem",
                        background: "rgba(230, 57, 70, 0.1)",
                      }}
                      title="Overwrite with current equipment"
                      onClick={() => {
                        setEditingLoadoutSlot(slotNum);
                        setLoadoutNameInput(loadout?.name || `Preset ${slotNum}`);
                      }}
                    >
                      <ArrowRightLeft size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 4: TITLES ── */}
      {activeTab === "titles" && (
        <div className="armory-titles-tab">
          <div className="panel-box" style={{ marginBottom: 20 }}>
            <div className="panel-topbar">
              <div className="card-title">Hunter Prestige Titles</div>
              <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Crown size={16} color="#ffd700" />
                <span>UNLOCKED TITLES: {unlockedTitleIds.length} / {TITLES_CATALOG.length}</span>
              </div>
              {equippedTitle && (
                <span style={{ fontSize: "0.8rem", color: equippedTitle.badgeColor, fontWeight: "bold" }}>
                  Equipped: [{equippedTitle.name}]
                </span>
              )}
            </div>
            <p style={{ margin: "6px 0 0", color: "#f2e9e9", fontSize: "0.88rem", fontWeight: "500" }}>
              Titles are earned through progression milestones and can be displayed as your Hunter identity.
            </p>
            <p style={{ margin: "4px 0 0", color: "#8a6b70", fontSize: "0.8rem" }}>
              Equipping a title broadcasts your sovereign status across your Hunter profile, Armory, and System AI interface.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
            {TITLES_CATALOG.map((title) => {
              const isUnlocked = unlockedTitleIds.includes(title.id);
              const isEquipped = equippedTitle?.id === title.id;

              return (
                <div
                  key={title.id}
                  className="panel-box"
                  style={{
                    borderColor: isEquipped ? title.badgeColor : isUnlocked ? "#3f1a20" : "rgba(99, 24, 38, 0.3)",
                    boxShadow: isEquipped ? `0 0 12px ${title.glowColor}` : undefined,
                    opacity: isUnlocked ? 1 : 0.65,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          textTransform: "uppercase",
                          padding: "2px 6px",
                          borderRadius: 4,
                          border: `1px solid ${title.badgeColor}`,
                          color: title.badgeColor,
                        }}
                      >
                        {title.rarity}
                      </span>
                      {isEquipped ? (
                        <span style={{ fontSize: "0.75rem", color: title.badgeColor, fontWeight: "bold" }}>
                          [EQUIPPED]
                        </span>
                      ) : isUnlocked ? (
                        <span style={{ fontSize: "0.75rem", color: "#22c55e" }}>Unlocked</span>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "#8a6b70", display: "flex", alignItems: "center", gap: 4 }}>
                          <Lock size={12} /> Locked
                        </span>
                      )}
                    </div>

                    <h3 style={{ margin: "4px 0 6px", fontSize: "1.05rem", color: title.badgeColor }}>
                      {title.name}
                    </h3>

                    <p style={{ margin: "0 0 10px", fontSize: "0.85rem", color: "#f2e9e9", lineHeight: 1.35 }}>
                      {title.description}
                    </p>

                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#8a6b70",
                        background: "rgba(0,0,0,0.3)",
                        padding: "6px 8px",
                        borderRadius: 4,
                        borderLeft: `2px solid ${title.badgeColor}`,
                      }}
                    >
                      <strong style={{ color: "#c9a876" }}>Condition: </strong>
                      {title.unlockCondition}
                    </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    {isUnlocked ? (
                      <button
                        className="action-btn"
                        style={{
                          width: "100%",
                          fontSize: "0.8rem",
                          padding: "6px",
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
                          fontSize: "0.75rem",
                          color: "#8a6b70",
                          textAlign: "center",
                          padding: "6px",
                        }}
                      >
                        Locked — Complete condition to awaken
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

// ── HELPER SUBCOMPONENT FOR SLOTS ──
function EquipmentSlotCard({
  slot,
  title,
  item,
  onUnequip,
  ownedEligible,
  onEquipItem,
}: {
  slot: EquipmentSlot;
  title: string;
  item?: ItemDefinition;
  onUnequip: () => void;
  ownedEligible: PlayerInventoryItem[];
  onEquipItem: (id: string) => void;
}) {
  const [isChanging, setIsChanging] = useState(false);
  const rarityColor = item ? RARITY_COLORS[item.rarity] : "#8a6b70";

  return (
    <div
      className="panel-box"
      style={{
        borderColor: item ? rarityColor : "#631826",
        background: "rgba(20, 9, 11, 0.9)",
      }}
    >
      <div className="panel-topbar" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="card-title">{title}</div>
          {item ? (
            <span
              style={{
                fontSize: "0.68rem",
                padding: "2px 7px",
                borderRadius: 4,
                background: "rgba(34, 197, 94, 0.15)",
                border: "1px solid #22c55e",
                color: "#86efac",
                fontWeight: "bold",
                letterSpacing: "0.03em",
              }}
            >
              Status: EQUIPPED
            </span>
          ) : (
            <span
              style={{
                fontSize: "0.68rem",
                padding: "2px 7px",
                borderRadius: 4,
                background: "rgba(138, 107, 112, 0.15)",
                border: "1px solid rgba(138, 107, 112, 0.4)",
                color: "#8a6b70",
                letterSpacing: "0.03em",
              }}
            >
              Status: NOT EQUIPPED
            </span>
          )}
        </div>
        {item && (
          <button
            onClick={onUnequip}
            style={{
              background: "transparent",
              border: "none",
              color: "#ef4444",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
          >
            Unequip
          </button>
        )}
      </div>

      {item ? (
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontSize: "1rem", color: rarityColor }}>{item.name}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "#c9a876",
                  background: "rgba(201, 168, 118, 0.12)",
                  border: "1px solid rgba(201, 168, 118, 0.3)",
                  padding: "1px 6px",
                  borderRadius: 4,
                }}
              >
                Inventory: Owned ×{ownedEligible.find((i) => i.definition?.id === item.id)?.quantity || 1}
              </span>
              <span style={{ fontSize: "0.7rem", color: rarityColor, textTransform: "uppercase" }}>{item.rarity}</span>
            </div>
          </div>
          <p style={{ margin: "4px 0 10px", fontSize: "0.8rem", color: "#8a6b70", lineHeight: 1.3 }}>
            {item.description}
          </p>
          {item.statModifiers && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {Object.entries(item.statModifiers).map(([s, val]) => (
                <span
                  key={s}
                  style={{
                    fontSize: "0.7rem",
                    background: "rgba(34, 197, 94, 0.15)",
                    border: "1px solid #22c55e",
                    color: "#86efac",
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  +{val} {s.toUpperCase().slice(0, 3)}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: "20px 0", textAlign: "center", color: "#8a6b70", fontSize: "0.85rem" }}>
          Empty Slot — No {slot} equipped
        </div>
      )}

      {/* Eligible Items Dropdown / Selector */}
      <div style={{ marginTop: 10, borderTop: "1px solid #3f1a20", paddingTop: 10 }}>
        <button
          className="action-btn"
          style={{ width: "100%", fontSize: "0.75rem", padding: "5px 8px" }}
          onClick={() => setIsChanging(!isChanging)}
        >
          {isChanging ? "Close Selector" : `Change ${slot.toUpperCase()} (${ownedEligible.length} owned)`}
        </button>

        {isChanging && (
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {ownedEligible.length === 0 ? (
              <p style={{ fontSize: "0.75rem", color: "#8a6b70", margin: 4 }}>
                No alternative {slot} items in inventory.
              </p>
            ) : (
              ownedEligible.map((inv) => {
                const def = inv.definition;
                if (!def) return null;
                const isCurrent = item?.id === def.id;
                return (
                  <div
                    key={inv.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 8px",
                      background: "rgba(0, 0, 0, 0.3)",
                      borderRadius: 4,
                      border: `1px solid ${RARITY_COLORS[def.rarity]}`,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.8rem", color: "#f2e9e9" }}>{def.name}</div>
                      <div style={{ fontSize: "0.7rem", color: "#8a6b70" }}>
                        {Object.entries(def.statModifiers || {})
                          .map(([s, b]) => `+${b} ${s.slice(0, 3)}`)
                          .join(", ")}
                      </div>
                    </div>
                    <button
                      className="action-btn"
                      style={{ fontSize: "0.7rem", padding: "4px 8px" }}
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
    </div>
  );
}
