export type EmployeeSeniority = 'JUNIOR' | 'SENIOR' | 'SPECIALIST';

export interface EmployeeRegistration {
  name: string;
  email: string;
  role: 'user';
  seniority: EmployeeSeniority;
  password: string;
}
