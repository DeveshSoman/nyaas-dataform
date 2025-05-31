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
      child_spouses: {
        Row: {
          age: number | null
          child_id: string
          contact_number: string | null
          created_at: string
          date_of_birth: string | null
          first_name: string | null
          id: string
          last_name: string | null
          native_place: string | null
          number_of_children: number | null
          occupation: Database["public"]["Enums"]["occupation_type"] | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          child_id: string
          contact_number?: string | null
          created_at?: string
          date_of_birth?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          native_place?: string | null
          number_of_children?: number | null
          occupation?: Database["public"]["Enums"]["occupation_type"] | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          child_id?: string
          contact_number?: string | null
          created_at?: string
          date_of_birth?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          native_place?: string | null
          number_of_children?: number | null
          occupation?: Database["public"]["Enums"]["occupation_type"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_spouses_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          age: number | null
          child_index: number
          child_type: string
          contact_number: string | null
          created_at: string
          current_place: string | null
          date_of_birth: string | null
          family_head_id: string
          first_name: string | null
          id: string
          last_name: string | null
          marital_status: Database["public"]["Enums"]["marital_status"] | null
          occupation: Database["public"]["Enums"]["occupation_type"] | null
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          child_index: number
          child_type: string
          contact_number?: string | null
          created_at?: string
          current_place?: string | null
          date_of_birth?: string | null
          family_head_id: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          occupation?: Database["public"]["Enums"]["occupation_type"] | null
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          child_index?: number
          child_type?: string
          contact_number?: string | null
          created_at?: string
          current_place?: string | null
          date_of_birth?: string | null
          family_head_id?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          occupation?: Database["public"]["Enums"]["occupation_type"] | null
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_family_head_id_fkey"
            columns: ["family_head_id"]
            isOneToOne: false
            referencedRelation: "family_heads"
            referencedColumns: ["id"]
          },
        ]
      }
      family_heads: {
        Row: {
          age: number
          contact_number: string | null
          created_at: string
          current_place: string | null
          date_of_birth: string
          first_name: string
          id: string
          last_name: string
          marital_status: Database["public"]["Enums"]["marital_status"]
          native_place: string | null
          occupation: Database["public"]["Enums"]["occupation_type"] | null
          updated_at: string
        }
        Insert: {
          age: number
          contact_number?: string | null
          created_at?: string
          current_place?: string | null
          date_of_birth: string
          first_name: string
          id?: string
          last_name: string
          marital_status: Database["public"]["Enums"]["marital_status"]
          native_place?: string | null
          occupation?: Database["public"]["Enums"]["occupation_type"] | null
          updated_at?: string
        }
        Update: {
          age?: number
          contact_number?: string | null
          created_at?: string
          current_place?: string | null
          date_of_birth?: string
          first_name?: string
          id?: string
          last_name?: string
          marital_status?: Database["public"]["Enums"]["marital_status"]
          native_place?: string | null
          occupation?: Database["public"]["Enums"]["occupation_type"] | null
          updated_at?: string
        }
        Relationships: []
      }
      grandchildren: {
        Row: {
          age: number | null
          child_spouse_id: string
          contact_number: string | null
          created_at: string
          current_place: string | null
          date_of_birth: string | null
          first_name: string | null
          grandchild_index: number
          id: string
          last_name: string | null
          occupation: Database["public"]["Enums"]["occupation_type"] | null
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          child_spouse_id: string
          contact_number?: string | null
          created_at?: string
          current_place?: string | null
          date_of_birth?: string | null
          first_name?: string | null
          grandchild_index: number
          id?: string
          last_name?: string | null
          occupation?: Database["public"]["Enums"]["occupation_type"] | null
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          child_spouse_id?: string
          contact_number?: string | null
          created_at?: string
          current_place?: string | null
          date_of_birth?: string | null
          first_name?: string | null
          grandchild_index?: number
          id?: string
          last_name?: string | null
          occupation?: Database["public"]["Enums"]["occupation_type"] | null
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grandchildren_child_spouse_id_fkey"
            columns: ["child_spouse_id"]
            isOneToOne: false
            referencedRelation: "child_spouses"
            referencedColumns: ["id"]
          },
        ]
      }
      spouses: {
        Row: {
          age: number | null
          contact_number: string | null
          created_at: string
          date_of_birth: string | null
          family_head_id: string
          first_name: string | null
          id: string
          last_name: string | null
          native_place: string | null
          number_of_daughters: number | null
          number_of_sons: number | null
          occupation: Database["public"]["Enums"]["occupation_type"] | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          contact_number?: string | null
          created_at?: string
          date_of_birth?: string | null
          family_head_id: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          native_place?: string | null
          number_of_daughters?: number | null
          number_of_sons?: number | null
          occupation?: Database["public"]["Enums"]["occupation_type"] | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          contact_number?: string | null
          created_at?: string
          date_of_birth?: string | null
          family_head_id?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          native_place?: string | null
          number_of_daughters?: number | null
          number_of_sons?: number | null
          occupation?: Database["public"]["Enums"]["occupation_type"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spouses_family_head_id_fkey"
            columns: ["family_head_id"]
            isOneToOne: false
            referencedRelation: "family_heads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      marital_status: "single" | "married" | "divorced" | "widowed"
      occupation_type:
        | "retired"
        | "housewife"
        | "salaried"
        | "business"
        | "student"
        | "unemployed"
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
      marital_status: ["single", "married", "divorced", "widowed"],
      occupation_type: [
        "retired",
        "housewife",
        "salaried",
        "business",
        "student",
        "unemployed",
      ],
    },
  },
} as const
