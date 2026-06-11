export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Usuario {
  id?: number;
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  password?: string;
  telefono?: string;
  activo?: boolean;
  rol: Rol;
  rolId?: number;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  username: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}
