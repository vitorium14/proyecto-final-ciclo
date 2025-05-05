export interface User {
  id: number;
  email: string;
  fullName: string; // Changed to camelCase to match backend entity
  roles: string[];
}