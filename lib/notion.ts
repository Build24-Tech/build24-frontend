import { Client } from "@notionhq/client";
import { PageObjectResponse } from "@notionhq/client/";
import { NotionToMarkdown } from "notion-to-md";

export const notion = new Client({ auth: process.env.NOTION_TOKEN });
export const n2m = new NotionToMarkdown({ notionClient: notion });

export type PostLanguage = 'en' | 'cn' | 'jp' | 'vn';

export interface Post {
  id: string;
  title: string;
  slug: string;
  customUrl?: string;
  coverImage?: string;
  description: string;
  date: string;
  content: string;
  author?: string;
  tags?: string[];
  category?: string;
  language: PostLanguage;
  relatedOrigin?: string; // ID of the original post (usually English version)
}

export async function getDatabaseStructure() {
  const database = await notion.databases.retrieve({
    database_id: process.env.NOTION_DATABASE_ID!,
  });
  return database;
}

export function getWordCount(content: string): number {
  const cleanText = content
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleanText.split(" ").length;
}

export async function fetchPublishedPosts() {
  const posts = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: {
      and: [
        {
          property: "Status",
          status: {
            equals: "Published",
          },
        },
      ],
    },
    sorts: [
      {
        property: "Published Date",
        direction: "descending",
      },
    ],
  });

  return posts;
}

export async function getPost(pageId: string): Promise<Post | null> {
  try {
    const page = (await notion.pages.retrieve({
      page_id: pageId,
    })) as PageObjectResponse;
    const mdBlocks = await n2m.pageToMarkdown(pageId);
    const { parent: contentString } = n2m.toMarkdownString(mdBlocks);

    // Get first paragraph for description (excluding empty lines)
    const paragraphs = contentString
      .split("\n")
      .filter((line: string) => line.trim().length > 0);
    const firstParagraph = paragraphs[0] || "";
    const description =
      firstParagraph.slice(0, 160) + (firstParagraph.length > 160 ? "..." : "");

    const properties = page.properties as any;
    // Join all rich text segments for the complete title
    const rawTitle = (properties.Title?.title ?? [])
      .map((t: any) => t.plain_text)
      .join(" ") // preserve spaces between rich text segments
      .replace(/\s+/g, " ") // collapse consecutive whitespace
      .trim();
    // Process the title, preserving numbers while only removing single-letter words if necessary
    const fullTitle = rawTitle
      // .replace(/\b[a-zA-Z]\b/g, "") // Commented out: previously removed single-letter words including numbers
      .replace(/\s+/g, " ")
      .trim() || "Untitled";
    // Get custom URL if available, otherwise generate slug from title
    const rawCustomUrl = properties["Custom URL"]?.rich_text?.[0]?.plain_text ||
      properties["Custom URL"]?.url ||
      undefined;

    // Format custom URL to be URL-friendly (like slug generation)
    const customUrl = rawCustomUrl ?
      rawCustomUrl
        .toLowerCase()
        // Vietnamese character normalization
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[đĐ]/g, 'd') // Replace đ/Đ with d
        .replace(/\//g, '-') // Replace forward slashes with hyphens
        .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove other special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Collapse multiple hyphens
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
        .trim() :
      undefined;


    const generatedSlug = fullTitle
      .toLowerCase()
      // Vietnamese character normalization
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[đĐ]/g, 'd') // Replace đ/Đ with d
      .replace(/\//g, '-') // Replace forward slashes with hyphens
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove other special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Collapse multiple hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .trim() || "untitled";

    const post: Post = {
      id: page.id,
      title: fullTitle,
      slug: generatedSlug,
      customUrl,
      coverImage: properties["Featured Image"]?.url || undefined,
      description,
      date:
        properties["Published Date"]?.date?.start || new Date().toISOString(),
      content: contentString,
      author: properties.Author?.people[0]?.name,
      tags: properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
      category: properties.Category?.select?.name,
      language: (properties.Language?.select?.name as PostLanguage) || 'en',
      relatedOrigin: properties["Related Origin"]?.relation?.[0]?.id || undefined,
    };



    return post;

    return post;
  } catch (error) {
    console.error("Error getting post:", error);
    return null;
  }
}

export async function getPosts(): Promise<Post[]> {
  try {
    const response = await fetchPublishedPosts();
    const posts = await Promise.all(
      response.results.map((page) => getPost(page.id))
    );
    return posts.filter((post): post is Post => post !== null);
  } catch (error) {
    console.error("Error getting posts:", error);
    return [];
  }
}

/**
 * Find related posts across different languages
 * @param currentPost The current post
 * @param allPosts All available posts
 * @returns Object with language keys and related post IDs
 */
export function findRelatedPosts(currentPost: Post, allPosts: Post[]): Record<PostLanguage, string | null> {
  const related: Record<PostLanguage, string | null> = {
    en: null,
    cn: null,
    jp: null,
    vn: null,
  };

  // Strategy: Find all posts that are related through any connection
  const relatedPostIds = new Set<string>();

  // Add current post
  relatedPostIds.add(currentPost.id);

  // Add posts that current post points to
  if (currentPost.relatedOrigin) {
    relatedPostIds.add(currentPost.relatedOrigin);
  }

  // Add posts that point to current post
  const postsPointingToCurrent = allPosts.filter(post => post.relatedOrigin === currentPost.id);
  postsPointingToCurrent.forEach(post => relatedPostIds.add(post.id));

  // If current post has a relatedOrigin, also add posts that point to that origin
  if (currentPost.relatedOrigin) {
    const postsPointingToOrigin = allPosts.filter(post => post.relatedOrigin === currentPost.relatedOrigin);
    postsPointingToOrigin.forEach(post => relatedPostIds.add(post.id));
  }

  // Map all related posts to their languages
  allPosts.forEach(post => {
    if (relatedPostIds.has(post.id)) {
      related[post.language] = post.id;
    }
  });

  return related;
}

/**
 * Get the best available post for a specific language
 * @param targetLanguage The desired language
 * @param relatedPosts Object with language keys and post IDs
 * @param allPosts All available posts
 * @returns The post in the target language, or the English version as fallback
 */
export function getBestPostForLanguage(
  targetLanguage: PostLanguage,
  relatedPosts: Record<PostLanguage, string | null>,
  allPosts: Post[]
): Post | null {
  // Try to get the post in the target language
  const targetPostId = relatedPosts[targetLanguage];
  if (targetPostId) {
    const targetPost = allPosts.find(post => post.id === targetPostId);
    if (targetPost) return targetPost;
  }

  // Fallback to English version
  const englishPostId = relatedPosts.en;
  if (englishPostId) {
    const englishPost = allPosts.find(post => post.id === englishPostId);
    if (englishPost) return englishPost;
  }

  return null;
}
