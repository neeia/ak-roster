export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      depot: {
        Row: {
          material_id: string;
          stock: number;
          user_id: string;
        };
        Insert: {
          material_id: string;
          stock: number;
          user_id?: string;
        };
        Update: {
          material_id?: string;
          stock?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "depot_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "krooster_accounts";
            referencedColumns: ["user_id"];
          }
        ];
      };
      goals: {
        Row: {
          elite_from: number | null;
          elite_to: number | null;
          group_name: string;
          level_from: number | null;
          level_to: number | null;
          masteries_from: number[] | null;
          masteries_to: number[] | null;
          modules_from: Json | null;
          modules_to: Json | null;
          op_id: string;
          skill_level_from: number | null;
          skill_level_to: number | null;
          sort_order: number;
          user_id: string;
        };
        Insert: {
          elite_from?: number | null;
          elite_to?: number | null;
          group_name: string;
          level_from?: number | null;
          level_to?: number | null;
          masteries_from?: number[] | null;
          masteries_to?: number[] | null;
          modules_from?: Json | null;
          modules_to?: Json | null;
          op_id: string;
          skill_level_from?: number | null;
          skill_level_to?: number | null;
          sort_order?: number;
          user_id?: string;
        };
        Update: {
          elite_from?: number | null;
          elite_to?: number | null;
          group_name?: string;
          level_from?: number | null;
          level_to?: number | null;
          masteries_from?: number[] | null;
          masteries_to?: number[] | null;
          modules_from?: Json | null;
          modules_to?: Json | null;
          op_id?: string;
          skill_level_from?: number | null;
          skill_level_to?: number | null;
          sort_order?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "krooster_accounts";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "goals_user_id_group_name_fkey";
            columns: ["user_id", "group_name"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["user_id", "group_name"];
          }
        ];
      };
      groups: {
        Row: {
          group_name: string;
          sort_order: number;
          user_id: string;
        };
        Insert: {
          group_name: string;
          sort_order?: number;
          user_id?: string;
        };
        Update: {
          group_name?: string;
          sort_order?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "groups_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "krooster_accounts";
            referencedColumns: ["user_id"];
          }
        ];
      };
      krooster_accounts: {
        Row: {
          assistant: string | null;
          color: string | null;
          discordcode: string | null;
          display_name: string | null;
          friendcode: Json | null;
          level: number | null;
          onboard: string | null;
          private: boolean;
          reddituser: string | null;
          server: string | null;
          user_id: string;
          username: string | null;
        };
        Insert: {
          assistant?: string | null;
          color?: string | null;
          discordcode?: string | null;
          display_name?: string | null;
          friendcode?: Json | null;
          level?: number | null;
          onboard?: string | null;
          private?: boolean;
          reddituser?: string | null;
          server?: string | null;
          user_id?: string;
          username?: string | null;
        };
        Update: {
          assistant?: string | null;
          color?: string | null;
          discordcode?: string | null;
          display_name?: string | null;
          friendcode?: Json | null;
          level?: number | null;
          onboard?: string | null;
          private?: boolean;
          reddituser?: string | null;
          server?: string | null;
          user_id?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      operators: {
        Row: {
          elite: number;
          favorite: boolean;
          level: number;
          masteries: number[];
          modules: Json;
          op_id: string;
          potential: number;
          skill_level: number;
          skin: string | null;
          user_id: string;
        };
        Insert: {
          elite: number;
          favorite: boolean;
          level: number;
          masteries?: number[];
          modules?: Json;
          op_id: string;
          potential: number;
          skill_level: number;
          skin?: string | null;
          user_id?: string;
        };
        Update: {
          elite?: number;
          favorite?: boolean;
          level?: number;
          masteries?: number[];
          modules?: Json;
          op_id?: string;
          potential?: number;
          skill_level?: number;
          skin?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "operators_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "krooster_accounts";
            referencedColumns: ["user_id"];
          }
        ];
      };
      presets: {
        Row: {
          elite: number | null;
          favorite: boolean | null;
          index: number;
          level: number | null;
          masteries: number[] | null;
          modules: Json | null;
          name: string;
          potential: number | null;
          skill_level: number | null;
          user_id: string;
        };
        Insert: {
          elite?: number | null;
          favorite?: boolean | null;
          index: number;
          level?: number | null;
          masteries?: number[] | null;
          modules?: Json | null;
          name: string;
          potential?: number | null;
          skill_level?: number | null;
          user_id?: string;
        };
        Update: {
          elite?: number | null;
          favorite?: boolean | null;
          index?: number;
          level?: number | null;
          masteries?: number[] | null;
          modules?: Json | null;
          name?: string;
          potential?: number | null;
          skill_level?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "presets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "krooster_accounts";
            referencedColumns: ["user_id"];
          }
        ];
      };
      supports: {
        Row: {
          op_id: string;
          slot: number;
          user_id: string;
        };
        Insert: {
          op_id: string;
          slot: number;
          user_id?: string;
        };
        Update: {
          op_id?: string;
          slot?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "supports_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "krooster_accounts";
            referencedColumns: ["user_id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null;
          avif_autodetection: boolean | null;
          created_at: string | null;
          file_size_limit: number | null;
          id: string;
          name: string;
          owner: string | null;
          owner_id: string | null;
          public: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id: string;
          name: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id?: string;
          name?: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      migrations: {
        Row: {
          executed_at: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Insert: {
          executed_at?: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Update: {
          executed_at?: string | null;
          hash?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      objects: {
        Row: {
          bucket_id: string | null;
          created_at: string | null;
          id: string;
          last_accessed_at: string | null;
          metadata: Json | null;
          name: string | null;
          owner: string | null;
          owner_id: string | null;
          path_tokens: string[] | null;
          updated_at: string | null;
          user_metadata: Json | null;
          version: string | null;
        };
        Insert: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          user_metadata?: Json | null;
          version?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          user_metadata?: Json | null;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey";
            columns: ["bucket_id"];
            isOneToOne: false;
            referencedRelation: "buckets";
            referencedColumns: ["id"];
          }
        ];
      };
      s3_multipart_uploads: {
        Row: {
          bucket_id: string;
          created_at: string;
          id: string;
          in_progress_size: number;
          key: string;
          owner_id: string | null;
          upload_signature: string;
          user_metadata: Json | null;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          id: string;
          in_progress_size?: number;
          key: string;
          owner_id?: string | null;
          upload_signature: string;
          user_metadata?: Json | null;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          id?: string;
          in_progress_size?: number;
          key?: string;
          owner_id?: string | null;
          upload_signature?: string;
          user_metadata?: Json | null;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey";
            columns: ["bucket_id"];
            isOneToOne: false;
            referencedRelation: "buckets";
            referencedColumns: ["id"];
          }
        ];
      };
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string;
          created_at: string;
          etag: string;
          id: string;
          key: string;
          owner_id: string | null;
          part_number: number;
          size: number;
          upload_id: string;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          etag: string;
          id?: string;
          key: string;
          owner_id?: string | null;
          part_number: number;
          size?: number;
          upload_id: string;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          etag?: string;
          id?: string;
          key?: string;
          owner_id?: string | null;
          part_number?: number;
          size?: number;
          upload_id?: string;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey";
            columns: ["bucket_id"];
            isOneToOne: false;
            referencedRelation: "buckets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey";
            columns: ["upload_id"];
            isOneToOne: false;
            referencedRelation: "s3_multipart_uploads";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_insert_object: {
        Args: { bucketid: string; name: string; owner: string; metadata: Json };
        Returns: undefined;
      };
      extension: {
        Args: { name: string };
        Returns: string;
      };
      filename: {
        Args: { name: string };
        Returns: string;
      };
      foldername: {
        Args: { name: string };
        Returns: string[];
      };
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>;
        Returns: {
          size: number;
          bucket_id: string;
        }[];
      };
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string;
          prefix_param: string;
          delimiter_param: string;
          max_keys?: number;
          next_key_token?: string;
          next_upload_token?: string;
        };
        Returns: {
          key: string;
          id: string;
          created_at: string;
        }[];
      };
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string;
          prefix_param: string;
          delimiter_param: string;
          max_keys?: number;
          start_after?: string;
          next_token?: string;
        };
        Returns: {
          name: string;
          id: string;
          metadata: Json;
          updated_at: string;
        }[];
      };
      operation: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      search: {
        Args: {
          prefix: string;
          bucketname: string;
          limits?: number;
          levels?: number;
          offsets?: number;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          name: string;
          id: string;
          updated_at: string;
          created_at: string;
          last_accessed_at: string;
          metadata: Json;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  storage: {
    Enums: {},
  },
} as const;
