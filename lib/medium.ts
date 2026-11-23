import { cacheLife } from "next/cache";
import { blogs as fallbackBlogs, MEDIUM_FEED_URL } from "@/content/blogs";
import type { Blog } from "@/lib/types";

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));

function summarise(html: string): string {
  const paras = [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => decode(m[1].replace(/<[^>]+>/g, "")).trim());
  const text = paras.find((p) => p.length > 60) ?? paras[0] ?? "";
  return text.length > 170 ? text.slice(0, 167).trimEnd() + "…" : text;
}

function parseFeed(xml: string): Blog[] {
  return xml
    .split("<item>")
    .slice(1)
    .flatMap((item) => {
      const title = item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1];
      const link = item.match(/<link>(.*?)<\/link>/)?.[1];
      if (!title || !link) return [];
      const content = item.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1] ?? "";
      const image = content.match(/<img[^>]+src="(https:\/\/cdn-images-1\.medium\.com[^"]+)"/)?.[1];
      const date = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];
      return [
        {
          title: decode(title),
          url: link.split("?")[0],
          summary: summarise(content),
          image,
          published: date ? new Date(date).toISOString() : undefined,
        },
      ];
    });
}

/**
 * Latest Medium posts, read from the public RSS feed (title, link, summary, feature image).
 * Cached for an hour; falls back to the hand-written list in content/blogs.ts if Medium is unreachable.
 */
export async function getBlogs(): Promise<Blog[]> {
  "use cache";
  cacheLife("hours");
  try {
    const res = await fetch(MEDIUM_FEED_URL, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return fallbackBlogs;
    const posts = parseFeed(await res.text());
    return posts.length ? posts : fallbackBlogs;
  } catch {
    return fallbackBlogs;
  }
}
