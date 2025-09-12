import apiClient from './apiClient';

export type SignupData = {
  name: string;
  email: string;
  password: string;
};

export type LoginData = {
  email: string; 
  password: string;
};


type AuthResponse = {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: any;
  };
};

export async function signup(data: SignupData) {
  const response = await apiClient.post<AuthResponse>('/signup', data);
  return response.data.data; 
}

export async function login(data: LoginData) {
  const response = await apiClient.post<AuthResponse>('/login', data);
  return response.data.data; 
}