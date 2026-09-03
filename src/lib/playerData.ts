import { supabase } from './supabase';
import type { Player } from '../types/game';

export async function fetchPlayer(userId: string): Promise<Player | null> {
  const [{ data: profile }, { data: stats }, { data: progress }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('player_stats').select('*').eq('user_id', userId).single(),
    supabase.from('player_progress').select('*').eq('user_id', userId).single(),
  ]);

  if (!profile || !stats || !progress) return null;

  return {
    profile: {
      id: profile.id,
      name: profile.name,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    },
    stats: {
      strength: stats.strength,
      intelligence: stats.intelligence,
      vitality: stats.vitality,
      focus: stats.focus,
      discipline: stats.discipline,
      consistency: stats.consistency,
    },
    progress: {
      level: progress.level,
      totalXP: progress.total_xp,
      coins: progress.coins,
      currentStreak: progress.current_streak,
      bestStreak: progress.best_streak,
      rank: progress.rank,
    },
  };
}

export async function savePlayerProgress(userId: string, player: Player) {
  const { error: progressError } = await supabase
    .from('player_progress')
    .update({
      level: player.progress.level,
      total_xp: player.progress.totalXP,
      coins: player.progress.coins,
      current_streak: player.progress.currentStreak,
      best_streak: player.progress.bestStreak,
      rank: player.progress.rank,
    })
    .eq('user_id', userId);

  if (progressError) console.error('Failed to save progress:', progressError);

  const { error: statsError } = await supabase
    .from('player_stats')
    .update({
      strength: player.stats.strength,
      intelligence: player.stats.intelligence,
      vitality: player.stats.vitality,
      focus: player.stats.focus,
      discipline: player.stats.discipline,
      consistency: player.stats.consistency,
    })
    .eq('user_id', userId);

  if (statsError) console.error('Failed to save stats:', statsError);
}