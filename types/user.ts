export type UserStatus = 'active' | 'inactive' | 'onboarding';

export type UserLanguage = 'en' | 'cn' | 'jp' | 'vn';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  status: UserStatus;
  emailUpdates: boolean;
  language: UserLanguage;
  createdAt: number;
  updatedAt: number;
}
