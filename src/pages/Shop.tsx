import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coins,
  Plus,
  X,
  ShoppingBag,
  Sparkles,
  Search,
  Lock,
  Check,
  CheckCircle,
  Clock,
  ArrowRight,
  Swords,
  Award,
  Layers,
  Percent,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import type { RewardItem } from "../lib/rewardsData";
import type { ItemRarity, RewardCategory } from "../data/rewards";
import ShopItemArt from "../components/ShopItemArt";
import "./Shop.css";

interface ShopProps {
  rewards: RewardItem[];
  coins: number;
  onPurchase: (rewardId: string, cost: number) => Promise<void> | void;
  onAddReward: (reward: { title: string; description: string; cost: number; type: string }) => void;
}

type CategoryTab = "all" | RewardCategory;
type StatusFilter = "all" | "affordable" | "owned";

interface RarityStyle {
  label: string;
  tag: string;
  color: string;
  border: string;
  glow: string;
}

const RARITY_MAP: Record<ItemRarity, RarityStyle> = {
  COMMON: {
    label: "Common // Initiate",
    tag: "RANK E",
    color: "#eee9ee",
    border: "#8a6b70",
    glow: "rgba(138, 107, 112, 0.25)",
  },
  RARE: {
    label: "Rare // Scout",
    tag: "RANK D",
    color: "#7dd3fc",
    border: "#38bdf8",
    glow: "rgba(56, 189, 248, 0.35)",
  },
  EPIC: {
    label: "Epic // Vanguard",
    tag: "RANK C",
    color: "#e9d5ff",
    border: "#c084fc",
    glow: "rgba(192, 132, 252, 0.4)",
  },
  LEGENDARY: {
    label: "Legendary // Monarch",
    tag: "RANK S",
    color: "#fde047",
    border: "#ffd700",
    glow: "rgba(255, 215, 0, 0.45)",
  },
};

function getItemSubtype(reward: RewardItem): string {
  switch (reward.category) {
    case "consumable":
      if (reward.id === "potion_xp") return "CONSUMABLE // ELIXIR";
      if (reward.id === "streak_freeze") return "CONSUMABLE // STREAK WARD";
      if (reward.id === "coin_magnet") return "CATALYST // RESONATOR";
      return "CONSUMABLE // VIAL";
    case "gear":
      if (reward.id.includes("blade") || reward.id.includes("sword")) return "WEAPON // MAIN-HAND";
      if (reward.id.includes("shield")) return "SHIELD // OFF-HAND";
      if (reward.id.includes("crown") || reward.id.includes("cloak")) return "ARMOR // CHEST";
      if (reward.id.includes("ring") || reward.id.includes("amulet") || reward.id.includes("band")) return "RELIC // ACCESSORY";
      return "ARTIFACT // GEAR";
    case "real_life":
      return "REAL-LIFE // REWARD";
    case "cosmetic":
      return "COSMETIC // PROTOCOL";
    default:
      return "REQUISITION // ITEM";
  }
}

interface ItemPerk {
  text: string;
  type: "gold" | "cyan" | "crimson" | "default";
}

