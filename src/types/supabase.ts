export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          description: string
          id: string
          requirement_type: string
          requirement_value: number
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          requirement_type: string
          requirement_value?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          requirement_type?: string
          requirement_value?: number
          title?: string
        }
        Relationships: []
      }
      daily_directives: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          current_value: number
          description: string
          directive_date: string
          id: string
          requirement_type: string
          reward_claimed: boolean
          reward_coins: number
          reward_stat: string | null
          reward_stat_amount: number
          reward_xp: number
          target_stat: string | null
          target_value: number
          template_id: string
          title: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_value?: number
          description: string
          directive_date: string
          id: string
          requirement_type: string
          reward_claimed?: boolean
          reward_coins?: number
          reward_stat?: string | null
          reward_stat_amount?: number
          reward_xp?: number
          target_stat?: string | null
          target_value?: number
          template_id: string
          title: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_value?: number
          description?: string
          directive_date?: string
          id?: string
          requirement_type?: string
          reward_claimed?: boolean
          reward_coins?: number
          reward_stat?: string | null
          reward_stat_amount?: number
          reward_xp?: number
          target_stat?: string | null
          target_value?: number
          template_id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      player_progress: {
        Row: {
          best_streak: number
          coins: number
          current_streak: number
          level: number
          rank: string
          total_xp: number
          user_id: string
        }
        Insert: {
          best_streak?: number
          coins?: number
          current_streak?: number
          level?: number
          rank?: string
          total_xp?: number
          user_id: string
        }
        Update: {
          best_streak?: number
          coins?: number
          current_streak?: number
          level?: number
          rank?: string
          total_xp?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_stats: {
        Row: {
          consistency: number
          discipline: number
          focus: number
          intelligence: number
          strength: number
          user_id: string
          vitality: number
        }
        Insert: {
          consistency?: number
          discipline?: number
          focus?: number
          intelligence?: number
          strength?: number
          user_id: string
          vitality?: number
        }
        Update: {
          consistency?: number
          discipline?: number
          focus?: number
          intelligence?: number
          strength?: number
          user_id?: string
          vitality?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          coins: number | null
          created_at: string
          discipline: number | null
          focus: number | null
          id: number
          intelligence: number | null
          level: number | null
          name: string | null
          rank: string | null
          streak: number | null
          strength: number | null
          vitality: number | null
          xp: number | null
        }
        Insert: {
          coins?: number | null
          created_at?: string
          discipline?: number | null
          focus?: number | null
          id?: number
          intelligence?: number | null
          level?: number | null
          name?: string | null
          rank?: string | null
          streak?: number | null
          strength?: number | null
          vitality?: number | null
          xp?: number | null
        }
        Update: {
          coins?: number | null
          created_at?: string
          discipline?: number | null
          focus?: number | null
          id?: number
          intelligence?: number | null
          level?: number | null
          name?: string | null
          rank?: string | null
          streak?: number | null
          strength?: number | null
          vitality?: number | null
          xp?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      quest_completions: {
        Row: {
          coins_earned: number
          completed_at: string
          id: string
          quest_id: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          coins_earned?: number
          completed_at?: string
          id?: string
          quest_id: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          coins_earned?: number
          completed_at?: string
          id?: string
          quest_id?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "quest_completions_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quest_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quests: {
        Row: {
          category: string
          coin_reward: number
          created_at: string
          description: string
          id: string
          is_active: boolean
          stat_amount: number
          stat_reward: string
          title: string
          user_id: string
          xp_reward: number
        }
        Insert: {
          category: string
          coin_reward?: number
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          stat_amount?: number
          stat_reward: string
          title: string
          user_id: string
          xp_reward?: number
        }
        Update: {
          category?: string
          coin_reward?: number
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          stat_amount?: number
          stat_reward?: string
          title?: string
          user_id?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "quests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          cost: number
          created_at: string
          description: string
          id: string
          is_active: boolean
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          cost?: number
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          cost?: number
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      streak_history: {
        Row: {
          created_at: string
          date: string
          day_completed: boolean
          id: string
          quests_completed: number
          quests_total: number
          streak_result: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          day_completed?: boolean
          id?: string
          quests_completed?: number
          quests_total?: number
          streak_result?: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          day_completed?: boolean
          id?: string
          quests_completed?: number
          quests_total?: number
          streak_result?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "streak_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rewards: {
        Row: {
          id: string
          purchased_at: string
          reward_id: string
          user_id: string
        }
        Insert: {
          id?: string
          purchased_at?: string
          reward_id: string
          user_id: string
        }
        Update: {
          id?: string
          purchased_at?: string
          reward_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_challenges: {
        Row: {
          id: string
          user_id: string
          month_start: string
          month_end: string
          template_id: string
          title: string
          description: string
          objectives: Json
          completed: boolean
          reward_claimed: boolean
          reward_xp: number
          reward_coins: number
          reward_item_id: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id: string
          user_id: string
          month_start: string
          month_end: string
          template_id: string
          title: string
          description: string
          objectives?: Json
          completed?: boolean
          reward_claimed?: boolean
          reward_xp?: number
          reward_coins?: number
          reward_item_id?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          month_start?: string
          month_end?: string
          template_id?: string
          title?: string
          description?: string
          objectives?: Json
          completed?: boolean
          reward_claimed?: boolean
          reward_xp?: number
          reward_coins?: number
          reward_item_id?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Relationships: []
      }
      player_seasons: {
        Row: {
          id: string
          user_id: string
          season_id: string
          season_xp: number
          season_level: number
          milestones_claimed: Json
          completed: boolean
          reward_claimed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          season_id: string
          season_xp?: number
          season_level?: number
          milestones_claimed?: Json
          completed?: boolean
          reward_claimed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          season_id?: string
          season_xp?: number
          season_level?: number
          milestones_claimed?: Json
          completed?: boolean
          reward_claimed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      player_records: {
        Row: {
          id: string
          user_id: string
          record_type: string
          record_value: number
          recorded_at: string
          metadata: Json
        }
        Insert: {
          id: string
          user_id: string
          record_type: string
          record_value?: number
          recorded_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string
          record_type?: string
          record_value?: number
          recorded_at?: string
          metadata?: Json
        }
        Relationships: []
      }
      weekly_challenges: {
        Row: {
          id: string
          user_id: string
          week_start: string
          week_end: string
          template_id: string
          title: string
          description: string
          objectives: Json
          current_progress: number
          completed: boolean
          reward_claimed: boolean
          reward_xp: number
          reward_coins: number
          reward_item_id: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id: string
          user_id: string
          week_start: string
          week_end: string
          template_id: string
          title: string
          description: string
          objectives?: Json
          current_progress?: number
          completed?: boolean
          reward_claimed?: boolean
          reward_xp?: number
          reward_coins?: number
          reward_item_id?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          week_start?: string
          week_end?: string
          template_id?: string
          title?: string
          description?: string
          objectives?: Json
          current_progress?: number
          completed?: boolean
          reward_claimed?: boolean
          reward_xp?: number
          reward_coins?: number
          reward_item_id?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
