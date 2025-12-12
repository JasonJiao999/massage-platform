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
      chat_rooms: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          worker_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cities_admin: {
        Row: {
          id: number
          location_id: number
          name: string
          sort_order: number | null
        }
        Insert: {
          id?: number
          location_id: number
          name: string
          sort_order?: number | null
        }
        Update: {
          id?: number
          location_id?: number
          name?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cities_admin_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
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
      img_admin: {
        Row: {
          asset_type: Database["public"]["Enums"]["asset_type"]
          created_at: string
          id: string
          is_active: boolean
          name: string | null
          url: string
        }
        Insert: {
          asset_type: Database["public"]["Enums"]["asset_type"]
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string | null
          url: string
        }
        Update: {
          asset_type?: Database["public"]["Enums"]["asset_type"]
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string | null
          url?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          id: number
          level: number
          name_en: string
          parent_id: number | null
          postcode: string | null
        }
        Insert: {
          id?: number
          level: number
          name_en: string
          parent_id?: number | null
          postcode?: string | null
        }
        Update: {
          id?: number
          level?: number
          name_en?: string
          parent_id?: number | null
          postcode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations_admin: {
        Row: {
          id: number
          location_id: number | null
          name: string
          sort_order: number | null
        }
        Insert: {
          id?: number
          location_id?: number | null
          name: string
          sort_order?: number | null
        }
        Update: {
          id?: number
          location_id?: number | null
          name?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_admin_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_room_id: string
          content: string
          created_at: string
          id: number
          sender_id: string
        }
        Insert: {
          chat_room_id: string
          content: string
          created_at?: string
          id?: number
          sender_id: string
        }
        Update: {
          chat_room_id?: string
          content?: string
          created_at?: string
          id?: number
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          acc_active: boolean
          address_detail: string | null
          bio: string | null
          created_at: string
          district_id: number | null
          email: string | null
          feature: string[] | null
          full_name: string | null
          gender: Database["public"]["Enums"]["gender_enum"] | null
          id: string
          is_active: boolean | null
          last_point_gain_at: string | null
          level: number
          monthly_cancellation_count: number
          nationality:
            | Database["public"]["Enums"]["nationality_region_enum"]
            | null
          nickname: string | null
          photo_urls: string[] | null
          cover_image_url: string | null
          points: number
          province_id: number | null
          qr_url: string | null
          referral_code: string | null
          referred_by: string | null
          role: string | null
          social_links: Json | null
          sub_district_id: number | null
          tags: string[] | null
          tel: string | null
          video_urls: string[] | null
          years: number | null
        }
        Insert: {
          acc_active?: boolean
          address_detail?: string | null
          bio?: string | null
          created_at?: string
          district_id?: number | null
          email?: string | null
          feature?: string[] | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_enum"] | null
          id: string
          is_active?: boolean | null
          last_point_gain_at?: string | null
          level?: number
          monthly_cancellation_count?: number
          nationality?:
            | Database["public"]["Enums"]["nationality_region_enum"]
            | null
          nickname?: string | null
          photo_urls?: string[] | null
          cover_image_url?: string | null
          points?: number
          province_id?: number | null
          qr_url?: string | null
          referral_code?: string | null
          referred_by?: string | null
          role?: string | null
          social_links?: Json | null
          sub_district_id?: number | null
          tags?: string[] | null
          tel?: string | null
          video_urls?: string[] | null
          years?: number | null
        }
        Update: {
          acc_active?: boolean
          address_detail?: string | null
          bio?: string | null
          created_at?: string
          district_id?: number | null
          email?: string | null
          feature?: string[] | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_enum"] | null
          id?: string
          is_active?: boolean | null
          last_point_gain_at?: string | null
          level?: number
          monthly_cancellation_count?: number
          nationality?:
            | Database["public"]["Enums"]["nationality_region_enum"]
            | null
          nickname?: string | null
          photo_urls?: string[] | null
          cover_image_url?: string | null
          points?: number
          province_id?: number | null
          qr_url?: string | null
          referral_code?: string | null
          referred_by?: string | null
          role?: string | null
          social_links?: Json | null
          sub_district_id?: number | null
          tags?: string[] | null
          tel?: string | null
          video_urls?: string[] | null
          years?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_sub_district_id_fkey"
            columns: ["sub_district_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
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
          address_detail: string | null
          badges: string[] | null
          category_L1_id: string | null
          created_at: string
          description: string | null
          district_id: number | null
          id: string
          is_active: boolean | null
          name: string | null
          owner_id: string | null
          phone_number: string | null
          province_id: number | null
          slug: string | null
          social_links: Json | null
          sub_district_id: number | null
          tags: string[] | null
        }
        Insert: {
          address_detail?: string | null
          badges?: string[] | null
          category_L1_id?: string | null
          created_at?: string
          description?: string | null
          district_id?: number | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          owner_id?: string | null
          phone_number?: string | null
          province_id?: number | null
          slug?: string | null
          social_links?: Json | null
          sub_district_id?: number | null
          tags?: string[] | null
        }
        Update: {
          address_detail?: string | null
          badges?: string[] | null
          category_L1_id?: string | null
          created_at?: string
          description?: string | null
          district_id?: number | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          owner_id?: string | null
          phone_number?: string | null
          province_id?: number | null
          slug?: string | null
          social_links?: Json | null
          sub_district_id?: number | null
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
            foreignKeyName: "shops_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shops_owner_id_fkey1"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shops_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shops_sub_district_id_fkey"
            columns: ["sub_district_id"]
            isOneToOne: false
            referencedRelation: "locations"
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
      tags_admin: {
        Row: {
          id: number
          name: string
          sort_order: number | null
        }
        Insert: {
          id?: number
          name: string
          sort_order?: number | null
        }
        Update: {
          id?: number
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_contribution_point: {
        Args: {
          booking_ref_id: number
          details: string
          points_to_add: number
          reason: string
          target_user_id: string
        }
        Returns: undefined
      }
      add_points_and_level_up: {
        Args: { points_to_add: number; user_id: string }
        Returns: undefined
      }
      check_booking_conflict: {
        Args: { end_t: string; start_t: string; worker_id: string }
        Returns: boolean
      }
      check_bookings_in_rule: { Args: { rule_id: string }; Returns: number }
      delete_old_chat_rooms: { Args: never; Returns: undefined }
      generate_referral_code: { Args: never; Returns: string }
      get_dashboard_stats: {
        Args: { p_worker_profile_id: string }
        Returns: {
          cancelled_by_customer_count: number
          completed_bookings_count: number
          this_month_revenue: number
          today_bookings_count: number
          today_revenue: number
          tomorrow_bookings_count: number
        }[]
      }
      get_merchant_dashboard_stats: {
        Args: { p_owner_id: string }
        Returns: {
          team_member_count: number
          this_month_cancelled_bookings: number
          this_month_completed_bookings: number
          this_month_team_revenue: number
          today_team_bookings_count: number
          today_team_revenue: number
          tomorrow_team_bookings_count: number
        }[]
      }
      get_popular_tags: {
        Args: { limit_count: number }
        Returns: {
          count: number
          tag: string
        }[]
      }
      increment_monthly_cancellation_count: {
        Args: { user_id_to_update: string }
        Returns: undefined
      }
      is_shop_owner: {
        Args: { shop_id_to_check: string; user_id_to_check: string }
        Returns: boolean
      }
      reset_all_cancellation_counts: { Args: never; Returns: undefined }
      search_workers: {
        Args: {
          area_filter_id?: number
          city_filter_id?: number
          page_num?: number
          page_size?: number
          search_term?: string
        }
        Returns: {
          address_detail: string
          avatar_url: string
          bio: string
          created_at: string
          district_id: number
          district_name: string
          feature: string[]
          id: string
          is_active: boolean
          level: number
          nickname: string
          photo_urls: string[]
          cover_image_url: string
          province_id: number
          province_name: string
          social_links: Json
          sub_district_id: number
          sub_district_name: string
          tags: string[]
          years: number
        }[]
      }
      search_workers_count: {
        Args: {
          area_filter_id?: number
          city_filter_id?: number
          search_term?: string
        }
        Returns: number
      }
      update_past_bookings_status: { Args: never; Returns: undefined }
    }
    Enums: {
      asset_type:
        | "logo"
        | "promo_video"
        | "promo_image"
        | "promo_banner"
        | "pm_guest"
        | "pm_merchants"
        | "pm_worker"
      booking_status:
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled_by_customer"
        | "cancelled_by_worker"
        | "no_show"
      gender_enum: "male" | "female" | "other" | "prefer_not_to_say"
      nationality_region_enum:
        | "Thailand"
        | "Laos"
        | "Cambodia"
        | "Vietnam"
        | "Myanmar"
        | "Europe"
        | "North America"
        | "South America"
        | "Africa"
        | "Other"
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
      asset_type: [
        "logo",
        "promo_video",
        "promo_image",
        "promo_banner",
        "pm_guest",
        "pm_merchants",
        "pm_worker",
      ],
      booking_status: [
        "confirmed",
        "in_progress",
        "completed",
        "cancelled_by_customer",
        "cancelled_by_worker",
        "no_show",
      ],
      gender_enum: ["male", "female", "other", "prefer_not_to_say"],
      nationality_region_enum: [
        "Thailand",
        "Laos",
        "Cambodia",
        "Vietnam",
        "Myanmar",
        "Europe",
        "North America",
        "South America",
        "Africa",
        "Other",
      ],
      override_type: ["unavailable", "available"],
    },
  },
} as const
