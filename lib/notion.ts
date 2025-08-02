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
    const customUrl = properties["Custom URL"]?.rich_text?.[0]?.plain_text ||
      properties["Custom URL"]?.url ||
      undefined;


    const generatedSlug = fullTitle
      .replace(/[^a-zA-Z0-9]+/g, "-") // Replace any non-alphanumeric chars with dash, preserve case
      .replace(/-+/g, "-") // collapse multiple dashes
      .replace(/^-+|-+$/g, "") || // Remove leading/trailing dashes
      "untitled";

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
    };

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
