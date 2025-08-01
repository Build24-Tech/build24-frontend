import { UserLanguage } from '@/types/user';
import BlogPage from '../../blog/page';

export default async function LangBlogPage({
  params,
  searchParams,
}: {
  params: { lang: UserLanguage };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Pass through searchParams (without ?lang)
  return await BlogPage({ searchParams });
}
