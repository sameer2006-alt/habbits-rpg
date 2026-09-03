import { useState } from "react";
import type { RewardItem } from "../lib/rewardsData";

interface ShopProps {
  rewards: RewardItem[];
  coins: number;
  onPurchase: (rewardId: string, cost: number) => void;
  onAddReward: (reward: { title: string; description: string; cost: number; type: string }) => void;
}

export default function Shop({ rewards, coins, onPurchase, onAddReward }: ShopProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState(50);
  const [type, setType] = useState("treat");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddReward({ title: title.trim(), description: description.trim(), cost, type });
    setTitle("");
    setDescription("");
    setCost(50);
    setShowForm(false);
  };

  return (
    <main>
      <h1>Reward Shop</h1>
      <p>COINS: {coins} 🪙</p>

      {rewards.map((reward) => (
        <div key={reward.id} style={{ border: "1px solid #444", padding: "8px", margin: "8px 0" }}>
          <h3>{reward.title}</h3>
          <p>{reward.description}</p>
          <p>Cost: {reward.cost} coins</p>
          {reward.owned ? (
            <p>Owned ✅</p>
          ) : (
            <button disabled={coins < reward.cost} onClick={() => onPurchase(reward.id, reward.cost)}>
              {coins < reward.cost ? "Not enough coins" : "Redeem"}
            </button>
          )}
        </div>
      ))}

      {showForm ? (
        <form onSubmit={handleSubmit} style={{ border: "1px solid #444", padding: "12px" }}>
          <h3>New Reward</h3>
          <input type="text" placeholder="Reward title (e.g. Movie night)" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input type="text" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <label>Cost: </label>
          <input type="number" min={0} value={cost} onChange={(e) => setCost(Number(e.target.value))} />
          <label>Type: </label>
          <input type="text" value={type} onChange={(e) => setType(e.target.value)} />
          <button type="submit">Create Reward</button>{" "}
          <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
        </form>
      ) : (
        <button onClick={() => setShowForm(true)}>+ New Reward</button>
      )}
    </main>
  );
}