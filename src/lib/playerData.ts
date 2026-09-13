import { supabase } from './supabase';
import type { Player } from '../types/game';
import { calculateLevel } from '../utils/levelSystem';

export async function seedDefaultPlayer(userId: string): Promise<void> {
  try {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (!existingProfile) {
      await supabase.from('profiles').insert({
        id: userId,
        name: 'Player',
        avatar_id: 'm_warrior_blade',
      });
    }

    const { data: existingStats } = await supabase
      .from('player_stats')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!existingStats) {
      await supabase.from('player_stats').insert({
        user_id: userId,
        strength: 10,
        intelligence: 10,
        vitality: 10,
        focus: 10,
        discipline: 10,
        consistency: 10,
      });
    }

    const { data: existingProgress } = await supabase
      .from('player_progress')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!existingProgress) {
      await supabase.from('player_progress').insert({
        user_id: userId,
        level: 1,
        total_xp: 0,
        coins: 50,
        current_streak: 0,
        best_streak: 0,
        rank: 'F',
      });
    }
  } catch (err) {
    console.warn('Failed to seed default player rows in Supabase:', err);
  }
}

export async function fetchPlayer(userId: string): Promise<Player | null> {
  // Read local cache first to prevent regression
  let cachedPlayer: Player | null = null;
  try {
    const raw = localStorage.getItem(`cached_player_${userId}`);
    if (raw) cachedPlayer = JSON.parse(raw);
  } catch {
    // ignore
  }

  let [{ data: profile }, { data: stats }, { data: progress }, { data: completions }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('player_stats').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('player_progress').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('quest_completions').select('xp_earned').eq('user_id', userId),
  ]);

  // If any required row is missing in Supabase, seed defaults and reload
  if (!profile || !stats || !progress) {
    await seedDefaultPlayer(userId);
    const [reloadedProfile, reloadedStats, reloadedProgress] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('player_stats').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('player_progress').select('*').eq('user_id', userId).maybeSingle(),
    ]);
    profile = reloadedProfile.data ?? profile;
    stats = reloadedStats.data ?? stats;
    progress = reloadedProgress.data ?? progress;
  }

  // If Supabase was unreachable and all rows are missing, try offline local cache
  if (!profile && !stats && !progress) {
    if (cachedPlayer) return cachedPlayer;
  }

  // Sum all XP from quest completions recorded for this player
  const completionsXP = (completions ?? []).reduce((sum, c) => sum + (c.xp_earned || 0), 0);

  // Authoritative totalXP: Maximum of DB progress, quest completions sum, and local cache
  // This guarantees earned XP (including Double XP) can NEVER drop or regress!
  const dbXP = progress?.total_xp ?? 0;
  const cachedXP = cachedPlayer?.progress?.totalXP ?? 0;
  const authoritativeXP = Math.max(dbXP, cachedXP, completionsXP);
  const authoritativeLevel = calculateLevel(authoritativeXP);

  // If authoritativeXP is higher than DB XP, sync DB forward
  if (authoritativeXP > dbXP) {
    void supabase
      .from('player_progress')
      .update({
        total_xp: authoritativeXP,
        level: authoritativeLevel,
      })
      .eq('user_id', userId);
  }

  // Authoritative values from Supabase take precedence; localStorage is fallback cache only
  const localAvatar = localStorage.getItem(`player_avatar_${userId}`);
  const localName = localStorage.getItem(`player_name_${userId}`);
  const avatarId =
    ((profile as Record<string, unknown> | null)?.avatar_id as string | undefined) ||
    localAvatar ||
    "m_warrior_blade";
  const name = profile?.name || localName || "Player";

  // Update local storage cache to match authoritative Supabase data
  try {
    localStorage.setItem(`player_name_${userId}`, name);
    localStorage.setItem(`player_avatar_${userId}`, avatarId);
  } catch {
    // safe fallback
  }

  const authoritativeBestStreak = Math.max(
    progress?.best_streak ?? 0,
    cachedPlayer?.progress?.bestStreak ?? 0
  );

  const playerObj: Player = {
    profile: {
      id: profile?.id ?? userId,
      name,
      avatarId,
      createdAt: profile?.created_at,
      updatedAt: profile?.updated_at,
    },
    stats: {
      strength: Math.max(stats?.strength ?? 10, cachedPlayer?.stats?.strength ?? 10),
      intelligence: Math.max(stats?.intelligence ?? 10, cachedPlayer?.stats?.intelligence ?? 10),
      vitality: Math.max(stats?.vitality ?? 10, cachedPlayer?.stats?.vitality ?? 10),
      focus: Math.max(stats?.focus ?? 10, cachedPlayer?.stats?.focus ?? 10),
      discipline: Math.max(stats?.discipline ?? 10, cachedPlayer?.stats?.discipline ?? 10),
      consistency: Math.max(stats?.consistency ?? 10, cachedPlayer?.stats?.consistency ?? 10),
    },
    progress: {
      level: authoritativeLevel,
      totalXP: authoritativeXP,
      coins: progress?.coins ?? cachedPlayer?.progress?.coins ?? 50,
      currentStreak: progress?.current_streak ?? 0,
      bestStreak: authoritativeBestStreak,
      rank: progress?.rank ?? cachedPlayer?.progress?.rank ?? 'F',
    },
  };

  // Cache latest valid player state
  try {
    localStorage.setItem(`cached_player_${userId}`, JSON.stringify(playerObj));
  } catch {
    // safe fallback
  }

  return playerObj;
}

