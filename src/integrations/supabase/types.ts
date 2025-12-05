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
      invites: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          expires_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          token: string
          used: boolean
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          expires_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          token?: string
          used?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          expires_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
          used?: boolean
        }
        Relationships: []
      }
      jobs: {
        Row: {
          assigned_by: string | null
          created_at: string
          created_by: string | null
          customer_address: string
          customer_alt_phone: string | null
          customer_location: string | null
          customer_name: string
          customer_phone: string
          device_issue: string
          device_type: string
          gst: number | null
          id: string
          notes: string | null
          parts_cost: number | null
          payment_method: string | null
          qc_after: Json | null
          qc_before: Json | null
          service_charge: number | null
          status: Database["public"]["Enums"]["job_status"]
          technician_id: string | null
          time_slot: string | null
          timeline: Json | null
          total: number | null
          updated_at: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          created_by?: string | null
          customer_address: string
          customer_alt_phone?: string | null
          customer_location?: string | null
          customer_name: string
          customer_phone: string
          device_issue: string
          device_type: string
          gst?: number | null
          id?: string
          notes?: string | null
          parts_cost?: number | null
          payment_method?: string | null
          qc_after?: Json | null
          qc_before?: Json | null
          service_charge?: number | null
          status?: Database["public"]["Enums"]["job_status"]
          technician_id?: string | null
          time_slot?: string | null
          timeline?: Json | null
          total?: number | null
          updated_at?: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          created_by?: string | null
          customer_address?: string
          customer_alt_phone?: string | null
          customer_location?: string | null
          customer_name?: string
          customer_phone?: string
          device_issue?: string
          device_type?: string
          gst?: number | null
          id?: string
          notes?: string | null
          parts_cost?: number | null
          payment_method?: string | null
          qc_after?: Json | null
          qc_before?: Json | null
          service_charge?: number | null
          status?: Database["public"]["Enums"]["job_status"]
          technician_id?: string | null
          time_slot?: string | null
          timeline?: Json | null
          total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          job_id: string
          status: Database["public"]["Enums"]["job_status"]
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          job_id: string
          status: Database["public"]["Enums"]["job_status"]
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          job_id?: string
          status?: Database["public"]["Enums"]["job_status"]
        }
        Relationships: [
          {
            foreignKeyName: "status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_history_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "semiadmin" | "technician" | "viewer"
      job_status:
        | "unassigned"
        | "assigned"
        | "accepted"
        | "waiting"
        | "en_route"
        | "doorstep"
        | "qc_before"
        | "job_started"
        | "qc_after"
        | "invoice"
        | "payment"
        | "completed"
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
      app_role: ["admin", "semiadmin", "technician", "viewer"],
      job_status: [
        "unassigned",
        "assigned",
        "accepted",
        "waiting",
        "en_route",
        "doorstep",
        "qc_before",
        "job_started",
        "qc_after",
        "invoice",
        "payment",
        "completed",
      ],
    },
  },
} as const
