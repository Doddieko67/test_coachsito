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
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'designer' | 'viewer'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: 'admin' | 'designer' | 'viewer'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'designer' | 'viewer'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      designs: {
        Row: {
          id: string
          user_id: string
          title: string
          canvas_data: Json
          thumbnail_url: string | null
          is_template: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          canvas_data: Json
          thumbnail_url?: string | null
          is_template?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          canvas_data?: Json
          thumbnail_url?: string | null
          is_template?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          design_id: string
          user_id: string | null
          message: string
          is_ai: boolean
          created_at: string
        }
        Insert: {
          id?: string
          design_id: string
          user_id?: string | null
          message: string
          is_ai?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          design_id?: string
          user_id?: string | null
          message?: string
          is_ai?: boolean
          created_at?: string
        }
      }
      collaborators: {
        Row: {
          id: string
          design_id: string
          user_id: string
          role: 'owner' | 'editor' | 'viewer'
          joined_at: string
        }
        Insert: {
          id?: string
          design_id: string
          user_id: string
          role?: 'owner' | 'editor' | 'viewer'
          joined_at?: string
        }
        Update: {
          id?: string
          design_id?: string
          user_id?: string
          role?: 'owner' | 'editor' | 'viewer'
          joined_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          name: string
          category: string
          canvas_data: Json
          thumbnail_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          canvas_data: Json
          thumbnail_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          canvas_data?: Json
          thumbnail_url?: string | null
          created_at?: string
        }
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
  }
}