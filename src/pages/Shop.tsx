import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Plus, X, ShoppingBag, Sparkles, Shield, Coffee, Gift, Gem, Flame, Crown, Heart, Target } from "lucide-react";
import type { RewardItem } from "../lib/rewardsData";
import type { ItemRarity, RewardCategory } from "../data/rewards";

interface ShopProps {
  rewards: RewardItem[];
  coins: number;
  onPurchase: (rewardId: string, cost: number) => Promise<void> | void;
  onAddReward: (reward: { title: string; description: string; cost: number; type: string }) => void;
}

const RARITY_COLORS: Record<ItemRarity, { border: string; glow: string; text: string; label: string }> = {
  COMMON: { border: "#8a6b70", glow: "rgba(138, 107, 112, 0.2)", text: "#f2e9e9", label: "Common" },
  RARE: { border: "#3b82f6", glow: "rgba(59, 130, 246, 0.3)", text: "#60a5fa", label: "Rare" },
  EPIC: { border: "#a855f7", glow: "rgba(168, 85, 247, 0.35)", text: "#c084fc", label: "Epic" },
  LEGENDARY: { border: "#f59e0b", glow: "rgba(245, 158, 11, 0.4)", text: "#fbbf24", label: "Legendary" },
};

function renderItemIcon(iconName: string, color: string) {
  const size = 26;
  switch (iconName) {
    case "flask":
    case "coffee":
      return <Coffee size={size} color={color} />;
    case "shield":
      return <Shield size={size} color={color} />;
    case "coins":
      return <Coins size={size} color={color} />;
    case "heart":
      return <Heart size={size} color={color} />;
    case "target":
      return <Target size={size} color={color} />;
    case "crown":
      return <Crown size={size} color={color} />;
    case "gem":
      return <Gem size={size} color={color} />;
    case "flame":
      return <Flame size={size} color={color} />;
    case "gift":
    default:
      return <Gift size={size} color={color} />;
  }
}

type CategoryTab = "all" | RewardCategory;
type StatusFilter = "all" | "affordable" | "owned";

