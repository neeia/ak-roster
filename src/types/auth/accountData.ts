import {Json} from "../supabase";

export interface AccountData {
  assistant: string | null
  discordcode: Json | null
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
