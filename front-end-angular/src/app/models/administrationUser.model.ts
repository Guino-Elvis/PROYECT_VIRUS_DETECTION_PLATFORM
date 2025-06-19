import { Company } from "./company.model";
import { Role } from "./role.model";


export interface AdministrationUser {
    id?: number;
    role: string;
    name: string;
    email: string;
    password: string;
    status: string;
    companies?: Company[];
    roles?: Role[];
    company_id: number;
    created_at: string | null;
    updated_at: string | null;
}