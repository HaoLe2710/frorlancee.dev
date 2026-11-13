import type { APIRoute } from "astro";
import { getEmDashCollection, getSiteSettings } from "emdash";

export const GET: APIRoute = async ({ site, url }) => {
  const siteUrl = (site?.toString() || url.origin).replace(/\/$/, "");
  const settings = await getSiteSettings();
  const siteTitle = typeof settings?.title === "string" ? settings.title : "Frorlancee Dev";
  const siteDescription = typeof settings?.tagline === "string" ? settings.tagline : "Ghi chú về sản phẩm số, kỹ thuật và quy trình phát triển.";
  const { entries: posts, error } = await getEmDashCollection("posts", {
    orderBy: { published_at: "desc" },
    limit: 30,
  });
  if (error) console.error("Unable to load public articles for RSS.");

  const items = posts.flatMap((post) => {
    const publishedAt = post.data.publishedAt;
    if (!publishedAt) return [];
    const postUrl = `${siteUrl}/blog/${encodeURIComponent(post.id)}`;
    return [`    <item>
      <title>${escapeXml(post.data.title || "Bài viết")}</title>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
      <pubDate>${new Date(publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(post.data.excerpt || "")}</description>
    </item>`];
  }).join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <description>${escapeXml(siteDescription)}</description>
    <link>${escapeXml(siteUrl)}</link>
    <atom:link href="${escapeXml(`${siteUrl}/rss.xml`)}" rel="self" type="application/rss+xml"/>
    <language>vi-vn</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};

const XML_ESCAPE_PATTERNS = [
  [/&/g, "&amp;"],
  [/</g, "&lt;"],
  [/>/g, "&gt;"],
  [/\"/g, "&quot;"],
  [/'/g, "&apos;"],
] as const;

function escapeXml(value: string): string {
  return XML_ESCAPE_PATTERNS.reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), value);
}
