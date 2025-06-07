export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          account_ending_date: string | null
          account_starting_date: string | null
          account_type: Database["public"]["Enums"]["account_type"]
          created_at: string | null
          details: string | null
          email: string
          expires_at: string | null
          id: string
          name: string
          service_id: string | null
          thumbnail_url: string | null
          user_full_name: string | null
          user_phone_number: string | null
        }
        Insert: {
          account_ending_date?: string | null
          account_starting_date?: string | null
          account_type?: Database["public"]["Enums"]["account_type"]
          created_at?: string | null
          details?: string | null
          email: string
          expires_at?: string | null
          id?: string
          name: string
          service_id?: string | null
          thumbnail_url?: string | null
          user_full_name?: string | null
          user_phone_number?: string | null
        }
        Update: {
          account_ending_date?: string | null
          account_starting_date?: string | null
          account_type?: Database["public"]["Enums"]["account_type"]
          created_at?: string | null
          details?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          name?: string
          service_id?: string | null
          thumbnail_url?: string | null
          user_full_name?: string | null
          user_phone_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string | null
          id: string
          name: string
          thumbnail_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          thumbnail_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          account_id: string | null
          created_at: string | null
          description: string | null
          ending_date: string
          full_name: string
          id: string
          phone_number: string | null
          starting_date: string
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          description?: string | null
          ending_date: string
          full_name: string
          id?: string
          phone_number?: string | null
          starting_date: string
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          description?: string | null
          ending_date?: string
          full_name?: string
          id?: string
          phone_number?: string | null
          starting_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_expired_accounts: {
        Args: Record<PropertyKey, never>
        Returns: {
          account_id: string
          account_name: string
          service_name: string
          expires_at: string
          account_type: string
          user_count: number
          days_expired: number
        }[]
      }
      get_service_subscription_stats: {
        Args: { service_id: string }
        Returns: {
          account_id: string
          account_name: string
          total_users: number
          active_users: number
          expired_users: number
          expiring_soon_users: number
        }[]
      }
      renew_account_subscriptions: {
        Args: {
          account_id: string
          new_starting_date: string
          new_ending_date: string
        }
        Returns: {
          account_id: string | null
          created_at: string | null
          description: string | null
          ending_date: string
          full_name: string
          id: string
          phone_number: string | null
          starting_date: string
        }[]
      }
    }
    Enums: {
      account_type: "personal" | "shared"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_type: ["personal", "shared"],
    },
  },
} as const