function getItemPerks(reward: RewardItem): ItemPerk[] {
  switch (reward.id) {
    case "potion_xp":
      return [
        { text: "+100% XP SURGE", type: "gold" },
        { text: "NEXT 3 QUESTS", type: "default" },
      ];
    case "streak_freeze":
      return [
        { text: "CHRONO WARD", type: "cyan" },
        { text: "PROTECTS STREAK", type: "default" },
      ];
    case "stamina_flask":
      return [
        { text: "+1 QUEST SLOT", type: "cyan" },
        { text: "INSTANT FOCUS", type: "default" },
      ];
    case "coin_magnet":
      return [
        { text: "+50% SOUL COINS", type: "gold" },
        { text: "24 HOURS ACTIVE", type: "default" },
      ];
    case "vitality_infusion":
      return [
        { text: "+5 VITALITY", type: "crimson" },
        { text: "PERMANENT", type: "default" },
      ];
    case "focus_brew":
      return [
        { text: "+5 FOCUS", type: "cyan" },
        { text: "PERMANENT", type: "default" },
      ];
    case "discipline_draught":
      return [
        { text: "+5 DISCIPLINE", type: "gold" },
        { text: "PERMANENT", type: "default" },
      ];
    case "blade_of_focus":
      return [
        { text: "+10% QUEST XP", type: "gold" },
        { text: "OBSIDIAN EDGE", type: "default" },
      ];
    case "cloak_of_shadows":
      return [
        { text: "+5 FOCUS", type: "cyan" },
        { text: "DISTRACTION SHIELD", type: "default" },
      ];
    case "crown_of_discipline":
      return [
        { text: "MONARCH CROWN", type: "gold" },
        { text: "DISCIPLINE AURA", type: "default" },
      ];
    case "ring_of_time":
      return [
        { text: "+10% STREAK BUFFER", type: "cyan" },
        { text: "STARDUST BAND", type: "default" },
      ];
    case "shield_of_consistency":
      return [
        { text: "BURNOUT WARD", type: "cyan" },
        { text: "VANGUARD AEGIS", type: "default" },
      ];
    case "boots_of_momentum":
      return [
        { text: "SWIFT STEPS", type: "cyan" },
        { text: "MORNING PROD", type: "default" },
      ];
    case "amulet_of_insight":
      return [
        { text: "ENLIGHTENMENT", type: "cyan" },
        { text: "+30M LEARNING", type: "default" },
      ];
    default:
      if (reward.category === "real_life") {
        return [{ text: "REAL-WORLD RITUAL", type: "cyan" }];
      }
      if (reward.category === "cosmetic") {
        return [{ text: "HUNTER IDENTITY", type: "crimson" }];
      }
      return [{ text: "SYSTEM REQUISITION", type: "default" }];
  }
}

