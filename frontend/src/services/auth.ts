import { apiClient } from './api';

const tokenKey = 'sensechainai.token';
const modeKey = 'sensechainai.auth.mode';

export type AuthMode = 'demo' | 'manual';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export function getStoredToken() {
  return window.localStorage.getItem(tokenKey);
}

export function getStoredAuthMode(): AuthMode {
  return window.localStorage.getItem(modeKey) === 'manual' ? 'manual' : 'demo';
}

export function setStoredToken(token: string) {
  window.localStorage.setItem(tokenKey, token);
}

export function setStoredAuthMode(mode: AuthMode) {
  window.localStorage.setItem(modeKey, mode);
}

export function clearStoredAuthState() {
  window.localStorage.removeItem(tokenKey);
  window.localStorage.removeItem(modeKey);
}

async function storeSession(session: AuthSession, mode: AuthMode) {
  setStoredToken(session.token);
  setStoredAuthMode(mode);
  return session;
}

export async function loginWithCredentials(email: string, password: string) {
  const response = await apiClient.post('/auth/login', { email, password });
  return storeSession(response.data.data as AuthSession, 'manual');
}

export async function activateDemoSession() {
  const response = await apiClient.post('/auth/demo');
  return storeSession(response.data.data as AuthSession, 'demo');
}

export async function ensureDemoSession() {
  const storedToken = getStoredToken();
  if (storedToken) {
    return storedToken;
  }

  const session = await activateDemoSession();
  return session.token;
}

export async function signOut() {
  clearStoredAuthState();
}
