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
          phone: string | null
          full_name: string
          role: 'donor' | 'recipient' | 'admin'
          avatar_url: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          phone?: string | null
          full_name: string
          role?: 'donor' | 'recipient' | 'admin'
          avatar_url?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          full_name?: string
          role?: 'donor' | 'recipient' | 'admin'
          avatar_url?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          donor_id: string
          title: string
          description: string
          category: string
          location: string
          image_url: string | null
          status: 'available' | 'claimed' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donor_id: string
          title: string
          description: string
          category: string
          location: string
          image_url?: string | null
          status?: 'available' | 'claimed' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          donor_id?: string
          title?: string
          description?: string
          category?: string
          location?: string
          image_url?: string | null
          status?: 'available' | 'claimed' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      requests: {
        Row: {
          id: string
          donation_id: string
          recipient_id: string
          message: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donation_id: string
          recipient_id: string
          message: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          donation_id?: string
          recipient_id?: string
          message?: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          donation_id: string
          recipient_id: string
          donor_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          donation_id: string
          recipient_id: string
          donor_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          donation_id?: string
          recipient_id?: string
          donor_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_id: string
          type: 'user' | 'donation'
          reason: string
          description: string | null
          status: 'pending' | 'reviewed' | 'resolved'
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_id: string
          type: 'user' | 'donation'
          reason: string
          description?: string | null
          status?: 'pending' | 'reviewed' | 'resolved'
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_id?: string
          type?: 'user' | 'donation'
          reason?: string
          description?: string | null
          status?: 'pending' | 'reviewed' | 'resolved'
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