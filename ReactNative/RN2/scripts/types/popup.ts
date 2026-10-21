export type PopupType = 'success' | 'error' | 'warning' | 'info';

export interface PopupAction {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
}

export interface PopupOptions {
  type: PopupType;
  title: string;
  message: string;
  actions?: PopupAction[];
  dismissible?: boolean;
}

export interface PopupState extends PopupOptions {
  visible: boolean;
}
