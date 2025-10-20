import axios from 'axios';
import { API_BASE_URL } from './config/configFile';

export interface User {
  id?: number;
  name?: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// -------- User Signup --------
export async function signupUser(payload: Partial<User>) {
  const res = await api.post('/users', { ...payload, role: 'user' });
  return res.data as User;
}

// -------- Login (User/Admin) --------
export async function loginUser(email: string, password: string) {
  // JSON server doesn't support login, so we filter users
  const res = await api.get<User[]>('/users', {
    params: { email, password },
  });

  if (res.data.length === 0) {
    throw new Error('Invalid credentials');
  }

  return res.data[0]; // return first matching user
}

// -------- Get All Users (Admin) --------
export async function getUsers() {
  const res = await api.get<User[]>('/users');
  return res.data;
}

// -------- Get Single User by ID --------
export async function getUser(id: number) {
  const res = await api.get<User>(`/users/${id}`);
  return res.data;
}
