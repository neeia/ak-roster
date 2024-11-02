export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
          crafting: boolean;
          material_id: string;
          stock: number;
          user_id: string;
        };
        Insert: {
          crafting?: boolean;
          material_id: string;
          stock: number;
          user_id?: string;
        };
        Update: {
          crafting?: boolean;
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
          private: boolean;
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
          presets: Json[];
          user_id: string;
        };
        Insert: {
          presets: Json[];
          user_id?: string;
        };
        Update: {
          presets?: Json[];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "presets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "krooster_accounts";
            referencedColumns: ["user_id"];
          }
        ];
      };
      supports: {
        Row: {
          module: Json | null;
          op_id: string;
          skill: number;
          slot: number;
          user_id: string;
        };
        Insert: {
          module?: Json | null;
          op_id: string;
          skill: number;
          slot: number;
          user_id?: string;
        };
        Update: {
          module?: Json | null;
          op_id?: string;
          skill?: number;
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
        Args: {
          bucketid: string;
          name: string;
          owner: string;
          metadata: Json;
        };
        Returns: undefined;
      };
      extension: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      filename: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      foldername: {
        Args: {
          name: string;
        };
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

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;
