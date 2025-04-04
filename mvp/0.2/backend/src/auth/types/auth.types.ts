export interface JwtPayload {
  sub: number;
  email: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface UserPayload {
  id: number;
  email: string;
} 