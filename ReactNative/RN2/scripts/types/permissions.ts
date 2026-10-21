export type PermissionType = 'camera' | 'location' | 'biometrics';

export type PermissionStatusName = 'granted' | 'denied' | 'undetermined' | 'unsupported';

export interface PermissionState {
  type: PermissionType;
  status: PermissionStatusName;
  canAskAgain: boolean;
  isGranted: boolean;
  isLoading: boolean;
}
