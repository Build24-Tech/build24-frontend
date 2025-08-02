import { UserLanguage } from '@/types/user';
import HomePage from '../page';

export default async function LangHome({ params }: { params: Promise<{ lang: UserLanguage }> }) {
  const { lang } = await params;
  return <HomePage />;
}
