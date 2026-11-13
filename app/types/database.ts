
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "announcements": {
                  Row: {
                    "author_id": string | null,"body": string,"created_at": string,"id": string,"pinned": boolean,"published_at": string | null,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id"?: string | null,"body": string,"created_at"?: string,"id"?: string,"pinned"?: boolean,"published_at"?: string | null,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "author_id"?: string | null,"body"?: string,"created_at"?: string,"id"?: string,"pinned"?: boolean,"published_at"?: string | null,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "announcements_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"availability": {
                  Row: {
                    "match_id": string,"player_id": string,"responded_at": string,"status": string
                  }
                  ComputedFields: never
                  Insert: {
                    "match_id": string,"player_id": string,"responded_at"?: string,"status": string
                  }
                  Update: {
                    "match_id"?: string,"player_id"?: string,"responded_at"?: string,"status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "availability_match_id_fkey"
      columns: ["match_id"]
isOneToOne: false
      referencedRelation: "match_result_issues"
      referencedColumns: ["match_id"]
    },{
      foreignKeyName: "availability_match_id_fkey"
      columns: ["match_id"]
isOneToOne: false
      referencedRelation: "matches"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "availability_player_id_fkey"
      columns: ["player_id"]
isOneToOne: false
      referencedRelation: "players"
      referencedColumns: ["id"]
    }
                  ]
                },"competitions": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"short_name": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"short_name"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"short_name"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"goals": {
                  Row: {
                    "assist_id": string | null,"created_at": string,"id": string,"is_own_goal": boolean,"match_id": string,"minute": number | null,"scorer_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "assist_id"?: string | null,"created_at"?: string,"id"?: string,"is_own_goal"?: boolean,"match_id": string,"minute"?: number | null,"scorer_id"?: string | null
                  }
                  Update: {
                    "assist_id"?: string | null,"created_at"?: string,"id"?: string,"is_own_goal"?: boolean,"match_id"?: string,"minute"?: number | null,"scorer_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "goals_assist_id_fkey"
      columns: ["assist_id"]
isOneToOne: false
      referencedRelation: "players"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "goals_match_id_fkey"
      columns: ["match_id"]
isOneToOne: false
      referencedRelation: "match_result_issues"
      referencedColumns: ["match_id"]
    },{
      foreignKeyName: "goals_match_id_fkey"
      columns: ["match_id"]
isOneToOne: false
      referencedRelation: "matches"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "goals_scorer_id_fkey"
      columns: ["scorer_id"]
isOneToOne: false
      referencedRelation: "players"
      referencedColumns: ["id"]
    }
                  ]
                },"instagram_connection": {
                  Row: {
                    "access_token": string,"expires_at": string | null,"id": boolean,"last_error": string | null,"last_synced_at": string | null,"token_refreshed_at": string,"updated_at": string,"username": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "access_token": string,"expires_at"?: string | null,"id"?: boolean,"last_error"?: string | null,"last_synced_at"?: string | null,"token_refreshed_at"?: string,"updated_at"?: string,"username"?: string | null
                  }
                  Update: {
                    "access_token"?: string,"expires_at"?: string | null,"id"?: boolean,"last_error"?: string | null,"last_synced_at"?: string | null,"token_refreshed_at"?: string,"updated_at"?: string,"username"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"mascot": {
                  Row: {
                    "bio": string | null,"created_at": string,"id": string,"name": string,"photo_path": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "bio"?: string | null,"created_at"?: string,"id"?: string,"name": string,"photo_path"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "bio"?: string | null,"created_at"?: string,"id"?: string,"name"?: string,"photo_path"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"match_players": {
                  Row: {
                    "created_at": string,"is_starter": boolean,"match_id": string,"minutes": number | null,"player_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"is_starter"?: boolean,"match_id": string,"minutes"?: number | null,"player_id": string
                  }
                  Update: {
                    "created_at"?: string,"is_starter"?: boolean,"match_id"?: string,"minutes"?: number | null,"player_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "match_players_match_id_fkey"
      columns: ["match_id"]
isOneToOne: false
      referencedRelation: "match_result_issues"
      referencedColumns: ["match_id"]
    },{
      foreignKeyName: "match_players_match_id_fkey"
      columns: ["match_id"]
isOneToOne: false
      referencedRelation: "matches"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "match_players_player_id_fkey"
      columns: ["player_id"]
isOneToOne: false
      referencedRelation: "players"
      referencedColumns: ["id"]
    }
                  ]
                },"matches": {
                  Row: {
                    "competition_id": string | null,"created_at": string,"graphic_path": string | null,"id": string,"is_home": boolean,"kickoff_at": string,"notes": string | null,"opp_score": number | null,"opponent_id": string,"published": boolean,"rv_score": number | null,"season_id": string,"status": string,"updated_at": string,"venue": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "competition_id"?: string | null,"created_at"?: string,"graphic_path"?: string | null,"id"?: string,"is_home"?: boolean,"kickoff_at": string,"notes"?: string | null,"opp_score"?: number | null,"opponent_id": string,"published"?: boolean,"rv_score"?: number | null,"season_id": string,"status"?: string,"updated_at"?: string,"venue"?: string | null
                  }
                  Update: {
                    "competition_id"?: string | null,"created_at"?: string,"graphic_path"?: string | null,"id"?: string,"is_home"?: boolean,"kickoff_at"?: string,"notes"?: string | null,"opp_score"?: number | null,"opponent_id"?: string,"published"?: boolean,"rv_score"?: number | null,"season_id"?: string,"status"?: string,"updated_at"?: string,"venue"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "matches_competition_id_fkey"
      columns: ["competition_id"]
isOneToOne: false
      referencedRelation: "competitions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "matches_opponent_id_fkey"
      columns: ["opponent_id"]
isOneToOne: false
      referencedRelation: "opponents"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "matches_season_id_fkey"
      columns: ["season_id"]
isOneToOne: false
      referencedRelation: "seasons"
      referencedColumns: ["id"]
    }
                  ]
                },"media": {
                  Row: {
                    "bucket": string,"created_at": string,"id": string,"kind": string,"match_id": string | null,"min_role": string,"path": string,"player_id": string | null,"season_id": string | null,"title": string | null,"uploaded_by": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "bucket": string,"created_at"?: string,"id"?: string,"kind": string,"match_id"?: string | null,"min_role"?: string,"path": string,"player_id"?: string | null,"season_id"?: string | null,"title"?: string | null,"uploaded_by"?: string | null
                  }
                  Update: {
                    "bucket"?: string,"created_at"?: string,"id"?: string,"kind"?: string,"match_id"?: string | null,"min_role"?: string,"path"?: string,"player_id"?: string | null,"season_id"?: string | null,"title"?: string | null,"uploaded_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "media_match_id_fkey"
      columns: ["match_id"]
isOneToOne: false
      referencedRelation: "match_result_issues"
      referencedColumns: ["match_id"]
    },{
      foreignKeyName: "media_match_id_fkey"
      columns: ["match_id"]
isOneToOne: false
      referencedRelation: "matches"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "media_player_id_fkey"
      columns: ["player_id"]
isOneToOne: false
      referencedRelation: "players"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "media_season_id_fkey"
      columns: ["season_id"]
isOneToOne: false
      referencedRelation: "seasons"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "media_uploaded_by_fkey"
      columns: ["uploaded_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"mvp_awards": {
                  Row: {
                    "created_at": string,"match_id": string,"player_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"match_id": string,"player_id": string
                  }
                  Update: {
                    "created_at"?: string,"match_id"?: string,"player_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "mvp_awards_match_id_fkey"
      columns: ["match_id"]
isOneToOne: false
      referencedRelation: "match_result_issues"
      referencedColumns: ["match_id"]
    },{
      foreignKeyName: "mvp_awards_match_id_fkey"
      columns: ["match_id"]
isOneToOne: false
      referencedRelation: "matches"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "mvp_awards_player_id_fkey"
      columns: ["player_id"]
isOneToOne: false
      referencedRelation: "players"
      referencedColumns: ["id"]
    }
                  ]
                },"news_articles": {
                  Row: {
                    "author_id": string | null,"author_name": string | null,"body": string,"cover_path": string | null,"created_at": string,"external_id": string | null,"external_url": string | null,"id": string,"is_lead": boolean,"kicker": string | null,"match_id": string | null,"published_at": string | null,"slug": string,"source": string,"summary": string | null,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id"?: string | null,"author_name"?: string | null,"body": string,"cover_path"?: string | null,"created_at"?: string,"external_id"?: string | null,"external_url"?: string | null,"id"?: string,"is_lead"?: boolean,"kicker"?: string | null,"match_id"?: string | null,"published_at"?: string | null,"slug": string,"source"?: string,"summary"?: string | null,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "author_id"?: string | null,"author_name"?: string | null,"body"?: string,"cover_path"?: string | null,"created_at"?: string,"external_id"?: string | null,"external_url"?: string | null,"id"?: string,"is_lead"?: boolean,"kicker"?: string | null,"match_id"?: string | null,"published_at"?: string | null,"slug"?: string,"source"?: string,"summary"?: string | null,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "news_articles_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "news_articles_match_id_fkey"
      columns: ["match_id"]
isOneToOne: false
      referencedRelation: "match_result_issues"
      referencedColumns: ["match_id"]
    },{
      foreignKeyName: "news_articles_match_id_fkey"
      columns: ["match_id"]
isOneToOne: false
      referencedRelation: "matches"
      referencedColumns: ["id"]
    }
                  ]
                },"opponents": {
                  Row: {
                    "created_at": string,"id": string,"logo_path": string | null,"name": string,"short_name": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"logo_path"?: string | null,"name": string,"short_name"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"logo_path"?: string | null,"name"?: string,"short_name"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"players": {
                  Row: {
                    "avatar_path": string | null,"bio": string | null,"created_at": string,"first_name": string,"id": string,"is_active": boolean,"is_captain": boolean,"last_name": string,"nickname": string | null,"photo_path": string | null,"position": string | null,"profile_id": string | null,"shirt_number": number | null,"slug": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar_path"?: string | null,"bio"?: string | null,"created_at"?: string,"first_name": string,"id"?: string,"is_active"?: boolean,"is_captain"?: boolean,"last_name": string,"nickname"?: string | null,"photo_path"?: string | null,"position"?: string | null,"profile_id"?: string | null,"shirt_number"?: number | null,"slug": string,"updated_at"?: string
                  }
                  Update: {
                    "avatar_path"?: string | null,"bio"?: string | null,"created_at"?: string,"first_name"?: string,"id"?: string,"is_active"?: boolean,"is_captain"?: boolean,"last_name"?: string,"nickname"?: string | null,"photo_path"?: string | null,"position"?: string | null,"profile_id"?: string | null,"shirt_number"?: number | null,"slug"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "players_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"poll_votes": {
                  Row: {
                    "created_at": string,"day": string,"player_id": string,"poll_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"day": string,"player_id": string,"poll_id": string
                  }
                  Update: {
                    "created_at"?: string,"day"?: string,"player_id"?: string,"poll_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "poll_votes_player_id_fkey"
      columns: ["player_id"]
isOneToOne: false
      referencedRelation: "players"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "poll_votes_poll_id_fkey"
      columns: ["poll_id"]
isOneToOne: false
      referencedRelation: "polls"
      referencedColumns: ["id"]
    }
                  ]
                },"polls": {
                  Row: {
                    "closes_at": string,"created_at": string,"id": string,"week_start": string
                  }
                  ComputedFields: never
                  Insert: {
                    "closes_at": string,"created_at"?: string,"id"?: string,"week_start": string
                  }
                  Update: {
                    "closes_at"?: string,"created_at"?: string,"id"?: string,"week_start"?: string
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"display_name": string | null,"email": string,"id": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"display_name"?: string | null,"email": string,"id": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"display_name"?: string | null,"email"?: string,"id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"seasons": {
                  Row: {
                    "created_at": string,"ends_on": string | null,"id": string,"is_current": boolean,"name": string,"starts_on": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"ends_on"?: string | null,"id"?: string,"is_current"?: boolean,"name": string,"starts_on": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"ends_on"?: string | null,"id"?: string,"is_current"?: boolean,"name"?: string,"starts_on"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"staff_members": {
                  Row: {
                    "created_at": string,"first_name": string,"id": string,"last_name": string,"photo_path": string | null,"role_title": string,"slug": string,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"first_name": string,"id"?: string,"last_name": string,"photo_path"?: string | null,"role_title": string,"slug": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"first_name"?: string,"id"?: string,"last_name"?: string,"photo_path"?: string | null,"role_title"?: string,"slug"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"standings": {
                  Row: {
                    "created_at": string,"id": string,"is_us": boolean,"points": number,"season_id": string,"sort_order": number,"team": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"is_us"?: boolean,"points"?: number,"season_id": string,"sort_order"?: number,"team": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"is_us"?: boolean,"points"?: number,"season_id"?: string,"sort_order"?: number,"team"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "standings_season_id_fkey"
      columns: ["season_id"]
isOneToOne: false
      referencedRelation: "seasons"
      referencedColumns: ["id"]
    }
                  ]
                },"user_roles": {
                  Row: {
                    "created_at": string,"role": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"role"?: string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"role"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "user_roles_user_id_fkey"
      columns: ["user_id"]
isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "assists": {
                  Row: {
                    "goal_id": string,"match_id": string,"minute": number | null,"player_id": string | null,"scorer_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                           "goal_id"?: string | null,"match_id"?: string | null,"minute"?: number | null,"player_id"?: string | null,"scorer_id"?: string | null
                         }
                        Update: {
                           "goal_id"?: string | null,"match_id"?: string | null,"minute"?: number | null,"player_id"?: string | null,"scorer_id"?: string | null
                         }
                        Relationships: [
                    {
      foreignKeyName: "goals_assist_id_fkey"
      columns: ["player_id"]
isOneToOne: false
      referencedRelation: "players"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "goals_match_id_fkey"
      columns: ["match_id"]
isOneToOne: false
      referencedRelation: "match_result_issues"
      referencedColumns: ["match_id"]
    },{
      foreignKeyName: "goals_match_id_fkey"
      columns: ["match_id"]
isOneToOne: false
      referencedRelation: "matches"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "goals_scorer_id_fkey"
      columns: ["scorer_id"]
isOneToOne: false
      referencedRelation: "players"
      referencedColumns: ["id"]
    }
                  ]
                },"match_result_issues": {
                  Row: {
                    "match_id": string,"recorded_goals": number | null,"rv_score": number | null
                  }
                  ComputedFields: never
                  Relationships: [
                    
                  ]
                },"player_career_stats": {
                  Row: {
                    "appearances": number | null,"assists": number | null,"assists_many": boolean | null,"attendance": number | null,"goals": number | null,"goals_per_game": number | null,"mvps": number | null,"player_id": string,"wins": number | null
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "match_players_player_id_fkey"
      columns: ["player_id"]
isOneToOne: false
      referencedRelation: "players"
      referencedColumns: ["id"]
    }
                  ]
                },"player_season_stats": {
                  Row: {
                    "appearances": number | null,"assists": number | null,"assists_many": boolean | null,"attendance": number | null,"goals": number | null,"goals_per_game": number | null,"mvps": number | null,"player_id": string,"season_id": string,"wins": number | null
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "match_players_player_id_fkey"
      columns: ["player_id"]
isOneToOne: false
      referencedRelation: "players"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "matches_season_id_fkey"
      columns: ["season_id"]
isOneToOne: false
      referencedRelation: "seasons"
      referencedColumns: ["id"]
    }
                  ]
                },"team_season_stats": {
                  Row: {
                    "draws": number | null,"goal_difference": number | null,"goals_against": number | null,"goals_for": number | null,"losses": number | null,"played": number | null,"season_id": string,"wins": number | null
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "matches_season_id_fkey"
      columns: ["season_id"]
isOneToOne: false
      referencedRelation: "seasons"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Functions: {
            "has_role":
{ Args: { "roles": (string)[] }; Returns: boolean
                           },
"record_match_result":
{ Args: { "p_goals": Json,"p_lineup": Json,"p_match_id": string,"p_mvp_ids": (string)[],"p_opp_score": number,"p_rv_score": number }; Returns: undefined
                           },
"set_availability":
{ Args: { "p_match_id": string,"p_status": string }; Returns: undefined
                           },
"set_poll_votes":
{ Args: { "p_days": (string)[],"p_poll_id": string }; Returns: undefined
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
