
export interface DeliveredFood {
    id?: number; 
    foods: string;
    code_lote?: string;
    presentation: string;
    unit: string;

    mark?: string;
    fabricator: string;
    date_production?: string;
    date_expiration?: string;
    sanitario_alterno?: string;
    date_evaluation?: string;
    evaluation?: string;
    observation?: string;
    status: string;
    created_at: string | null;
    updated_at: string | null;
  }
  