export interface LoginResponse {
  token: string;
  name: string;
  seniority: string;
  email?: string;
  role?: string;
}
