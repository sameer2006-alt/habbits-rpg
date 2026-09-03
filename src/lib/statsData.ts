import { supabase } from './supabase';

export interface CompletionRecord {
  id: string;
  questTitle: string;
  completedAt: string;
  xpEarned: number;
  coinsEarned: number;
}

export interface StatsSummary {
  totalCompletions: number;
  totalXPEarned: number;
  totalCoinsEarned: number;
  completionsLast7Days: { date: string; count: number }[];
  recent: CompletionRecord[];
}

export async function fetchStats(userId: string): Promise<StatsSummary> {
  const { data, error } = await supabase
    .from('quest_completions')
    .select('id, completed_at, xp_earned, coins_earned, quests(title)')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (error || !data) {
    console.error('Failed to fetch stats:', error);
    return { totalCompletions: 0, totalXPEarned: 0, totalCoinsEarned: 0, completionsLast7Days: [], recent: [] };
  }

  const totalCompletions = data.length;
  const totalXPEarned = data.reduce((sum, r) => sum + r.xp_earned, 0);
  const totalCoinsEarned = data.reduce((sum, r) => sum + r.coins_earned, 0);

  const days: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const count = data.filter((r) => r.completed_at.slice(0, 10) === dateStr).length;
    days.push({ date: dateStr, count });
  }

  const recent: CompletionRecord[] = data.slice(0, 20).map((r: any) => ({
    id: r.id,
    questTitle: r.quests?.title ?? 'Unknown Quest',
    completedAt: r.completed_at,
    xpEarned: r.xp_earned,
    coinsEarned: r.coins_earned,
  }));

  return { totalCompletions, totalXPEarned, totalCoinsEarned, completionsLast7Days: days, recent };
}