export default function Shop({ rewards, coins, onPurchase, onAddReward }: ShopProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showForm, setShowForm] = useState(false);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState(100);
  const [type, setType] = useState("real_life");


  const categories: { id: CategoryTab; label: string }[] = [
    { id: "all", label: "All Items" },
    { id: "consumable", label: "Buffs & Elixirs" },
    { id: "gear", label: "Artifacts & Gear" },
    { id: "real_life", label: "Real-Life Rewards" },
    { id: "cosmetic", label: "Titles & Cosmetics" },
  ];

  const filteredRewards = rewards.filter((r) => {
    if (selectedCategory !== "all" && r.category !== selectedCategory) return false;
    if (statusFilter === "owned" && !r.owned) return false;
    if (statusFilter === "affordable" && (r.owned || coins < r.cost)) return false;
    return true;
  });

  const ownedCount = rewards.filter((r) => r.owned).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddReward({ title: title.trim(), description: description.trim(), cost, type });
    setTitle("");
    setDescription("");
    setCost(100);
    setShowForm(false);
  };

  return (
    <main>
      <div className="system-header">
        <h1>Soul Merchant Bazaar</h1>

        <div className="inline-meta">
          <span className="value-badge" style={{ borderColor: "#ffd700", color: "#ffd700" }}>
            <Coins size={14} style={{ marginRight: 6 }} />
            {coins} Coins
          </span>
          <span className="value-badge">
            <ShoppingBag size={14} style={{ marginRight: 6 }} />
            {ownedCount} Owned
          </span>
        </div>
      </div>

      {/* Bazaar Banner */}
      <div className="shop-hero-banner">
        <div className="shop-hero-content">
          <div className="shop-hero-title">
            <Sparkles size={18} color="#ffd700" />
            <span>Exchange Soul Coins for Power, Freedom & Indulgences</span>
          </div>
          <p className="shop-hero-sub">
            Every quest you conquer yields coins. Spend them on in-game stat buffs, protective artifacts, or real-world treats.
          </p>
        </div>
        <button
          type="button"
          className="primary"
          onClick={() => setShowForm((v) => !v)}
          style={{ whiteSpace: "nowrap" }}
        >
          {showForm ? <X size={14} style={{ marginRight: 6 }} /> : <Plus size={14} style={{ marginRight: 6 }} />}
          {showForm ? "Cancel" : "Custom Reward"}
        </button>
      </div>

      {/* Custom Reward Creation Modal / Drawer */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="panel-box"
            style={{ marginTop: 16 }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="panel-topbar">
              <div className="card-title">Craft Custom Real-World Reward</div>
              <button type="button" onClick={() => setShowForm(false)} aria-label="Close">
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ marginTop: 14 }}>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="input-label" htmlFor="reward-title">Reward Name</label>
                <input
                  id="reward-title"
                  type="text"
                  placeholder="e.g. Sushi Dinner, Weekend Hike, Buy New Shoes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="input-label" htmlFor="reward-desc">Description (Optional)</label>
                <input
                  id="reward-desc"
                  type="text"
                  placeholder="Rules or details for redeeming this reward"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label className="input-label" htmlFor="reward-cost">Coin Cost</label>
                  <input
                    id="reward-cost"
                    type="number"
                    min={10}
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="input-label" htmlFor="reward-cat">Category</label>
                  <select
                    id="reward-cat"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="custom-select"
                  >
                    <option value="real_life">Real-Life Reward</option>
                    <option value="consumable">Consumable Buff</option>
                    <option value="gear">Artifact / Gear</option>
                    <option value="cosmetic">Title / Cosmetic</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="primary">
                Add to Merchant Catalog
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Tabs */}
      <div className="shop-filter-bar">
        <div className="filter-tabs" style={{ marginTop: 16 }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`filter-tab ${selectedCategory === cat.id ? "filter-tab-active" : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sub-status filters */}
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          {(["all", "affordable", "owned"] as StatusFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              className={`filter-tab ${statusFilter === f ? "filter-tab-active" : ""}`}
              style={{ fontSize: "0.65rem", padding: "4px 10px" }}
              onClick={() => setStatusFilter(f)}
            >
              {f === "all" ? "Show All" : f === "affordable" ? "Can Afford" : "Purchased"}
            </button>
          ))}
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="shop-grid" style={{ marginTop: 18 }}>
        {filteredRewards.map((reward) => {
          const rarityCfg = RARITY_COLORS[reward.rarity] || RARITY_COLORS.COMMON;
          const canAfford = coins >= reward.cost;

          return (
            <motion.div
              key={reward.id}
              className={`shop-card ${reward.owned ? "shop-card-owned" : ""}`}
              style={{
                "--rarity-color": rarityCfg.border,
                "--rarity-glow": rarityCfg.glow,
              } as React.CSSProperties}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div className="shop-card-topbar">
                <div
                  className="shop-card-icon"
                  style={{
                    borderColor: rarityCfg.border,
                    boxShadow: `0 0 12px ${rarityCfg.glow}`,
                  }}
                >
                  {renderItemIcon(reward.icon, rarityCfg.border)}
                </div>

                <div className="shop-card-badge" style={{ color: rarityCfg.text, borderColor: rarityCfg.border }}>
                  {rarityCfg.label}
                </div>
              </div>

              <div className="shop-card-body">
                <h3 className="shop-card-title">{reward.title}</h3>
                <p className="shop-card-desc">{reward.description}</p>
              </div>

              <div className="shop-card-footer">
                <div className="shop-card-price">
                  <Coins size={14} color="#ffd700" />
                  <span>{reward.cost} Coins</span>
                </div>

                {reward.owned ? (
                  <span className="shop-owned-tag">
                    {reward.id === "potion_xp" || reward.id === "coin_magnet" ? "ACTIVE BUFF ✓" : "OWNED ✓"}
                  </span>
                ) : (
                  <button
                    type="button"
                    className={`shop-buy-btn ${canAfford && purchasingId === null ? "primary" : "disabled-btn"}`}
                    disabled={!canAfford || purchasingId !== null}
                    onClick={async () => {
                      if (purchasingId !== null) return;
                      setPurchasingId(reward.id);
                      try {
                        await onPurchase(reward.id, reward.cost);
                      } finally {
                        setPurchasingId(null);
                      }
                    }}
                  >
                    {purchasingId === reward.id ? "Acquiring..." : canAfford ? "Acquire" : "Need Coins"}
                  </button>
                )}
              </div>
            </motion.div>

          );
        })}
      </div>

      {filteredRewards.length === 0 && (
        <div className="panel-box" style={{ marginTop: 24, textAlign: "center", padding: 32 }}>
          <div className="card-title">No items found in this shelf</div>
          <p style={{ marginTop: 8, color: "#8a6b70" }}>
            Try toggling the category filter or status tabs above.
          </p>
        </div>
      )}
    </main>
  );
}