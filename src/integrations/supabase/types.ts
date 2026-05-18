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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_id: string
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_quotes: {
        Row: {
          created_at: string
          delivery_date: string | null
          description: string | null
          id: string
          items: Json
          notes: string | null
          quantity: number | null
          quoted_price: number | null
          requester_id: string
          responder_id: string
          status: string
          target_price: number | null
          title: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_date?: string | null
          description?: string | null
          id?: string
          items?: Json
          notes?: string | null
          quantity?: number | null
          quoted_price?: number | null
          requester_id: string
          responder_id: string
          status?: string
          target_price?: number | null
          title: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_date?: string | null
          description?: string | null
          id?: string
          items?: Json
          notes?: string | null
          quantity?: number | null
          quoted_price?: number | null
          requester_id?: string
          responder_id?: string
          status?: string
          target_price?: number | null
          title?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      disputes: {
        Row: {
          complainant_id: string
          created_at: string
          description: string
          id: string
          order_id: string | null
          resolution: string | null
          respondent_id: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          complainant_id: string
          created_at?: string
          description: string
          id?: string
          order_id?: string | null
          resolution?: string | null
          respondent_id: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          complainant_id?: string
          created_at?: string
          description?: string
          id?: string
          order_id?: string | null
          resolution?: string | null
          respondent_id?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          is_verified: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          is_verified?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_verified?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          message: string
          product_id: string | null
          status: string | null
          supplier_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          message: string
          product_id?: string | null
          status?: string | null
          supplier_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          message?: string
          product_id?: string | null
          status?: string | null
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string
          id: string
          inquiry_id: string | null
          is_read: boolean | null
          message: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          inquiry_id?: string | null
          is_read?: boolean | null
          message: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          inquiry_id?: string | null
          is_read?: boolean | null
          message?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_delivery_date: string | null
          buyer_id: string
          created_at: string
          delivery_status: string | null
          expected_delivery_date: string | null
          id: string
          notes: string | null
          order_number: string
          product_id: string | null
          quantity: number
          rfq_id: string | null
          status: string
          supplier_id: string
          total_amount: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          actual_delivery_date?: string | null
          buyer_id: string
          created_at?: string
          delivery_status?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          product_id?: string | null
          quantity?: number
          rfq_id?: string | null
          status?: string
          supplier_id: string
          total_amount?: number
          unit_price?: number
          updated_at?: string
        }
        Update: {
          actual_delivery_date?: string | null
          buyer_id?: string
          created_at?: string
          delivery_status?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          product_id?: string | null
          quantity?: number
          rfq_id?: string | null
          status?: string
          supplier_id?: string
          total_amount?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs_open_public"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          buyer_id: string
          created_at: string
          due_date: string | null
          id: string
          notes: string | null
          order_id: string
          paid_at: string | null
          payment_method: string | null
          status: string
          supplier_id: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          buyer_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          order_id: string
          paid_at?: string | null
          payment_method?: string | null
          status?: string
          supplier_id: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          buyer_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          paid_at?: string | null
          payment_method?: string | null
          status?: string
          supplier_id?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_approved: boolean | null
          moq: number
          name: string
          price: number | null
          specifications: Json | null
          supplier_id: string
          unit: string | null
          updated_at: string
          views: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_approved?: boolean | null
          moq?: number
          name: string
          price?: number | null
          specifications?: Json | null
          supplier_id: string
          unit?: string | null
          updated_at?: string
          views?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_approved?: boolean | null
          moq?: number
          name?: string
          price?: number | null
          specifications?: Json | null
          supplier_id?: string
          unit?: string | null
          updated_at?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          company_description: string | null
          company_name: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          gst_number: string | null
          id: string
          is_verified: boolean | null
          pan_number: string | null
          phone: string | null
          pincode: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          company_description?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gst_number?: string | null
          id: string
          is_verified?: boolean | null
          pan_number?: string | null
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          company_description?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gst_number?: string | null
          id?: string
          is_verified?: boolean | null
          pan_number?: string | null
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          product_id: string | null
          rating: number
          review_text: string | null
          supplier_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          product_id?: string | null
          rating: number
          review_text?: string | null
          supplier_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          product_id?: string | null
          rating?: number
          review_text?: string | null
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_responses: {
        Row: {
          created_at: string
          delivery_time: string | null
          id: string
          message: string
          quoted_price: number | null
          rfq_id: string
          supplier_id: string
        }
        Insert: {
          created_at?: string
          delivery_time?: string | null
          id?: string
          message: string
          quoted_price?: number | null
          rfq_id: string
          supplier_id: string
        }
        Update: {
          created_at?: string
          delivery_time?: string | null
          id?: string
          message?: string
          quoted_price?: number | null
          rfq_id?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfq_responses_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_responses_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs_open_public"
            referencedColumns: ["id"]
          },
        ]
      }
      rfqs: {
        Row: {
          buyer_id: string
          category_id: string | null
          created_at: string
          deadline: string | null
          description: string
          id: string
          location: string | null
          quantity: number | null
          status: string | null
          target_price: number | null
          title: string
          unit: string | null
        }
        Insert: {
          buyer_id: string
          category_id?: string | null
          created_at?: string
          deadline?: string | null
          description: string
          id?: string
          location?: string | null
          quantity?: number | null
          status?: string | null
          target_price?: number | null
          title: string
          unit?: string | null
        }
        Update: {
          buyer_id?: string
          category_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string
          id?: string
          location?: string | null
          quantity?: number | null
          status?: string | null
          target_price?: number | null
          title?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rfqs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_products: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_suppliers: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          supplier_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          supplier_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          supplier_id?: string
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
      rfqs_open_public: {
        Row: {
          buyer_id: string | null
          category_id: string | null
          created_at: string | null
          deadline: string | null
          description: string | null
          id: string | null
          location: string | null
          quantity: number | null
          status: string | null
          title: string | null
          unit: string | null
        }
        Insert: {
          buyer_id?: string | null
          category_id?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string | null
          location?: string | null
          quantity?: number | null
          status?: string | null
          title?: string | null
          unit?: string | null
        }
        Update: {
          buyer_id?: string | null
          category_id?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string | null
          location?: string | null
          quantity?: number | null
          status?: string | null
          title?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rfqs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_profiles_public: {
        Row: {
          avatar_url: string | null
          city: string | null
          company_description: string | null
          company_name: string | null
          country: string | null
          created_at: string | null
          id: string | null
          is_verified: boolean | null
          state: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          company_description?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          id?: string | null
          is_verified?: boolean | null
          state?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          company_description?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          id?: string | null
          is_verified?: boolean | null
          state?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_supplier: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "buyer" | "supplier" | "admin"
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
      app_role: ["buyer", "supplier", "admin"],
    },
  },
} as const
