import Hero from '@/components/blog/Hero';
import ClientBlogWrapper from '@/components/blog/ClientBlogWrapper';
import { Button } from '@/components/ui/button';
import { fetchPublishedPosts, getPost, Post } from '@/lib/notion';

export default async function BlogPage() {
  // Fetch real data from Notion
  let blogPosts: Post[] = [];
  
  try {
    const response = await fetchPublishedPosts();
    blogPosts = await Promise.all(
      response.results.map((page: any) => getPost(page.id))
    ).then(posts => posts.filter((post): post is Post => post !== null));
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    // Will render the page with an empty array of posts
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="w-full h-[400px]">
        <Hero />
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Blog Filter and Grid Components */}
        <ClientBlogWrapper initialPosts={blogPosts} />
        
        {/* Load More Button */}
        {blogPosts.length > 0 && (
          <div className="text-center mt-12">
            <Button className="bg-yellow-400 text-black hover:bg-yellow-500">
              Load More Posts
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
