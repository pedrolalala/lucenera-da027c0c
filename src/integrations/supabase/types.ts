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
      entregas_finalizadas: {
        Row: {
          cliente: string
          codigo_obra: string
          created_at: string
          data_entrega_real: string
          endereco: string
          fotos_urls: string[]
          gestora_equipe: string | null
          id: string
          material_conteudo: string
          material_tipo: string
          numero_pedido: string | null
          observacoes: string | null
          observacoes_internas: string | null
          recebido_por: string
          separacao_id: string
          telefone: string
          vendedor: string | null
        }
        Insert: {
          cliente: string
          codigo_obra: string
          created_at?: string
          data_entrega_real?: string
          endereco: string
          fotos_urls?: string[]
          gestora_equipe?: string | null
          id?: string
          material_conteudo: string
          material_tipo: string
          numero_pedido?: string | null
          observacoes?: string | null
          observacoes_internas?: string | null
          recebido_por: string
          separacao_id: string
          telefone: string
          vendedor?: string | null
        }
        Update: {
          cliente?: string
          codigo_obra?: string
          created_at?: string
          data_entrega_real?: string
          endereco?: string
          fotos_urls?: string[]
          gestora_equipe?: string | null
          id?: string
          material_conteudo?: string
          material_tipo?: string
          numero_pedido?: string | null
          observacoes?: string | null
          observacoes_internas?: string | null
          recebido_por?: string
          separacao_id?: string
          telefone?: string
          vendedor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entregas_finalizadas_separacao_id_fkey"
            columns: ["separacao_id"]
            isOneToOne: false
            referencedRelation: "separacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      entregas_pendentes: {
        Row: {
          cliente: string
          codigo_obra: string
          created_at: string | null
          data_registro: string | null
          descricao_problema: string
          endereco: string | null
          fotos_urls: string[] | null
          id: string
          registrado_por: string
          registrado_por_user_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          responsavel: string | null
          separacao_id: string
          status_pendencia: string | null
          telefone: string | null
          tipo_problema: string
        }
        Insert: {
          cliente: string
          codigo_obra: string
          created_at?: string | null
          data_registro?: string | null
          descricao_problema: string
          endereco?: string | null
          fotos_urls?: string[] | null
          id?: string
          registrado_por: string
          registrado_por_user_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          responsavel?: string | null
          separacao_id: string
          status_pendencia?: string | null
          telefone?: string | null
          tipo_problema: string
        }
        Update: {
          cliente?: string
          codigo_obra?: string
          created_at?: string | null
          data_registro?: string | null
          descricao_problema?: string
          endereco?: string | null
          fotos_urls?: string[] | null
          id?: string
          registrado_por?: string
          registrado_por_user_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          responsavel?: string | null
          separacao_id?: string
          status_pendencia?: string | null
          telefone?: string | null
          tipo_problema?: string
        }
        Relationships: [
          {
            foreignKeyName: "entregas_pendentes_separacao_id_fkey"
            columns: ["separacao_id"]
            isOneToOne: false
            referencedRelation: "separacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      separacao_arquivos: {
        Row: {
          created_at: string
          id: string
          nome_arquivo: string
          ordem: number
          separacao_id: string
          tamanho_bytes: number
          tipo_arquivo: string
          url_arquivo: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome_arquivo: string
          ordem?: number
          separacao_id: string
          tamanho_bytes: number
          tipo_arquivo: string
          url_arquivo: string
        }
        Update: {
          created_at?: string
          id?: string
          nome_arquivo?: string
          ordem?: number
          separacao_id?: string
          tamanho_bytes?: number
          tipo_arquivo?: string
          url_arquivo?: string
        }
        Relationships: [
          {
            foreignKeyName: "separacao_arquivos_separacao_id_fkey"
            columns: ["separacao_id"]
            isOneToOne: false
            referencedRelation: "separacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      separacao_itens: {
        Row: {
          codigo_produto: string
          created_at: string
          descricao: string
          id: string
          id_lote: string | null
          ordem: number
          quantidade: number
          referencia: string
          separacao_id: string
        }
        Insert: {
          codigo_produto: string
          created_at?: string
          descricao: string
          id?: string
          id_lote?: string | null
          ordem?: number
          quantidade: number
          referencia: string
          separacao_id: string
        }
        Update: {
          codigo_produto?: string
          created_at?: string
          descricao?: string
          id?: string
          id_lote?: string | null
          ordem?: number
          quantidade?: number
          referencia?: string
          separacao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "separacao_itens_separacao_id_fkey"
            columns: ["separacao_id"]
            isOneToOne: false
            referencedRelation: "separacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      separacoes: {
        Row: {
          cliente: string
          codigo_obra: string
          codigo_rastreamento: string | null
          created_at: string
          data_entrega: string
          delivery_type: string
          endereco: string
          gestora_equipe: string
          id: string
          material_conteudo: string
          material_tipo: string | null
          nivel_complexidade: string | null
          numero_venda: string[]
          observacoes_internas: string | null
          order_in_route: number | null
          responsavel_recebimento: string
          scheduled_time: string | null
          separacoes_parciais: string[] | null
          solicitante: string | null
          status: string
          telefone: string | null
          tipo_entrega: string | null
          transportadora_nome: string | null
          updated_at: string
        }
        Insert: {
          cliente: string
          codigo_obra: string
          codigo_rastreamento?: string | null
          created_at?: string
          data_entrega: string
          delivery_type?: string
          endereco: string
          gestora_equipe: string
          id?: string
          material_conteudo: string
          material_tipo?: string | null
          nivel_complexidade?: string | null
          numero_venda?: string[]
          observacoes_internas?: string | null
          order_in_route?: number | null
          responsavel_recebimento: string
          scheduled_time?: string | null
          separacoes_parciais?: string[] | null
          solicitante?: string | null
          status?: string
          telefone?: string | null
          tipo_entrega?: string | null
          transportadora_nome?: string | null
          updated_at?: string
        }
        Update: {
          cliente?: string
          codigo_obra?: string
          codigo_rastreamento?: string | null
          created_at?: string
          data_entrega?: string
          delivery_type?: string
          endereco?: string
          gestora_equipe?: string
          id?: string
          material_conteudo?: string
          material_tipo?: string | null
          nivel_complexidade?: string | null
          numero_venda?: string[]
          observacoes_internas?: string | null
          order_in_route?: number | null
          responsavel_recebimento?: string
          scheduled_time?: string | null
          separacoes_parciais?: string[] | null
          solicitante?: string | null
          status?: string
          telefone?: string | null
          tipo_entrega?: string | null
          transportadora_nome?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nome_completo: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          nome_completo?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nome_completo?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_authenticated: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
