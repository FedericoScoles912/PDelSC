/**
 * Definiciones globales de tipos e interfaces TypeScript (Strict Mode)
 */

export interface User {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
}

export interface LoginCredentials {
  usuario: string;
  password: string;
}

export interface LoginSuccessResponse {
  ok: true;
  usuario: User;
}

export interface LoginErrorResponse {
  ok: false;
  mensaje: string;
}

export type LoginApiResponse = LoginSuccessResponse | LoginErrorResponse;

export type PopupType = 'error' | 'success' | 'info';

export interface PopupState {
  visible: boolean;
  type: PopupType;
  title: string;
  message: string;
  buttonText?: string;
  onClose?: () => void;
}

export interface ShowPopupParams {
  type: PopupType;
  title: string;
  message: string;
  buttonText?: string;
  onClose?: () => void;
}

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface ResponsiveColSpan {
  xs?: ColSpan;
  sm?: ColSpan;
  md?: ColSpan;
  lg?: ColSpan;
  xl?: ColSpan;
  xxl?: ColSpan;
}
