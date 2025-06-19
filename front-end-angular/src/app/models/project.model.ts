import { Company } from "./company.model";
import { KeyProject } from "./keyProject.model";

export interface Project {
    id?: number;
    company_id?: number;
    name?: string;
    description?: string;
    target_url?: string;
    company?: Company;
    key_projects?: KeyProject[];
    created_at: string | null;
    updated_at: string | null;
}