export default function Shop({ rewards, coins, onPurchase, onAddReward }: ShopProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState<RewardItem | null>(null);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  // Form states for custom reward
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState(100);
  const [type, setType] = useState("real_life");

  // Daily Stock Protocol countdown timer (until midnight UTC)
  const [timeLeft, setTimeLeft] = useState({ hours: "06", minutes: "14", seconds: "22" });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextMidnightUTC = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
        0, 0, 0
      ));
      const diffMs = Math.max(0, nextMidnightUTC.getTime() - now.getTime());
      const totalSec = Math.floor(diffMs / 1000);
      const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
      const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
      const s = String(totalSec % 60).padStart(2, "0");
      setTimeLeft({ hours: h, minutes: m, seconds: s });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard navigation for purchase confirmation modal (ESC to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && pendingPurchase) {
        setPendingPurchase(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pendingPurchase]);

  // Categories configuration with dynamic item counts
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryTab, number> = {
      all: rewards.length,
      consumable: 0,
      gear: 0,
      real_life: 0,
      cosmetic: 0,
    };
    for (const r of rewards) {
      if (counts[r.category] !== undefined) {
        counts[r.category]++;
      }
    }
    return counts;
  }, [rewards]);

  const categories: { id: CategoryTab; label: string; count: number }[] = useMemo(() => [
    { id: "all", label: "All Items", count: categoryCounts.all },
    { id: "consumable", label: "Buffs & Elixirs", count: categoryCounts.consumable },
    { id: "gear", label: "Artifacts & Gear", count: categoryCounts.gear },
    { id: "real_life", label: "Real-Life Rewards", count: categoryCounts.real_life },
    { id: "cosmetic", label: "Titles & Cosmetics", count: categoryCounts.cosmetic },
  ], [categoryCounts]);

  const ownedCount = useMemo(() => rewards.filter((r) => r.owned).length, [rewards]);
  const affordableCount = useMemo(() => rewards.filter((r) => !r.owned && coins >= r.cost).length, [rewards, coins]);

  // Filter and search application
  const filteredRewards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return rewards.filter((r) => {
      if (selectedCategory !== "all" && r.category !== selectedCategory) return false;
      if (statusFilter === "owned" && !r.owned) return false;
      if (statusFilter === "affordable" && (r.owned || coins < r.cost)) return false;
      if (query) {
        const matchesTitle = r.title.toLowerCase().includes(query);
        const matchesDesc = (r.description || "").toLowerCase().includes(query);
        const matchesType = getItemSubtype(r).toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesType) return false;
      }
      return true;
    });
  }, [rewards, selectedCategory, statusFilter, coins, searchQuery]);

  const handleSubmitCustomReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddReward({ title: title.trim(), description: description.trim(), cost, type });
    setTitle("");
    setDescription("");
    setCost(100);
    setShowForm(false);
  };

  const handleConfirmPurchase = async () => {
    if (!pendingPurchase || purchasingId !== null) return;
    const item = pendingPurchase;
    setPurchasingId(item.id);
    try {
      await onPurchase(item.id, item.cost);
      setPendingPurchase(null);
    } finally {
      setPurchasingId(null);
    }
  };

  const resetFilters = useCallback(() => {
    setSelectedCategory("all");
    setStatusFilter("all");
    setSearchQuery("");
  }, []);

  return (
    <div className="shop-root">
      {/* Ambient Atmospheric Flares */}
      <div className="shop-ambient-flare-1" />
      <div className="shop-ambient-flare-2" />
      <div className="shop-ambient-flare-3" />

      <main className="shop-container">
        {/* ── Top Command Requisitions Bar ── */}
        <section className="shop-header-wrap">
          <div className="shop-header-info">
            <div className="shop-sector-badge">
              <span className="shop-beacon-dot" />
              <span>SECTOR 09 // QUARTERMASTER</span>
              <span className="shop-clearance-tag">CLEARANCE: HUNTER-ACTIVE</span>
            </div>
            <h1 className="shop-title">Shop // Shadow Armory Requisitions</h1>
            <p className="shop-subtitle">
              Acquire combat-grade equipment, cognitive elixirs, and streak catalysts. Fortify hunter combat parameters against task resistance.
            </p>
          </div>

          {/* Vault Currency Pill Card */}
          <div className="shop-vault-pill-wrap">
            <div className="shop-vault-pill">
              <div className="shop-vault-icon-frame">
                <Coins size={22} color="#ffd700" />
              </div>
              <div className="shop-vault-data">
                <div className="shop-vault-balance-row">
                  <span className="shop-vault-amount">{coins.toLocaleString()}</span>
                  <span className="shop-vault-unit">SOUL COINS</span>
                </div>
                <span className="shop-vault-subtext">AUTHORIZED BALANCE</span>
              </div>

              <div className="shop-vault-divider" />

              <div className="shop-vault-secondary-icon">
                <ShoppingBag size={16} />
              </div>
              <div className="shop-vault-data">
                <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1rem", fontWeight: 700, color: "#eee9ee" }}>
                  {ownedCount}
                </span>
                <span className="shop-vault-subtext">ACQUIRED</span>
              </div>
            </div>

            <button
              type="button"
              className={`shop-action-btn ${showForm ? "btn-locked" : "btn-buy"}`}
              onClick={() => setShowForm((v) => !v)}
              style={{ whiteSpace: "nowrap" }}
            >
              {showForm ? <X size={14} /> : <Plus size={14} />}
              <span>{showForm ? "Close Form" : "Custom Reward"}</span>
            </button>
          </div>
        </section>

        {/* ── Custom Real-World Reward Console (Collapsible) ── */}
        <AnimatePresence>
          {showForm && (
            <motion.section
              className="shop-custom-drawer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="shop-custom-drawer-header">
                <div className="shop-custom-title">
                  <Sparkles size={16} color="#ffd700" />
                  <span>Craft Custom Real-World Reward</span>
                </div>
                <button
                  type="button"
                  className="shop-modal-close-btn"
                  onClick={() => setShowForm(false)}
                  aria-label="Close custom reward form"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitCustomReward} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="shop-form-group">
                  <label className="shop-form-label" htmlFor="reward-title">Reward Name</label>
                  <input
                    id="reward-title"
                    className="shop-form-input"
                    type="text"
                    placeholder="e.g. Sushi Dinner, Weekend Hike, New Ergonomic Chair"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="shop-form-group">
                  <label className="shop-form-label" htmlFor="reward-desc">Description (Optional)</label>
                  <input
                    id="reward-desc"
                    className="shop-form-input"
                    type="text"
                    placeholder="Personal guidelines or milestones for redeeming this indulgence"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="shop-form-grid">
                  <div className="shop-form-group">
                    <label className="shop-form-label" htmlFor="reward-cost">Coin Cost</label>
                    <input
                      id="reward-cost"
                      className="shop-form-input"
                      type="number"
                      min={10}
                      value={cost}
                      onChange={(e) => setCost(Number(e.target.value))}
                    />
                  </div>

                  <div className="shop-form-group">
                    <label className="shop-form-label" htmlFor="reward-cat">Category Classification</label>
                    <select
                      id="reward-cat"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="shop-custom-select"
                    >
                      <option value="real_life">Real-Life Reward</option>
                      <option value="consumable">Consumable Buff</option>
                      <option value="gear">Artifact / Gear</option>
                      <option value="cosmetic">Title / Cosmetic</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", paddingTop: "0.5rem" }}>
                  <button
                    type="button"
                    className="shop-modal-btn-abort"
                    onClick={() => setShowForm(false)}
                    style={{ flex: "none", width: "auto" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="shop-action-btn btn-buy"
                  >
                    <Plus size={14} />
                    <span>Add to Requisition Catalog</span>
                  </button>
                </div>
              </form>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── Filter Protocols & Requisition Search ── */}
        <section className="shop-controls-bar">
          {/* Category Tabs */}
          <div className="shop-cat-tabs-container">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`shop-cat-tab-btn ${selectedCategory === cat.id ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span>{cat.label}</span>
                <span className="shop-cat-tab-count">({cat.count})</span>
              </button>
            ))}
          </div>

          {/* Tactical Search Bar */}
          <div className="shop-search-wrap">
            <span className="shop-search-icon">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="shop-search-input"
              placeholder="SEARCH REQUISITION INDEX..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="shop-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </section>

        {/* Sub-status filter chips */}
        <div className="shop-status-chips-row">
          <button
            type="button"
            className={`shop-status-chip ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            Show All ({rewards.length})
          </button>
          <button
            type="button"
            className={`shop-status-chip ${statusFilter === "affordable" ? "active" : ""}`}
            onClick={() => setStatusFilter("affordable")}
          >
            Can Afford ({affordableCount})
          </button>
          <button
            type="button"
            className={`shop-status-chip ${statusFilter === "owned" ? "active" : ""}`}
            onClick={() => setStatusFilter("owned")}
          >
            In Inventory ({ownedCount})
          </button>
        </div>

        {/* ── Main Catalog Workspace & Telemetry Sidebar ── */}
        <div className="shop-workspace-grid">
          {/* Requisition Items Deck */}
          <div className="shop-catalog-grid">
            {filteredRewards.map((reward) => {
              const rarityCfg = RARITY_MAP[reward.rarity] || RARITY_MAP.COMMON;
              const canAfford = coins >= reward.cost;
              const subtype = getItemSubtype(reward);
              const perks = getItemPerks(reward);

              return (
                <div
                  key={reward.id}
                  className={`shop-item-card ${reward.owned ? "is-owned" : !canAfford ? "is-insufficient" : ""}`}
                  style={{
                    "--rarity-border": rarityCfg.border,
                    "--rarity-glow": rarityCfg.glow,
                    "--rarity-text": rarityCfg.color,
                  } as React.CSSProperties}
                >
                  {/* Top visual & frame */}
                  <div className="shop-item-visual">
                    <div className="shop-item-icon-glow" />

                    <div className="shop-item-art-wrap">
                      <ShopItemArt
                        itemId={reward.id}
                        category={reward.category}
                        title={reward.title}
                        size={84}
                      />
                    </div>

                    <div className="shop-item-rarity-badge">
                      {rarityCfg.label}
                    </div>

                    <div className="shop-item-tag-badge">
                      {rarityCfg.tag}
                    </div>

                    {reward.owned && (
                      <div className="shop-item-owned-watermark">
                        <span className="shop-item-owned-pill">
                          <Check size={13} />
                          <span>
                            {reward.id === "potion_xp" || reward.id === "coin_magnet"
                              ? "ACTIVE BUFF"
                              : "IN ARMORY"}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body information */}
                  <div className="shop-item-content">
                    <div className="shop-item-category-label">{subtype}</div>
                    <h2 className="shop-item-title">{reward.title}</h2>
                    <p className="shop-item-desc">{reward.description}</p>

                    {/* Dynamic parameter / modifier chips */}
                    <div className="shop-item-perks-row">
                      {perks.map((perk, i) => (
                        <span
                          key={i}
                          className={`shop-perk-chip ${
                            perk.type === "gold"
                              ? "perk-gold"
                              : perk.type === "cyan"
                              ? "perk-cyan"
                              : perk.type === "crimson"
                              ? "perk-crimson"
                              : ""
                          }`}
                        >
                          {perk.text}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer & Acquisition Button */}
                  <div className="shop-item-footer">
                    <div className="shop-item-cost-wrap">
                      <span className="shop-item-fee-label">REQUISITION FEE</span>
                      <div className={`shop-item-cost-amount ${!canAfford && !reward.owned ? "insufficient" : ""}`}>
                        <Coins size={16} color={canAfford || reward.owned ? "#ffd700" : "#ac8884"} />
                        <span>{reward.cost.toLocaleString()}</span>
                      </div>
                    </div>

                    {reward.owned ? (
                      <button
                        type="button"
                        className="shop-action-btn btn-owned"
                        disabled
                      >
                        <CheckCircle size={14} />
                        <span>
                          {reward.id === "potion_xp" || reward.id === "coin_magnet"
                            ? "ACTIVE BUFF ✓"
                            : "OWNED ✓"}
                        </span>
                      </button>
                    ) : canAfford ? (
                      <button
                        type="button"
                        className="shop-action-btn btn-buy"
                        onClick={() => setPendingPurchase(reward)}
                      >
                        <ShoppingBag size={14} />
                        <span>BUY</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="shop-action-btn btn-locked"
                        disabled
                        title="Insufficient Soul Coins"
                      >
                        <Lock size={14} />
                        <span>NEED COINS</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State when no items match filters */}
          {filteredRewards.length === 0 && (
            <div className="shop-empty-panel">
              <div className="shop-empty-icon">
                <Search size={26} />
              </div>
              <h2 className="shop-empty-title">NO REQUISITIONS FOUND</h2>
              <p className="shop-empty-sub">
                No store armaments match your current filter parameters or search query.
              </p>
              <button
                type="button"
                className="shop-action-btn btn-buy"
                onClick={resetFilters}
                style={{ marginTop: "0.5rem" }}
              >
                <RotateCcw size={14} />
                <span>Reset Filters</span>
              </button>
            </div>
          )}

          {/* ── Requisitions Telemetry Sidebar (Desktop XL) ── */}
          <aside className="shop-sidebar">
            {/* Stock Timer Card */}
            <div className="shop-sidebar-card">
              <div className="shop-sidebar-card-topbar">
                <div className="shop-sidebar-card-title">
                  <Clock size={16} color="#ffb4ab" />
                  <span>[ PROTOCOL TELEMETRY ]</span>
                </div>
                <span className="shop-sidebar-version">v4.92</span>
              </div>

              <div className="shop-timer-box">
                <div className="shop-timer-row">
                  <span style={{ color: "#ac8884" }}>DAILY STOCK RESET</span>
                  <span className="shop-timer-val">
                    {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
                  </span>
                </div>
                <div className="shop-timer-track">
                  <div
                    className="shop-timer-fill"
                    style={{
                      width: `${Math.min(100, Math.max(10, ((Number(timeLeft.hours) * 60 + Number(timeLeft.minutes)) / 1440) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Special Provision notice */}
              <div className="shop-provision-banner">
                <div className="shop-provision-title">
                  <Percent size={14} />
                  <span>ACTIVE REQUISITIONS NOTICE</span>
                </div>
                <p className="shop-provision-text">
                  Consumable elixirs and permanent stat infusions synchronize immediately to your hunter profile upon confirmation.
                </p>
              </div>

              {/* Active Loadout Link to Armory */}
              <Link to="/armory" className="shop-armory-link">
                <div className="shop-armory-link-content">
                  <Swords size={16} color="#ffb4ab" />
                  <span>VIEW ACTIVE ARMORY</span>
                </div>
                <ArrowRight size={15} color="#ac8884" />
              </Link>
            </div>

            {/* Harvest Telemetry Intel Card */}
            <div className="shop-sidebar-card">
              <div className="shop-sidebar-card-topbar">
                <div className="shop-sidebar-card-title">
                  <TrendingUp size={16} color="#ffd700" />
                  <span>HARVEST TELEMETRY</span>
                </div>
              </div>

              <p style={{ fontSize: "0.8125rem", color: "#ac8884", margin: 0, lineHeight: 1.45 }}>
                Acquire Soul Coins automatically by verifying real-world daily habits and executing critical raid boss strikes.
              </p>

              <div className="shop-harvest-list">
                <div className="shop-harvest-item">
                  <span className="shop-harvest-label">DAILY DIRECTIVES (4/4)</span>
                  <span className="shop-harvest-payout">+120 COINS</span>
                </div>
                <div className="shop-harvest-item">
                  <span className="shop-harvest-label">7-DAY STREAK CATALYST</span>
                  <span className="shop-harvest-payout">+300 COINS</span>
                </div>
                <div className="shop-harvest-item">
                  <span className="shop-harvest-label">BOSS RAID CRITICAL HIT</span>
                  <span className="shop-harvest-payout">+500 COINS</span>
                </div>
              </div>
            </div>

            {/* Catalog Breakdown */}
            <div className="shop-sidebar-card">
              <div className="shop-sidebar-card-topbar">
                <div className="shop-sidebar-card-title">
                  <Layers size={16} color="#00e5ff" />
                  <span>CATALOG BREAKDOWN</span>
                </div>
              </div>

              <div className="shop-harvest-list">
                <div className="shop-harvest-item">
                  <span className="shop-harvest-label">TOTAL STOCK ENTRIES</span>
                  <span style={{ color: "#eee9ee", fontWeight: 700 }}>{rewards.length}</span>
                </div>
                <div className="shop-harvest-item">
                  <span className="shop-harvest-label">AFFORDABLE ITEMS</span>
                  <span style={{ color: "#ffd700", fontWeight: 700 }}>{affordableCount}</span>
                </div>
                <div className="shop-harvest-item">
                  <span className="shop-harvest-label">ALREADY ACQUIRED</span>
                  <span style={{ color: "#4ade80", fontWeight: 700 }}>{ownedCount}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* ── PURCHASE CONFIRMATION MODAL / BOTTOM SHEET ── */}
      <AnimatePresence>
        {pendingPurchase && (
          <motion.div
            className="shop-modal-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget && purchasingId === null) {
                setPendingPurchase(null);
              }
            }}
          >
            <motion.div
              className="shop-modal-card"
              initial={{ y: 30, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18 }}
            >
              <div className="shop-modal-pull-handle" />

              {/* Modal Header */}
              <div className="shop-modal-header">
                <div className="shop-modal-header-text">
                  <span className="shop-modal-checkpoint">// SECURITY CHECKPOINT</span>
                  <h2 className="shop-modal-title">Confirm Requisition</h2>
                </div>
                <button
                  type="button"
                  className="shop-modal-close-btn"
                  onClick={() => {
                    if (purchasingId === null) setPendingPurchase(null);
                  }}
                  disabled={purchasingId !== null}
                  aria-label="Close confirmation modal"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Transaction Preview Card */}
              <div className="shop-modal-preview">
                <div className="shop-modal-preview-topbar">
                  <span className="shop-modal-preview-cat">{getItemSubtype(pendingPurchase)}</span>
                  <span className="shop-modal-preview-tx">PROTOCOL // AUTH-0x{pendingPurchase.cost.toString(16).toUpperCase()}</span>
                </div>

                <div className="shop-modal-preview-main">
                  <div className="shop-modal-item-icon-box">
                    <ShopItemArt
                      itemId={pendingPurchase.id}
                      category={pendingPurchase.category}
                      title={pendingPurchase.title}
                      size={48}
                    />
                  </div>
                  <div className="shop-modal-item-info">
                    <span className="shop-modal-item-name">{pendingPurchase.title}</span>
                    <span className="shop-modal-item-sub">Direct inventory & profile synchronization</span>
                  </div>
                </div>

                {/* Ledger calculation */}
                <div className="shop-modal-ledger">
                  <div className="shop-modal-ledger-row">
                    <span>CURRENT BALANCE</span>
                    <span style={{ color: "#eee9ee" }}>{coins.toLocaleString()} SOUL COINS</span>
                  </div>
                  <div className="shop-modal-ledger-row cost-row">
                    <span>REQUISITION COST</span>
                    <span style={{ fontWeight: 700 }}>-{pendingPurchase.cost.toLocaleString()} SOUL COINS</span>
                  </div>
                  <div className="shop-modal-ledger-row projected-row">
                    <span>PROJECTED RESERVES</span>
                    <span className="shop-modal-remaining-val">
                      {(coins - pendingPurchase.cost).toLocaleString()} SOUL COINS
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="shop-modal-actions">
                <button
                  type="button"
                  className="shop-modal-btn-abort"
                  onClick={() => setPendingPurchase(null)}
                  disabled={purchasingId !== null}
                >
                  ABORT // ESC
                </button>

                <button
                  type="button"
                  className="shop-modal-btn-confirm"
                  onClick={handleConfirmPurchase}
                  disabled={purchasingId !== null}
                >
                  {purchasingId === pendingPurchase.id ? (
                    <>
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          border: "2px solid rgba(255, 255, 255, 0.4)",
                          borderTopColor: "#fff",
                          borderRadius: "50%",
                          animation: "tacticalSpin 0.7s linear infinite",
                          display: "inline-block",
                        }}
                      />
                      <span>TRANSMUTING...</span>
                    </>
                  ) : (
                    <>
                      <Award size={16} />
                      <span>CONFIRM ACQUISITION</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}