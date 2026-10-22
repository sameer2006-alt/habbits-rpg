const CHARGES_KEY_PREFIX = 'buff_double_xp_charges_';
const COIN_MAGNET_EXPIRY_PREFIX = 'buff_coin_magnet_until_';
const OWNED_REWARDS_PREFIX = 'owned_rewards_';
const STREAK_FREEZE_CHARGES_PREFIX = 'buff_streak_freeze_charges_';
const STREAK_FREEZE_LAST_PROTECTED_DATE_PREFIX = 'buff_streak_freeze_last_date_';

const memoryStore = new Map<string, string>();
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
    } catch {
      // ignore
    }
    return memoryStore.get(key) ?? null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
        return;
      }
    } catch {
      // ignore
    }
    memoryStore.set(key, value);
  },
  removeItem: (key: string): void => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
        return;
      }
    } catch {
      // ignore
    }
    memoryStore.delete(key);
  },
};

export function getActiveDoubleXpCharges(userId: string): number {
  if (!userId) return 0;
  const chargesKey = `${CHARGES_KEY_PREFIX}${userId}`;
  const rawCharges = safeStorage.getItem(chargesKey);

  if (rawCharges !== null) {
    const parsed = parseInt(rawCharges, 10);
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  }

  // Fallback: If user previously bought 'potion_xp' and it is in owned_rewards
  // but charges were not tracked yet, grant the 3 initial charges!
  try {
    const ownedRaw = safeStorage.getItem(`${OWNED_REWARDS_PREFIX}${userId}`);
    const owned: string[] = ownedRaw ? JSON.parse(ownedRaw) : [];
    if (owned.includes('potion_xp')) {
      safeStorage.setItem(chargesKey, '3');
      return 3;
    }
  } catch {
    // ignore
  }

  return 0;
}

export function addDoubleXpCharges(userId: string, count: number = 3): number {
  if (!userId) return 0;
  const current = getActiveDoubleXpCharges(userId);
  const updated = current + count;
  safeStorage.setItem(`${CHARGES_KEY_PREFIX}${userId}`, String(updated));

  // Ensure potion_xp is marked in owned_rewards while charges exist
  try {
    const ownedKey = `${OWNED_REWARDS_PREFIX}${userId}`;
    const ownedRaw = safeStorage.getItem(ownedKey);
    const owned: string[] = ownedRaw ? JSON.parse(ownedRaw) : [];
    if (!owned.includes('potion_xp')) {
      owned.push('potion_xp');
      safeStorage.setItem(ownedKey, JSON.stringify(owned));
    }
  } catch {
    // ignore
  }

  return updated;
}

export function consumeDoubleXpCharge(userId: string): { remainingCharges: number; wasBuffApplied: boolean } {
  if (!userId) {
    return { remainingCharges: 0, wasBuffApplied: false };
  }

  const current = getActiveDoubleXpCharges(userId);
  if (current <= 0) {
    return { remainingCharges: 0, wasBuffApplied: false };
  }

  const remainingCharges = current - 1;
  const chargesKey = `${CHARGES_KEY_PREFIX}${userId}`;
  const ownedKey = `${OWNED_REWARDS_PREFIX}${userId}`;

  safeStorage.setItem(chargesKey, String(remainingCharges));

  // If charges reached 0, remove potion_xp from owned_rewards so it can be re-purchased in shop!
  if (remainingCharges === 0) {
    try {
      const ownedRaw = safeStorage.getItem(ownedKey);
      const owned: string[] = ownedRaw ? JSON.parse(ownedRaw) : [];
      const filtered = owned.filter((id) => id !== 'potion_xp');
      safeStorage.setItem(ownedKey, JSON.stringify(filtered));
    } catch {
      // ignore
    }
  }

  return { remainingCharges, wasBuffApplied: true };
}

