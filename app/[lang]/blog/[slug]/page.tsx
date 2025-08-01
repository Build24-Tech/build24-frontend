import { UserLanguage } from '@/types/user';
import BlogPost from '../../../blog/[slug]/page';

export default async function LangBlogPost({
  params,
  searchParams,
}: {
  params: { lang: UserLanguage; slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { slug } = params;
  return await BlogPost({ params: { slug }, searchParams });
}
