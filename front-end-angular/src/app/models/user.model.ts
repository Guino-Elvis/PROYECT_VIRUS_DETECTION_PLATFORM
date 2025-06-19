import { Company } from "./company.model";
import { Role } from "./role.model";

export interface User {
  id?: number;
  name?: string;
  email: string;
  password: string;
  password_confirmation?: string;
  token?: string;
  roles?: Role[];  
  companies?: Company[];  
  // Campos de la empresa
  ra_social?: string;  
  ruc?: string;      
  address?: string;     
  phone?: string;    

 
}
