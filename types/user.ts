export type UserStatus = 'active' | 'inactive' | 'onboarding';

export type UserLanguage = 'en' | 'cn' | 'jp' | 'vn';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  status: UserStatus;
  emailUpdates: boolean;
  language: UserLanguage;
  theme: ThemePreference;
  createdAt: number;
  updatedAt: number;
}
