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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      availability_overrides: {
        Row: {
          created_at: string
          end_time: string | null
          id: string
          override_date: string
          start_time: string | null
          type: Database["public"]["Enums"]["override_type"]
          worker_profile_id: string
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          id?: string
          override_date: string
          start_time?: string | null
          type: Database["public"]["Enums"]["override_type"]
          worker_profile_id: string
        }
        Update: {
          created_at?: string
          end_time?: string | null
          id?: string
          override_date?: string
          start_time?: string | null
          type?: Database["public"]["Enums"]["override_type"]
          worker_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_overrides_worker_profile_id_fkey"
            columns: ["worker_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_rules: {
        Row: {
          created_at: string
          days_of_week: number[]
          end_date: string
          end_time: string
          id: string
          start_date: string
          start_time: string
          worker_profile_id: string
        }
        Insert: {
          created_at?: string
          days_of_week: number[]
          end_date: string
          end_time: string
          id?: string
          start_date: string
          start_time: string
          worker_profile_id: string
        }
        Update: {
          created_at?: string
          days_of_week?: number[]
          end_date?: string
          end_time?: string
          id?: string
          start_date?: string
          start_time?: string
          worker_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_rules_worker_profile_id_fkey"
            columns: ["worker_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          additional_charges: number | null
          created_at: string
          customer_id: string
          duration_at_booking: number
          end_time: string
          id: string
          notes_from_customer: string | null
          notes_from_worker: string | null
          price_at_booking: number
          service_id: string
          shop_id: string | null
          staff_id: string | null
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          worker_profile_id: string
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          additional_charges?: number | null
          created_at?: string
          customer_id: string
          duration_at_booking: number
          end_time: string
          id?: string
          notes_from_customer?: string | null
          notes_from_worker?: string | null
          price_at_booking: number
          service_id: string
          shop_id?: string | null
          staff_id?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          worker_profile_id: string
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          additional_charges?: number | null
          created_at?: string
          customer_id?: string
          duration_at_booking?: number
          end_time?: string
          id?: string
          notes_from_customer?: string | null
          notes_from_worker?: string | null
          price_at_booking?: number
          service_id?: string
          shop_id?: string | null
          staff_id?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          worker_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_worker_profile_id_fkey"
            columns: ["worker_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_logs: {
        Row: {
          created_at: string
          description: string | null
          id: number
          points_change: number
          reason_code: string
          related_booking_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          points_change: number
          reason_code: string
          related_booking_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          points_change?: number
          reason_code?: string
          related_booking_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_logs_related_booking_id_fkey"
            columns: ["related_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_access_logs: {
        Row: {
          access_type: string
          created_at: string
          customer_id: string
          id: number
          target_id: string | null
        }
        Insert: {
          access_type: string
          created_at?: string
          customer_id: string
          id?: number
          target_id?: string | null
        }
        Update: {
          access_type?: string
          created_at?: string
          customer_id?: string
          id?: number
          target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_access_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_workers: {
        Row: {
          created_at: string
          user_id: string
          worker_profile_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
          worker_profile_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
          worker_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_workers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_workers_worker_profile_id_fkey"
            columns: ["worker_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          contribution_score: number
          created_at: string
          daily_points_cache: number
          email: string | null
          feature: string[] | null
          full_name: string | null
          id: string
          is_active: boolean | null
          last_point_gain_at: string | null
          level: number
          monthly_cancellation_count: number
          nickname: string | null
          photo_urls: string[] | null
          profiles: string | null
          referral_code: string | null
          role: string | null
          social_links: Json | null
          tags: string[] | null
          video_urls: string[] | null
          years: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          contribution_score?: number
          created_at?: string
          daily_points_cache?: number
          email?: string | null
          feature?: string[] | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_point_gain_at?: string | null
          level?: number
          monthly_cancellation_count?: number
          nickname?: string | null
          photo_urls?: string[] | null
          profiles?: string | null
          referral_code?: string | null
          role?: string | null
          social_links?: Json | null
          tags?: string[] | null
          video_urls?: string[] | null
          years?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          contribution_score?: number
          created_at?: string
          daily_points_cache?: number
          email?: string | null
          feature?: string[] | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_point_gain_at?: string | null
          level?: number
          monthly_cancellation_count?: number
          nickname?: string | null
          photo_urls?: string[] | null
          profiles?: string | null
          referral_code?: string | null
          role?: string | null
          social_links?: Json | null
          tags?: string[] | null
          video_urls?: string[] | null
          years?: number | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referee_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          referee_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          referee_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referee_id_fkey"
            columns: ["referee_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          appointment_id: string | null
          comment: string | null
          created_at: string
          id: string
          rating: number | null
          shop_id: string | null
          staff_id: string | null
          user_id: string | null
        }
        Insert: {
          appointment_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          shop_id?: string | null
          staff_id?: string | null
          user_id?: string | null
        }
        Update: {
          appointment_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          shop_id?: string | null
          staff_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          cancellation_reason: string | null
          created_at: string
          end_time: string | null
          id: string
          notes: string | null
          payment_status: string | null
          service_id: string | null
          shop_id: string | null
          start_time: string | null
          status: string | null
          total_price: number | null
          user_id: string | null
          worker_profile_id: string
        }
        Insert: {
          cancellation_reason?: string | null
          created_at?: string
          end_time?: string | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          service_id?: string | null
          shop_id?: string | null
          start_time?: string | null
          status?: string | null
          total_price?: number | null
          user_id?: string | null
          worker_profile_id: string
        }
        Update: {
          cancellation_reason?: string | null
          created_at?: string
          end_time?: string | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          service_id?: string | null
          shop_id?: string | null
          start_time?: string | null
          status?: string | null
          total_price?: number | null
          user_id?: string | null
          worker_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_worker_profile_id_fkey"
            columns: ["worker_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories_L1: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      service_categories_L2: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string | null
          shop_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string | null
          shop_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string | null
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_L2_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category_L2_id: string | null
          created_at: string | null
          description: string | null
          duration_unit: string | null
          duration_value: number | null
          id: string
          name: string | null
          owner_id: string | null
          price: number | null
          shop_id: string | null
          type: string | null
        }
        Insert: {
          category_L2_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_unit?: string | null
          duration_value?: number | null
          id?: string
          name?: string | null
          owner_id?: string | null
          price?: number | null
          shop_id?: string | null
          type?: string | null
        }
        Update: {
          category_L2_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_unit?: string | null
          duration_value?: number | null
          id?: string
          name?: string | null
          owner_id?: string | null
          price?: number | null
          shop_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_pages: {
        Row: {
          bg_image_url: string | null
          cover_image_url: string | null
          facebook_url: string | null
          featured_service_ids: string[] | null
          featured_video_url: string | null
          hero_image_url: string | null
          instagram_url: string | null
          line_id: string | null
          promotional_text: string | null
          shop_id: string
          show_reviews_section: boolean | null
          show_staff_section: boolean | null
          telegram_id: string | null
          theme_color: string | null
          tiktok_url: string | null
          updated_at: string
          wechat_id: string | null
          welcome_title: string | null
          whatsapp_id: string | null
        }
        Insert: {
          bg_image_url?: string | null
          cover_image_url?: string | null
          facebook_url?: string | null
          featured_service_ids?: string[] | null
          featured_video_url?: string | null
          hero_image_url?: string | null
          instagram_url?: string | null
          line_id?: string | null
          promotional_text?: string | null
          shop_id: string
          show_reviews_section?: boolean | null
          show_staff_section?: boolean | null
          telegram_id?: string | null
          theme_color?: string | null
          tiktok_url?: string | null
          updated_at?: string
          wechat_id?: string | null
          welcome_title?: string | null
          whatsapp_id?: string | null
        }
        Update: {
          bg_image_url?: string | null
          cover_image_url?: string | null
          facebook_url?: string | null
          featured_service_ids?: string[] | null
          featured_video_url?: string | null
          hero_image_url?: string | null
          instagram_url?: string | null
          line_id?: string | null
          promotional_text?: string | null
          shop_id?: string
          show_reviews_section?: boolean | null
          show_staff_section?: boolean | null
          telegram_id?: string | null
          theme_color?: string | null
          tiktok_url?: string | null
          updated_at?: string
          wechat_id?: string | null
          welcome_title?: string | null
          whatsapp_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_pages_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: true
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_themes: {
        Row: {
          background_color: string | null
          border_radius: string | null
          created_at: string
          font_family: string | null
          primary_color: string | null
          secondary_color: string | null
          shop_id: string
          text_color: string | null
        }
        Insert: {
          background_color?: string | null
          border_radius?: string | null
          created_at?: string
          font_family?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          shop_id: string
          text_color?: string | null
        }
        Update: {
          background_color?: string | null
          border_radius?: string | null
          created_at?: string
          font_family?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          shop_id?: string
          text_color?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_themes_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: true
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          address: string | null
          badges: string[] | null
          category_L1_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string | null
          owner_id: string | null
          phone_number: string | null
          slug: string | null
          social_links: Json | null
          tags: string[] | null
        }
        Insert: {
          address?: string | null
          badges?: string[] | null
          category_L1_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          owner_id?: string | null
          phone_number?: string | null
          slug?: string | null
          social_links?: Json | null
          tags?: string[] | null
        }
        Update: {
          address?: string | null
          badges?: string[] | null
          category_L1_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          owner_id?: string | null
          phone_number?: string | null
          slug?: string | null
          social_links?: Json | null
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "shops_category_L1_id_fkey"
            columns: ["category_L1_id"]
            isOneToOne: false
            referencedRelation: "service_categories_L1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shops_owner_id_fkey1"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          shop_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          shop_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          shop_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_contribution_points: {
        Args: {
          booking_ref_id?: string
          details?: string
          points_to_add: number
          reason: string
          target_user_id: string
        }
        Returns: undefined
      }
      check_booking_conflict: {
        Args: { end_t: string; start_t: string; worker_id: string }
        Returns: boolean
      }
      check_bookings_in_rule: {
        Args: { rule_id: string }
        Returns: number
      }
      increment_monthly_cancellation_count: {
        Args: { user_id_to_update: string }
        Returns: undefined
      }
      is_shop_owner: {
        Args:
          | { shop_id_to_check: string }
          | { shop_id_to_check: string; user_id_to_check: string }
        Returns: boolean
      }
      reset_all_cancellation_counts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      booking_status:
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled_by_customer"
        | "cancelled_by_worker"
        | "no_show"
      override_type: "unavailable" | "available"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      booking_status: [
        "confirmed",
        "in_progress",
        "completed",
        "cancelled_by_customer",
        "cancelled_by_worker",
        "no_show",
      ],
      override_type: ["unavailable", "available"],
    },
  },
} as const
