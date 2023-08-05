export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      depot: {
        Row: {
          material_id: string
          stock: number
          user_id: string
        }
        Insert: {
          material_id: string
          stock: number
          user_id?: string
        }
        Update: {
          material_id?: string
          stock?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "depot_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "krooster_accounts"
            referencedColumns: ["user_id"]
          }
        ]
      }
      goals: {
        Row: {
          elite: number | null
          group_name: string
          level: number | null
          masteries: number[] | null
          modules: Json | null
          op_id: string
          skill_level: number
          user_id: string
        }
        Insert: {
          elite?: number | null
          group_name: string
          level?: number | null
          masteries?: number[] | null
          modules?: Json | null
          op_id: string
          skill_level: number
          user_id?: string
        }
        Update: {
          elite?: number | null
          group_name?: string
          level?: number | null
          masteries?: number[] | null
          modules?: Json | null
          op_id?: string
          skill_level?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "krooster_accounts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "goals_user_id_group_name_fkey"
            columns: ["user_id", "group_name"]
            referencedRelation: "groups"
            referencedColumns: ["user_id", "group_name"]
          }
        ]
      }
      groups: {
        Row: {
          group_name: string
          user_id: string
        }
        Insert: {
          group_name: string
          user_id?: string
        }
        Update: {
          group_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "krooster_accounts"
            referencedColumns: ["user_id"]
          }
        ]
      }
      krooster_accounts: {
        Row: {
          assistant: string | null
          discordcode: string | null
          display_name: string | null
          friendcode: Json | null
          lastmodified: string
          level: number | null
          onboard: string | null
          private: boolean
          reddituser: string | null
          server: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          assistant?: string | null
          discordcode?: string | null
          display_name?: string | null
          friendcode?: Json | null
          lastmodified: string
          level?: number | null
          onboard?: string | null
          private: boolean
          reddituser?: string | null
          server?: string | null
          user_id?: string
          username?: string | null
        }
        Update: {
          assistant?: string | null
          discordcode?: string | null
          display_name?: string | null
          friendcode?: Json | null
          lastmodified?: string
          level?: number | null
          onboard?: string | null
          private?: boolean
          reddituser?: string | null
          server?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "krooster_accounts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      operators: {
        Row: {
          elite: number
          favorite: boolean
          level: number
          masteries: number[] | null
          modules: Json | null
          op_id: string
          potential: number
          skill_level: number
          skin: string | null
          user_id: string
        }
        Insert: {
          elite: number
          favorite: boolean
          level: number
          masteries?: number[] | null
          modules?: Json | null
          op_id: string
          potential: number
          skill_level: number
          skin?: string | null
          user_id?: string
        }
        Update: {
          elite?: number
          favorite?: boolean
          level?: number
          masteries?: number[] | null
          modules?: Json | null
          op_id?: string
          potential?: number
          skill_level?: number
          skin?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "operators_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "krooster_accounts"
            referencedColumns: ["user_id"]
          }
        ]
      }
      presets: {
        Row: {
          elite: number | null
          level: number | null
          masteries: number[] | null
          modules: number[] | null
          name: string
          potential: number | null
          skill_level: number | null
          user_id: string
        }
        Insert: {
          elite?: number | null
          level?: number | null
          masteries?: number[] | null
          modules?: number[] | null
          name: string
          potential?: number | null
          skill_level?: number | null
          user_id?: string
        }
        Update: {
          elite?: number | null
          level?: number | null
          masteries?: number[] | null
          modules?: number[] | null
          name?: string
          potential?: number | null
          skill_level?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "presets_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "krooster_accounts"
            referencedColumns: ["user_id"]
          }
        ]
      }
      supports: {
        Row: {
          module: Json | null
          op_id: string
          skill: number
          slot: number
          user_id: string
        }
        Insert: {
          module?: Json | null
          op_id: string
          skill: number
          slot: number
          user_id?: string
        }
        Update: {
          module?: Json | null
          op_id?: string
          skill?: number
          slot?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supports_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "krooster_accounts"
            referencedColumns: ["user_id"]
          }
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