export function isCoinMagnetActive(userId: string): boolean {
  if (!userId) return false;
  const key = `${COIN_MAGNET_EXPIRY_PREFIX}${userId}`;
  const rawExpiry = safeStorage.getItem(key);

  if (!rawExpiry) {
    // Fallback: check if coin_magnet is in owned_rewards
    try {
      const ownedRaw = safeStorage.getItem(`${OWNED_REWARDS_PREFIX}${userId}`);
      const owned: string[] = ownedRaw ? JSON.parse(ownedRaw) : [];
      if (owned.includes('coin_magnet')) {
        const expiry = Date.now() + 24 * 60 * 60 * 1000;
        safeStorage.setItem(key, String(expiry));
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }

  const expiry = parseInt(rawExpiry, 10);
  if (isNaN(expiry) || Date.now() > expiry) {
    safeStorage.removeItem(key);
    try {
      const ownedKey = `${OWNED_REWARDS_PREFIX}${userId}`;
      const ownedRaw = safeStorage.getItem(ownedKey);
      const owned: string[] = ownedRaw ? JSON.parse(ownedRaw) : [];
      const filtered = owned.filter((id) => id !== 'coin_magnet');
      safeStorage.setItem(ownedKey, JSON.stringify(filtered));
    } catch {
      // ignore
    }
    return false;
  }

  return true;
}

export function activateCoinMagnet(userId: string, hours: number = 24): void {
  if (!userId) return;
  const key = `${COIN_MAGNET_EXPIRY_PREFIX}${userId}`;
  const expiry = Date.now() + hours * 60 * 60 * 1000;
  safeStorage.setItem(key, String(expiry));

  try {
    const ownedKey = `${OWNED_REWARDS_PREFIX}${userId}`;
    const ownedRaw = safeStorage.getItem(ownedKey);
    const owned: string[] = ownedRaw ? JSON.parse(ownedRaw) : [];
    if (!owned.includes('coin_magnet')) {
      owned.push('coin_magnet');
      safeStorage.setItem(ownedKey, JSON.stringify(owned));
    }
  } catch {
    // ignore
  }
}

export function isPassiveGearOwned(userId: string, gearId: string): boolean {
  if (!userId) return false;
  try {
    const ownedKey = `${OWNED_REWARDS_PREFIX}${userId}`;
    const ownedRaw = safeStorage.getItem(ownedKey);
    const owned: string[] = ownedRaw ? JSON.parse(ownedRaw) : [];
    return owned.includes(gearId);
  } catch {
    return false;
  }
}

export function getActiveStreakFreezeCharges(userId: string): number {
  if (!userId) return 0;
  const chargesKey = `${STREAK_FREEZE_CHARGES_PREFIX}${userId}`;
  const rawCharges = safeStorage.getItem(chargesKey);

  if (rawCharges !== null) {
    const parsed = parseInt(rawCharges, 10);
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  }

  // Fallback: If user previously bought 'streak_freeze' and it is in owned_rewards
  // but charges were not tracked yet, grant 1 initial charge
  try {
    const ownedRaw = safeStorage.getItem(`${OWNED_REWARDS_PREFIX}${userId}`);
    const owned: string[] = ownedRaw ? JSON.parse(ownedRaw) : [];
    if (owned.includes('streak_freeze')) {
      safeStorage.setItem(chargesKey, '1');
      return 1;
    }
  } catch {
    // ignore
  }

  return 0;
}

export function addStreakFreezeCharges(userId: string, count: number = 1): number {
  if (!userId) return 0;
  const current = getActiveStreakFreezeCharges(userId);
  const updated = current + count;
  safeStorage.setItem(`${STREAK_FREEZE_CHARGES_PREFIX}${userId}`, String(updated));

  // Ensure streak_freeze is marked in owned_rewards while charges exist
  try {
    const ownedKey = `${OWNED_REWARDS_PREFIX}${userId}`;
    const ownedRaw = safeStorage.getItem(ownedKey);
    const owned: string[] = ownedRaw ? JSON.parse(ownedRaw) : [];
    if (!owned.includes('streak_freeze')) {
      owned.push('streak_freeze');
      safeStorage.setItem(ownedKey, JSON.stringify(owned));
    }
  } catch {
    // ignore
  }

  return updated;
}

export function consumeStreakFreezeCharge(
  userId: string,
  dateStr: string
): { consumed: boolean; alreadyProtectedToday: boolean; remainingCharges: number } {
  if (!userId) {
    return { consumed: false, alreadyProtectedToday: false, remainingCharges: 0 };
  }

  const lastDateKey = `${STREAK_FREEZE_LAST_PROTECTED_DATE_PREFIX}${userId}`;
  const lastProtectedDate = safeStorage.getItem(lastDateKey);

  // Idempotency check: If endDay is retried on the same date, do NOT consume another charge!
  if (lastProtectedDate === dateStr) {
    return {
      consumed: false,
      alreadyProtectedToday: true,
      remainingCharges: getActiveStreakFreezeCharges(userId),
    };
  }

  const currentCharges = getActiveStreakFreezeCharges(userId);
  if (currentCharges <= 0) {
    return { consumed: false, alreadyProtectedToday: false, remainingCharges: 0 };
  }

  const remainingCharges = currentCharges - 1;
  safeStorage.setItem(`${STREAK_FREEZE_CHARGES_PREFIX}${userId}`, String(remainingCharges));
  safeStorage.setItem(lastDateKey, dateStr);

  // If charges reached 0, remove streak_freeze from owned_rewards so it can be re-purchased in the shop!
  if (remainingCharges === 0) {
    try {
      const ownedKey = `${OWNED_REWARDS_PREFIX}${userId}`;
      const ownedRaw = safeStorage.getItem(ownedKey);
      const owned: string[] = ownedRaw ? JSON.parse(ownedRaw) : [];
      const filtered = owned.filter((id) => id !== 'streak_freeze');
      safeStorage.setItem(ownedKey, JSON.stringify(filtered));
    } catch {
      // ignore
    }
  }

  return { consumed: true, alreadyProtectedToday: false, remainingCharges };
}

export function isStreakFreezeProtectedToday(userId: string, dateStr: string): boolean {
  if (!userId) return false;
  return safeStorage.getItem(`${STREAK_FREEZE_LAST_PROTECTED_DATE_PREFIX}${userId}`) === dateStr;
}

