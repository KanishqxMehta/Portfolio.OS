import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  content: string;
  readingTime?: string;
  image?: string;
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  const files = fs.readdirSync(BLOG_DIR);
  
  const posts = files
    .filter((filename) => filename.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const fullPath = path.join(BLOG_DIR, filename);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);
      
      return {
        slug,
        title: data.title || slug,
        date: data.date || new Date().toISOString(),
        description: data.description || "",
        content,
        readingTime: data.readingTime,
        image: data.image,
      };
    })
    .sort((a, b) => (new Date(b.date).getTime() > new Date(a.date).getTime() ? 1 : -1));

  return posts;
}

export function getPostBySlug(slug: string): BlogPost | null {
  const fullPath = path.join(BLOG_DIR, `${slug}.mdx`);
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  
  return {
    slug,
    title: data.title || slug,
    date: data.date || new Date().toISOString(),
    description: data.description || "",
    content,
    readingTime: data.readingTime,
    image: data.image,
  };
}
