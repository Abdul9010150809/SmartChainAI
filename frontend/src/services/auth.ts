import { apiClient } from './api';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from './firebase';

const tokenKey = 'smartchainai.token';
const modeKey = 'smartchainai.auth.mode';

export type AuthMode = 'demo' | 'manual';
export type DemoRole = 'admin' | 'operator' | 'viewer';

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

export interface DemoAccount {
  role: DemoRole;
  name: string;
  email: string;
  password: string;
}

export function getStoredToken() {
  return window.localStorage.getItem(tokenKey);
}

export function getStoredAuthMode(): AuthMode {
  const mode = window.localStorage.getItem(modeKey);
  if (mode === 'manual' || mode === 'demo') {
    return mode;
  }

  return 'demo';
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
  const auth = getFirebaseAuth();
  if (auth) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  const response = await apiClient.post('/auth/login', { email, password });
  return storeSession(response.data.data as AuthSession, 'manual');
}

export async function registerWithCredentials(name: string, email: string, password: string, role: 'admin' | 'operator' | 'viewer' = 'operator') {
  const auth = getFirebaseAuth();
  if (auth) {
    const firebaseUser = await createUserWithEmailAndPassword(auth, email, password);
    if (name.trim()) {
      await updateProfile(firebaseUser.user, { displayName: name.trim() });
    }
  }

  const response = await apiClient.post('/auth/register', { name, email, password, role });
  return storeSession(response.data.data as AuthSession, 'manual');
}

export async function activateDemoSession(role: DemoRole = 'operator') {
  const response = await apiClient.post('/auth/demo', { role });
  return storeSession(response.data.data as AuthSession, 'demo');
}

export async function fetchDemoAccounts() {
  const response = await apiClient.get('/auth/demo/accounts');
  return response.data.data as DemoAccount[];
}

export async function ensureDemoSession() {
  const storedToken = getStoredToken();
  if (storedToken) {
    return storedToken;
  }

  const session = await activateDemoSession();
  return session.token;
}

export async function fetchCurrentUser() {
  const response = await apiClient.get('/auth/me');
  return response.data.data as AuthUser;
}

export async function signOut() {
  const auth = getFirebaseAuth();
  if (auth?.currentUser) {
    await auth.signOut();
  }

  clearStoredAuthState();
}

export function canUseFirebaseAuth() {
  return isFirebaseConfigured();
}
