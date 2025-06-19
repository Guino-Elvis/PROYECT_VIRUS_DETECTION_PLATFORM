export interface KeyProject {
    id: number;
    company_id: number;
    project_id: number;
    key: string;
    active: boolean;
    expires_at: string | null;
    created_at: string | null;
    updated_at: string | null;
}
