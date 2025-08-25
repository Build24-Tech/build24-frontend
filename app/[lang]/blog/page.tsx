import ClientBlogWrapper from '@/components/blog/ClientBlogWrapper';
import Hero from '@/components/blog/Hero';
import { Button } from '@/components/ui/button';
import { filterPostsByLanguage, getUserLanguage, SUPPORTED_LANGUAGES } from '@/lib/language-utils';
import { fetchPublishedPosts, getPost, Post } from '@/lib/notion';
import { UserLanguage } from '@/types/user';

export async function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((lang) => ({
    lang,
  }));
}

export default async function LangBlogPage({
  params,
}: {
  params: Promise<{ lang: UserLanguage }>;
}) {
  const { lang } = await params;
  const currentLanguage = getUserLanguage(lang);

  // Fetch real data from Notion
  let blogPosts: Post[] = [];

  try {
    const response = await fetchPublishedPosts();
    blogPosts = await Promise.all(
      response.results.map((page: any) => getPost(page.id))
    ).then(posts => posts.filter((post): post is Post => post !== null));

    // Filter posts by language
    blogPosts = filterPostsByLanguage(blogPosts, currentLanguage);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    // Will render the page with an empty array of posts
  }

  return (
    <div className="min-h-screen dark:bg-black dark:text-white bg-white text-black">
      <Hero currentLanguage={currentLanguage} />

      <div id="blog-posts" className="container mx-auto px-4 py-16">
        {/* Blog Filter and Grid Components */}
        <ClientBlogWrapper initialPosts={blogPosts} currentLanguage={currentLanguage} />

        {/* Load More Button */}
        {blogPosts.length > 0 && (
          <div className="text-center mt-12">
            <Button className="bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer select-none">
              Load More Posts
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
