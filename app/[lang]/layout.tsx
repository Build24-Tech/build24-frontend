import { SUPPORTED_LANGUAGES, getDefaultLanguage } from '@/lib/language-utils';
import { UserLanguage } from '@/types/user';
import { ReactNode } from 'react';

export default async function LangLayout({
  params,
  children,
}: {
  params: Promise<{ lang: UserLanguage }>;
  children: ReactNode;
}) {
  const { lang } = await params;
  // Fallback safety on unsupported lang (should not happen because of middleware)
  const currentLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : getDefaultLanguage();

  return (
    <html lang={currentLang}>
      <body>{children}</body>
    </html>
  );
}