export async function savePlayerProgress(userId: string, player: Player): Promise<boolean> {
  // Update local cache immediately with highest XP to prevent race conditions
  try {
    const existingCacheRaw = localStorage.getItem(`cached_player_${userId}`);
    const existingCache = existingCacheRaw ? JSON.parse(existingCacheRaw) : null;
    const safeTotalXP = Math.max(player.progress.totalXP, existingCache?.progress?.totalXP ?? 0);
    const safePlayer: Player = {
      ...player,
      progress: {
        ...player.progress,
        totalXP: safeTotalXP,
      },
    };
    localStorage.setItem(`cached_player_${userId}`, JSON.stringify(safePlayer));
  } catch {
    // safe fallback
  }

  let progressOk = true;
  try {
    // Use update first as it doesn't require an onConflict unique index in Postgres
    const { data: updatedRows, error: progressError } = await supabase
      .from('player_progress')
      .update({
        level: player.progress.level,
        total_xp: player.progress.totalXP,
        coins: player.progress.coins,
        current_streak: player.progress.currentStreak,
        best_streak: player.progress.bestStreak,
        rank: player.progress.rank,
      })
      .eq('user_id', userId)
      .select('id');

    if (progressError) {
      console.warn('Update player_progress error, trying upsert fallback:', progressError);
      const { error: upsertErr } = await supabase
        .from('player_progress')
        .upsert(
          {
            user_id: userId,
            level: player.progress.level,
            total_xp: player.progress.totalXP,
            coins: player.progress.coins,
            current_streak: player.progress.currentStreak,
            best_streak: player.progress.bestStreak,
            rank: player.progress.rank,
          },
          { onConflict: 'user_id' }
        );
      if (upsertErr) {
        console.error('Failed to save progress in Supabase:', upsertErr);
        progressOk = false;
      }
    } else if (!updatedRows || updatedRows.length === 0) {
      // If row did not exist yet, insert
      await supabase.from('player_progress').insert({
        user_id: userId,
        level: player.progress.level,
        total_xp: player.progress.totalXP,
        coins: player.progress.coins,
        current_streak: player.progress.currentStreak,
        best_streak: player.progress.bestStreak,
        rank: player.progress.rank,
      });
    }
  } catch (err) {
    console.warn('Network error saving progress to Supabase:', err);
    progressOk = false;
  }

  let statsOk = true;
  try {
    const { data: updatedStats, error: statsError } = await supabase
      .from('player_stats')
      .update({
        strength: player.stats.strength,
        intelligence: player.stats.intelligence,
        vitality: player.stats.vitality,
        focus: player.stats.focus,
        discipline: player.stats.discipline,
        consistency: player.stats.consistency,
      })
      .eq('user_id', userId)
      .select('id');

    if (statsError) {
      console.warn('Update player_stats error, trying upsert fallback:', statsError);
      const { error: upsertStatsErr } = await supabase
        .from('player_stats')
        .upsert(
          {
            user_id: userId,
            strength: player.stats.strength,
            intelligence: player.stats.intelligence,
            vitality: player.stats.vitality,
            focus: player.stats.focus,
            discipline: player.stats.discipline,
            consistency: player.stats.consistency,
          },
          { onConflict: 'user_id' }
        );
      if (upsertStatsErr) {
        console.error('Failed to save stats in Supabase:', upsertStatsErr);
        statsOk = false;
      }
    } else if (!updatedStats || updatedStats.length === 0) {
      await supabase.from('player_stats').insert({
        user_id: userId,
        strength: player.stats.strength,
        intelligence: player.stats.intelligence,
        vitality: player.stats.vitality,
        focus: player.stats.focus,
        discipline: player.stats.discipline,
        consistency: player.stats.consistency,
      });
    }
  } catch (err) {
    console.warn('Network error saving stats to Supabase:', err);
    statsOk = false;
  }

  return progressOk && statsOk;
}

export async function savePlayerAvatar(userId: string, avatarId: string) {
  localStorage.setItem(`player_avatar_${userId}`, avatarId);
  try {
    await supabase
      .from('profiles')
      .update({ avatar_id: avatarId })
      .eq('id', userId);
  } catch {
    // If Supabase table doesn't have avatar_id column yet, localStorage is the reliable local store
  }
}

export async function savePlayerName(userId: string, name: string) {
  localStorage.setItem(`player_name_${userId}`, name);
  try {
    await supabase
      .from('profiles')
      .update({ name })
      .eq('id', userId);
  } catch (err) {
    console.error('Failed to sync profile name to Supabase:', err);
  }
}