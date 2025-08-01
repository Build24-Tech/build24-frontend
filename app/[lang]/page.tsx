import { UserLanguage } from '@/types/user';
import HomePage from '../page';

export default function LangHome({ params }: { params: { lang: UserLanguage } }) {
  return <HomePage />;
}
