export interface User {
  id?: number;
  name: string;
  surnames: string;
  email: string;
  roles: string[];
  password?: string;
}

export interface UserCreate extends User {
  password: string;
}

export interface UserList {
  users: User[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
} 