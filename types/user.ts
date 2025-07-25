export type UserStatus = 'active' | 'inactive' | 'onboarding';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  status: UserStatus;
  emailUpdates: boolean;
  createdAt: number;
  updatedAt: number;
}
